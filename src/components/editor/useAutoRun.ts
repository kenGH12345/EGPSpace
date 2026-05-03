import { useEffect, useRef } from 'react';
import { type EditorState, bundleFromState, runEditorBundle, extractPerComponent } from '@/lib/editor';

export function useAutoRun(
  state: EditorState,
  onResult: (per: Record<string, Record<string, unknown>>, msg: string) => void,
  onStatus: (msg: string) => void
) {
  // Use a ref to store the last stringified representation of the relevant physical state.
  const lastStateStrRef = useRef<string>('');

  useEffect(() => {
    // Extract only physical properties (ignore anchor, selection, hoveredId, etc.)
    const physicalState = {
      domain: state.domain,
      placed: state.placed.map((p) => ({
        id: p.id,
        kind: p.kind,
        props: p.props,
      })),
      connections: state.connections,
      macros: state.macros,
    };

    const currentStateStr = JSON.stringify(physicalState);

    // If physical state hasn't changed, do nothing.
    if (currentStateStr === lastStateStrRef.current) {
      console.log('[useAutoRun] state unchanged, skipping');
      return;
    }

    lastStateStrRef.current = currentStateStr;
    console.log('[useAutoRun] state changed, scheduling run...');

    // We do have a change. Debounce the execution.
    const timerId = setTimeout(async () => {
      onStatus('运行中...');
      const bundle = bundleFromState(state);
      console.log('[useAutoRun] running bundle:', bundle);
      const r = await runEditorBundle(state.domain, bundle, state.macros);
      console.log('[useAutoRun] run result:', r);
      
      if (!r.ok || !r.result) {
        onStatus(`运行失败: ${r.error ?? 'unknown'}`);
        console.log('[useAutoRun] run failed:', r.error);
        return;
      }
      if (r.result.state === 'error') {
        const msg = (r.result.values.errorMessage as string) ?? r.result.explanation ?? 'error';
        onStatus(`引擎返回错误: ${msg}`);
        console.log('[useAutoRun] engine error:', msg);
        return;
      }
      const perC = extractPerComponent(r.result);
      console.log('[useAutoRun] per-component:', perC);
      onResult(perC, `已运行 · state=${r.result.state}`);
    }, 150);

    return () => clearTimeout(timerId);
  }, [state, onResult, onStatus]);
}
