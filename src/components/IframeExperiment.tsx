'use client';

/**
 * IframeExperiment — Triple-Lock Architecture iframe container.
 *
 * Responsibilities:
 *  1. Load an approved HTML template by ID (whitelist enforced via getTemplate)
 *  2. Provide a sandboxed iframe with origin-checked postMessage bus
 *  3. Expose param-sync + results callback API to parent React components
 *  4. Show skeleton UI during load and friendly fallback on error
 *
 * Security boundaries:
 *  - Only templates registered as auditStatus='approved' will load
 *  - Messages are rejected unless event.origin === window.location.origin
 *  - Messages are rejected unless validateIncomingMessage() returns non-null
 *  - iframe is sandboxed with allow-scripts + allow-same-origin only
 *    (allow-same-origin needed for origin-equality check; scripts required to run template)
 *  - Templates cannot navigate parent or open popups (no allow-top-navigation etc.)
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getTemplate, validateTemplateFile, type TemplateMetadata } from '@/lib/template-registry';
import {
  validateIncomingMessage,
  MESSAGE_SOURCE,
  type ExperimentMessage,
  type HostCommand,
} from '@/lib/experiment-message-schema';
import { registry } from '@/lib/engines/registry';
// Side-effect import: ensures all engines are auto-registered before compute dispatch.
import '@/lib/engines';

export interface IframeExperimentProps {
  /** Approved template ID — must be in the template registry whitelist. */
  templateId: string;
  /** Called when the iframe successfully loads AND template reports ready. */
  onReady?: (template: TemplateMetadata) => void;
  /** Called on every message the template emits (already validated). */
  onMessage?: (msg: ExperimentMessage) => void;
  /** Called when template reports ready with metadata (e.g. formulas). */
  onMetadataChange?: (metadata: Record<string, unknown>) => void;
  /** Optional initial parameter values to send after ready. */
  initialParams?: Record<string, number>;
  /** Extra CSS class for outer wrapper. */
  className?: string;
  /** Height in px (default 900). */
  height?: number;
}

const LOAD_TIMEOUT_MS = 8000;

export function IframeExperiment({
  templateId,
  onReady,
  onMessage,
  onMetadataChange,
  initialParams,
  className,
  height = 900,
}: IframeExperimentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resolve template through the whitelist — if not approved, we fail fast.
  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const templateUrl = template ? `/templates/${template.templatePath}` : null;

  // Runtime template validation — fetch and verify HTML structure before iframe load
  useEffect(() => {
    if (!templateUrl) return;

    let cancelled = false;

    fetch(templateUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        if (cancelled) return;
        const errors = validateTemplateFile(html);
        if (errors.length > 0) {
          const criticalErrors = errors.filter((e) => !e.includes('optional'));
          if (criticalErrors.length > 0) {
            setStatus('error');
            setErrorMsg(
              `模板格式错误: ${criticalErrors.join('; ')}`
            );
            if (process.env.NODE_ENV !== 'production') {
              console.error('[IframeExperiment] Template validation failed:', criticalErrors);
            }
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(`模板加载失败: ${err.message}`);
      });

    return () => { cancelled = true; };
  }, [templateUrl]);

  // Send a host command to the iframe. Commands are validated by the template side.
  const sendCommand = useCallback(
    (command: HostCommand) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(command, window.location.origin);
    },
    [],
  );

  // Message listener with origin + schema validation (Triple-Lock security boundary).
  useEffect(() => {
    if (!template) return;

    const handler = (event: MessageEvent) => {
      // 1. Origin check — reject messages from other origins (XSS boundary)
      if (event.origin !== window.location.origin) return;

      // 2. Source iframe check — only accept from our specific iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      // 3. Schema validation — reject malformed or unknown message types
      const validated = validateIncomingMessage(event.data);
      if (!validated) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[IframeExperiment] Rejected invalid message:', event.data);
        }
        return;
      }

      // 4. Template ID check — reject messages claiming a different templateId
      if (
        validated.type !== 'error' &&
        'templateId' in validated &&
        validated.templateId !== templateId
      ) {
        return;
      }

      // Handle ready separately — triggers onReady + initial param push
      if (validated.type === 'ready') {
        setStatus('ready');
        onReady?.(template);
        if (validated.metadata && Object.keys(validated.metadata).length > 0) {
          onMetadataChange?.(validated.metadata);
        }
        if (initialParams) {
          sendCommand({ source: MESSAGE_SOURCE, type: 'set_params', params: initialParams });
        }
      }

      // Compute RPC — v2-atomic templates delegate compute to L1 engines here
      if (validated.type === 'compute_request') {
        // Fire-and-forget async dispatch; handler itself stays synchronous
        void (async () => {
          const { requestId, engineId, params } = validated;
          try {
            // Accept both 'physics/buoyancy' full IDs and legacy PhysicsEngineType aliases
            const engine = await registry.get(engineId);
            if (!engine) {
              sendCommand({
                source: MESSAGE_SOURCE,
                type: 'compute_error',
                requestId,
                message: `Engine not registered: ${engineId}`,
                code: 'engine_not_found',
              });
              return;
            }
            const validation = engine.validate(params);
            if (!validation.valid) {
              const firstError = validation.errors.find(e => e.severity === 'error');
              if (firstError) {
                sendCommand({
                  source: MESSAGE_SOURCE,
                  type: 'compute_error',
                  requestId,
                  message: `${firstError.field}: ${firstError.message}`,
                  code: 'validation_failed',
                });
                return;
              }
              // Only warnings — continue to compute
            }
            const result = engine.compute(params);
            sendCommand({
              source: MESSAGE_SOURCE,
              type: 'compute_result',
              requestId,
              values: result.values,
              state: result.state,
              explanation: result.explanation,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            sendCommand({
              source: MESSAGE_SOURCE,
              type: 'compute_error',
              requestId,
              message,
              code: 'compute_exception',
            });
          }
        })();
      }

      if (validated.type === 'error') {
        setStatus('error');
        setErrorMsg(validated.message);
      }

      onMessage?.(validated);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [template, templateId, initialParams, onReady, onMessage, sendCommand]);

  // Load-timeout fallback: if the template never reports 'ready', show an error.
  useEffect(() => {
    if (!template || status !== 'loading') return;
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'error' : prev));
      setErrorMsg('实验加载超时，请刷新页面重试');
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [template, status]);

  // Reset status when templateId changes.
  useEffect(() => {
    setStatus('loading');
    setErrorMsg(null);
  }, [templateId]);

  // Unregistered or unapproved template — hard fail early with a clear message.
  if (!template || !templateUrl) {
    return (
      <div
        className={className}
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: 16,
          color: '#9A3412',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>实验模板未找到或尚未审核</div>
          <div style={{ fontSize: 13, color: '#B45309' }}>
            模板 ID <code>{templateId}</code> 不在白名单中
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        background: '#FFF',
        height,
      }}
    >
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)',
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                margin: '0 auto 12px',
                border: '4px solid #F59E0B',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'eureka-spin 1s linear infinite',
              }}
            />
            <div style={{ color: '#92400E', fontSize: 14 }}>
              加载 {template.title}...
            </div>
          </div>
          <style>{`@keyframes eureka-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FEF2F2',
            zIndex: 2,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: '#B91C1C', fontWeight: 600, marginBottom: 4 }}>
              实验加载失败
            </div>
            <div style={{ color: '#7F1D1D', fontSize: 13 }}>
              {errorMsg || '请刷新页面重试'}
            </div>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={templateUrl}
        title={template.title}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('ready')}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

export default IframeExperiment;
