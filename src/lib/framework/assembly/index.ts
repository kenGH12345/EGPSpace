/**
 * Assembly layer — public API barrel.
 *
 * Unified import surface:
 *   import {
 *     AssemblySpec, validateSpec, Assembler, FluentAssembly, AssemblyBuildError
 *   } from '@/lib/framework/assembly';
 *
 * This barrel deliberately exports EVERYTHING from the 4 implementation files;
 * callers pick what they need. Tree-shaking will prune unused exports.
 */

export * from './spec';
export * from './errors';
export * from './validator';
export * from './assembler';
export * from './fluent';
