/**
 * Assembly layer error types — structured, machine-readable failure signals.
 *
 * Design (D-2 decomposition): errors are structured objects (not just strings)
 * so callers can localise, sort by severity, and drive UIs. The `code` field
 * is stable for programmatic use; `message` is human-facing.
 */

export type AssemblyErrorCode =
  | 'spec_shape_invalid'
  | 'duplicate_component_id'
  | 'unknown_component_kind'
  | 'port_reference_invalid'
  | 'self_connection'
  | 'domain_mismatch'
  | 'floating_port'          // warning, not error
  | 'build_failed';

export type AssemblyErrorSeverity = 'error' | 'warning';

export interface AssemblyError {
  code: AssemblyErrorCode;
  severity: AssemblyErrorSeverity;
  /** Human-readable message (may be localised by caller). */
  message: string;
  /** Path into the spec where the error occurred, e.g. 'components[2].id'. */
  path?: string;
  /** Additional machine-readable context. */
  detail?: Record<string, unknown>;
}

/** Validation result shape shared by validator + builder preflight checks. */
export interface AssemblyValidationResult {
  ok: boolean;
  errors: AssemblyError[];
  warnings: AssemblyError[];
}

/**
 * Thrown by Assembler when a fatal error prevents DomainGraph construction.
 * Distinct from AssemblyError to keep validator's pure-data output separate.
 */
export class AssemblyBuildError extends Error {
  readonly code = 'build_failed' as const;
  readonly errors: AssemblyError[];

  constructor(message: string, errors: AssemblyError[]) {
    super(message);
    this.name = 'AssemblyBuildError';
    this.errors = errors;
  }
}

/** Construct an error object with defaults. */
export function makeError(
  code: AssemblyErrorCode,
  message: string,
  opts: { severity?: AssemblyErrorSeverity; path?: string; detail?: Record<string, unknown> } = {},
): AssemblyError {
  return {
    code,
    severity: opts.severity ?? 'error',
    message,
    path: opts.path,
    detail: opts.detail,
  };
}
