import { portKey } from '../contracts/port';
import type { MacroPortRef } from '../contracts/layout';

export function macroPortRefKey(ref: MacroPortRef): string {
  return portKey(ref);
}
