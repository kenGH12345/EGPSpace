/**
 * Message Schema — postMessage contract between HTML templates and React host.
 *
 * The host React app (IframeExperiment.tsx) and iframe-loaded HTML templates
 * communicate ONLY through these message shapes. Any message not matching
 * this schema is rejected — part of the Triple-Lock security boundary.
 *
 * Protocol rules:
 *   1. All messages MUST have `source: 'eureka-experiment'` (namespace guard)
 *   2. All messages MUST have a valid `type` from ExperimentMessageType
 *   3. `origin` on incoming events MUST equal window.location.origin
 *   4. Templates can ONLY send — they cannot receive unsolicited code (no eval)
 */

export const MESSAGE_SOURCE = 'eureka-experiment' as const;

/** Message types allowed by the host. Any other type is rejected. */
export type ExperimentMessageType =
  | 'ready'            // template has loaded and is ready to receive params
  | 'param_change'     // user adjusted a slider/input inside the template
  | 'result_update'    // template computed new results (e.g. forces, status)
  | 'interaction'      // user performed a gesture (drag/click) on the canvas
  | 'compute_request'  // template asks host to run L1 engine.compute() (v2-atomic)
  | 'error';           // template encountered a non-recoverable error

/**
 * Base shape all messages share.
 */
interface BaseExperimentMessage {
  source: typeof MESSAGE_SOURCE;
  type: ExperimentMessageType;
  /** ISO timestamp */
  timestamp?: string;
  /** Optional correlation ID for request/response flows */
  requestId?: string;
}

export interface ExperimentFormula {
  title: string;
  expression: string;
  note?: string;
}

/** Template is ready — host may now send initial params. */
export interface ReadyMessage extends BaseExperimentMessage {
  type: 'ready';
  templateId: string;
  /** Parameter names the template supports (for host validation) */
  supportedParams?: string[];
  /** Optional metadata e.g. formulas, principles to display in the host sidebar. */
  metadata?: {
    formulas?: ExperimentFormula[];
    [key: string]: unknown;
  };
}

/** User changed a parameter inside the template. */
export interface ParamChangeMessage extends BaseExperimentMessage {
  type: 'param_change';
  templateId: string;
  /** Parameter name (must match registry). */
  param: string;
  /** New numeric value. */
  value: number;
}

/** Template computed new derived results. */
export interface ResultUpdateMessage extends BaseExperimentMessage {
  type: 'result_update';
  templateId: string;
  /** Keyed by result name. Values must be primitive (number/string/boolean). */
  results: Record<string, number | string | boolean>;
}

/** User performed a non-param interaction (e.g. drag, tap). */
export interface InteractionMessage extends BaseExperimentMessage {
  type: 'interaction';
  templateId: string;
  /** Interaction kind: 'drag-start' / 'drag-end' / 'tap' / 'mode-switch' etc. */
  kind: string;
  /** Optional payload (kept small for security). */
  data?: Record<string, number | string | boolean>;
}

/** Template hit a non-recoverable error. */
export interface ErrorMessage extends BaseExperimentMessage {
  type: 'error';
  templateId: string;
  message: string;
  code?: string;
}

/**
 * Template asks the host to run a registered L1 engine's compute() on its behalf.
 * Host replies with ComputeResultCommand (success) or ComputeErrorCommand (failure),
 * correlated via requestId. This enables v2-atomic templates to delegate all physics/
 * chemistry calculation to L1 engines instead of duplicating formulas inline.
 */
export interface ComputeRequestMessage extends BaseExperimentMessage {
  type: 'compute_request';
  templateId: string;
  /** Correlation ID — host echoes it back so templates can match response to request. */
  requestId: string;
  /** Engine identifier, e.g. 'physics/buoyancy' or a PhysicsEngineType value. */
  engineId: string;
  /** Numeric parameters for engine.compute(). */
  params: Record<string, number>;
}

export type ExperimentMessage =
  | ReadyMessage
  | ParamChangeMessage
  | ResultUpdateMessage
  | InteractionMessage
  | ComputeRequestMessage
  | ErrorMessage;

/**
 * Messages the HOST sends TO the template.
 * Templates only accept these command types; any unknown command is ignored.
 */
export type HostCommandType =
  | 'set_param'
  | 'set_params'
  | 'reset'
  | 'highlight'
  | 'compute_result'   // host reply with engine.compute() success payload
  | 'compute_error';   // host reply indicating engine.compute() failed or engine not found

export interface SetParamCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'set_param';
  param: string;
  value: number;
}

export interface SetParamsCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'set_params';
  /** Partial param name → value map */
  params: Record<string, number>;
}

export interface ResetCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'reset';
}

export interface HighlightCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'highlight';
  /** Target element id or param name */
  target: string;
  /** Optional duration in ms */
  durationMs?: number;
}

/** Host reply to a successful ComputeRequestMessage (v2-atomic protocol). */
export interface ComputeResultCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'compute_result';
  /** Echoed from the request. Templates MUST check this before applying results. */
  requestId: string;
  /** Mirrors ComputationResult.values from L1 engine. */
  values: Record<string, number | string | boolean | object>;
  /** Mirrors ComputationResult.state. */
  state?: string;
  /** Mirrors ComputationResult.explanation. */
  explanation?: string;
}

/** Host reply when compute failed (engine missing, validation failed, exception). */
export interface ComputeErrorCommand {
  source: typeof MESSAGE_SOURCE;
  type: 'compute_error';
  requestId: string;
  message: string;
  code?: string;
}

export type HostCommand =
  | SetParamCommand
  | SetParamsCommand
  | ResetCommand
  | HighlightCommand
  | ComputeResultCommand
  | ComputeErrorCommand;

/** Whitelist of valid incoming message types. */
const VALID_INCOMING_TYPES: ReadonlySet<ExperimentMessageType> = new Set([
  'ready',
  'param_change',
  'result_update',
  'interaction',
  'compute_request',
  'error',
]);

/**
 * Validate an incoming message from an iframe.
 *
 * Returns the typed message if valid, null otherwise.
 * Caller MUST additionally verify event.origin === window.location.origin
 * before trusting the message.
 */
export function validateIncomingMessage(data: unknown): ExperimentMessage | null {
  if (!data || typeof data !== 'object') return null;

  const msg = data as Record<string, unknown>;

  // Namespace guard — prevents accidental cross-talk with other iframes
  if (msg.source !== MESSAGE_SOURCE) return null;

  // Type whitelist — hard rejection of unknown types
  if (typeof msg.type !== 'string') return null;
  if (!VALID_INCOMING_TYPES.has(msg.type as ExperimentMessageType)) return null;

  // templateId is required for all typed messages except pure errors
  if (msg.type !== 'error' && typeof msg.templateId !== 'string') return null;

  // Additional shape checks per type
  switch (msg.type) {
    case 'param_change':
      if (typeof msg.param !== 'string' || typeof msg.value !== 'number') return null;
      if (!Number.isFinite(msg.value)) return null;
      break;
    case 'result_update':
      if (!msg.results || typeof msg.results !== 'object') return null;
      break;
    case 'interaction':
      if (typeof msg.kind !== 'string') return null;
      break;
    case 'compute_request':
      if (typeof msg.requestId !== 'string' || msg.requestId.length === 0) return null;
      if (typeof msg.engineId !== 'string' || msg.engineId.length === 0) return null;
      if (!msg.params || typeof msg.params !== 'object') return null;
      // Recursively validate params: every leaf must be a finite number, string, or boolean.
      // Nested objects/arrays are allowed (e.g. graph DTOs for component-based engines).
      // Rejects NaN/Infinity, functions, symbols, cycles (via depth limit).
      if (!isJsonSafePayload(msg.params, 0)) return null;
      break;
    case 'error':
      if (typeof msg.message !== 'string') return null;
      break;
    // 'ready' has minimal shape, already checked
  }

  return msg as unknown as ExperimentMessage;
}

/**
 * Recursively validate that a payload is JSON-safe and free of security hazards.
 *  - Leaves MUST be finite number | string | boolean | null
 *  - Objects and arrays are allowed up to MAX_DEPTH (cycle protection)
 *  - Functions, symbols, BigInts, NaN, Infinity are rejected
 *  - undefined is rejected at leaf level (use null instead)
 *
 * Used by validateIncomingMessage for compute_request's `params` field which may
 * carry nested graph DTOs (v2-atomic component-based engines).
 */
const MAX_PAYLOAD_DEPTH = 16;

function isJsonSafePayload(value: unknown, depth: number): boolean {
  if (depth > MAX_PAYLOAD_DEPTH) return false;

  if (value === null) return true;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return true;
  if (t === 'number') return Number.isFinite(value as number);
  if (t === 'function' || t === 'symbol' || t === 'bigint' || t === 'undefined') return false;

  if (Array.isArray(value)) {
    for (const v of value) {
      if (!isJsonSafePayload(v, depth + 1)) return false;
    }
    return true;
  }

  if (t === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (!isJsonSafePayload(v, depth + 1)) return false;
    }
    return true;
  }

  return false;
}

