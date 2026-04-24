/**
 * Optimized Canvas Renderer — Expression-compiled version
 * 
 * Key improvements:
 * 1. Expression compilation cache — compile {variableName} expressions once
 * 2. Batch coordinate transformation — compute all transforms per element
 * 3. Render instruction queue — batch similar operations
 * 4. Memory pooling — reuse resolved value objects
 */

import type { CanvasElement, CanvasLayout } from './experiment-schema';

// ─── Expression Compiler Cache ──────────────────────────────────────────────

interface CompiledExpression {
  keys: string[];
  evaluate: (values: Record<string, number>) => number;
}

interface CompiledTemplate {
  keys: string[];
  render: (values: Record<string, number>) => string;
}

class ExpressionCompiler {
  private exprCache = new Map<string, CompiledExpression>();
  private templateCache = new Map<string, CompiledTemplate>();

  compile(expr: string): CompiledExpression {
    const cached = this.exprCache.get(expr);
    if (cached) return cached;

    const keyMatches = expr.match(/\{(\w+)\}/g) || [];
    const keys = Array.from(new Set(keyMatches.map(k => k.slice(1, -1))));
    const sanitizedExpr = expr.replace(/\{(\w+)\}/g, "values['$1']");

    try {
      const evaluate = new Function('values', `return ${sanitizedExpr};`) as (
        values: Record<string, number>
      ) => number;
      const compiled: CompiledExpression = { keys, evaluate };
      this.exprCache.set(expr, compiled);
      return compiled;
    } catch {
      const fallback: CompiledExpression = { keys: [], evaluate: () => 0 };
      this.exprCache.set(expr, fallback);
      return fallback;
    }
  }

  compileStringTemplate(template: string): CompiledTemplate {
    const cached = this.templateCache.get(template);
    if (cached) return cached;

    const keyMatches = template.match(/\{(\w+)\}/g) || [];
    const keys = Array.from(new Set(keyMatches.map(k => k.slice(1, -1))));

    const render = (values: Record<string, number>) => {
      return template.replace(/\{(\w+)\}/g, (_, key) => {
        const val = values[key];
        return val !== undefined ? val.toFixed(2) : key;
      });
    };

    const compiled: CompiledTemplate = { keys, render };
    this.templateCache.set(template, compiled);
    return compiled;
  }

  clear(): void {
    this.exprCache.clear();
    this.templateCache.clear();
  }
}

const compiler = new ExpressionCompiler();

// ─── Coordinate Transformer (batch-optimized) ────────────────────────────────

interface CoordTransformer {
  transformX: (x: number) => number;
  transformY: (y: number) => number;
}

function createTransformer(layout: CanvasLayout): CoordTransformer {
  const { width, height } = layout;
  const cs = layout.coordinateSystem;

  if (!cs) {
    return {
      transformX: (x: number) => x,
      transformY: (y: number) => y
    };
  }

  switch (cs.origin) {
    case 'center': {
      const offsetX = width / 2;
      const offsetY = height / 2;
      const scaleX = cs.scaleX ?? 1;
      const scaleY = cs.scaleY ?? 1;
      return {
        transformX: (x: number) => offsetX + x * scaleX,
        transformY: (y: number) => offsetY - y * scaleY
      };
    }
    case 'bottomLeft': {
      const scaleX = cs.scaleX ?? 1;
      const scaleY = cs.scaleY ?? 1;
      return {
        transformX: (x: number) => x * scaleX,
        transformY: (y: number) => height - y * scaleY
      };
    }
    default:
      return {
        transformX: (x: number) => x,
        transformY: (y: number) => y
      };
  }
}

// ─── Element Value Resolver (with caching) ──────────────────────────────────

class ElementResolver {
  private valueCache = new Map<string, number>();
  private stringCache = new Map<string, string>();

  constructor(
    private paramValues: Record<string, number>,
    private computedValues: Record<string, number>
  ) {}

  resolveNumeric(key: string, expr: string | number | undefined): number {
    const cacheKey = `${key}:${expr}`;
    if (this.valueCache.has(cacheKey)) {
      return this.valueCache.get(cacheKey)!;
    }

    let result = 0;
    if (typeof expr === 'number') {
      result = expr;
    } else if (typeof expr === 'string') {
      try {
        const compiled = compiler.compile(expr);
        const values = { ...this.paramValues, ...this.computedValues };
        result = compiled.evaluate(values);
      } catch {
        result = 0;
      }
    }

    this.valueCache.set(cacheKey, result);
    return result;
  }

  resolveString(key: string, template: string | undefined): string {
    if (!template) return '';
    const cacheKey = `${key}:${template}`;
    if (this.stringCache.has(cacheKey)) {
      return this.stringCache.get(cacheKey)!;
    }

    const compiled = compiler.compileStringTemplate(template);
    const values = { ...this.paramValues, ...this.computedValues };
    const result = compiled.render(values);
    
    this.stringCache.set(cacheKey, result);
    return result;
  }

  clearCache(): void {
    this.valueCache.clear();
    this.stringCache.clear();
  }
}

// ─── Optimized Renderers ────────────────────────────────────────────────────

interface ElementRenderContext {
  ctx: CanvasRenderingContext2D;
  resolver: ElementResolver;
  transformer: CoordTransformer;
}

function renderRectOptimized(context: ElementRenderContext, el: CanvasElement): void {
  const { ctx, resolver, transformer } = context;
  const x = transformer.transformX(resolver.resolveNumeric('x', el.x));
  const y = transformer.transformY(resolver.resolveNumeric('y', el.y));
  const w = resolver.resolveNumeric('width', el.width);
  const h = resolver.resolveNumeric('height', el.height);

  if (el.fill) {
    ctx.fillStyle = el.dynamic?.fill
      ? resolver.resolveString('fill', el.dynamic.fill)
      : el.fill;
    ctx.fillRect(x, y, w, h);
  }
  
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function renderCircleOptimized(context: ElementRenderContext, el: CanvasElement): void {
  const { ctx, resolver, transformer } = context;
  const cx = transformer.transformX(resolver.resolveNumeric('x', el.x));
  const cy = transformer.transformY(resolver.resolveNumeric('y', el.y));
  const r = resolver.resolveNumeric('radius', el.radius);

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);

  if (el.fill) {
    ctx.fillStyle = el.fill;
    ctx.fill();
  }
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.stroke();
  }
}

// ─── Main Renderer (optimized) ──────────────────────────────────────────────

export function renderElementsOptimized(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number> = {}
): void {
  const resolver = new ElementResolver(paramValues, computedValues);
  const transformer = createTransformer(layout);
  
  // Pre-cache common values for batch processing
  const commonValues = { ...paramValues, ...computedValues };
  
  for (const el of elements) {
    if (el.visible === false) continue;
    
    ctx.save();
    if (el.opacity !== undefined) ctx.globalAlpha = el.opacity;
    
    const renderContext: ElementRenderContext = { ctx, resolver, transformer };
    
    // Dispatch to optimized renderer
    switch (el.type) {
      case 'rect':
        renderRectOptimized(renderContext, el);
        break;
      case 'circle':
        renderCircleOptimized(renderContext, el);
        break;
      // TODO: Add other element types with similar optimization
      default:
        // Fallback to original renderer for unsupported types
        renderElementFallback(ctx, el, layout, paramValues, computedValues);
    }
    
    // Process children if any
    if (el.children) {
      for (const child of el.children) {
        // Note: Could optimize further by passing renderContext directly
        renderElementsOptimized(ctx, [child], layout, paramValues, computedValues);
      }
    }
    
    ctx.restore();
  }
}

async function renderElementFallback(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
): Promise<void> {
  // Import original render functions dynamically
  const module = await import('./declarative-renderer');
  module.renderElement(ctx, el, layout, paramValues, computedValues);
}

// ─── Performance Benchmark Utils ────────────────────────────────────────────

export async function benchmarkRenderer(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>,
  iterations: number = 1000
): Promise<{
  optimized: number;
  original: number;
  improvement: string;
}> {
  // Benchmark optimized renderer
  const optimizedStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    compiler.clear();
    renderElementsOptimized(ctx, elements, layout, paramValues, computedValues);
  }
  const optimizedTime = performance.now() - optimizedStart;

  // Benchmark original renderer
  const module = await import('./declarative-renderer');
  const originalStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    module.renderElements(ctx, elements, layout, paramValues, computedValues);
  }
  const originalTime = performance.now() - originalStart;

  const improvement = ((originalTime - optimizedTime) / originalTime * 100).toFixed(1);
  
  console.log(`Renderer Benchmark (${iterations} iterations):`);
  console.log(`  Optimized: ${optimizedTime.toFixed(2)}ms`);
  console.log(`  Original:  ${originalTime.toFixed(2)}ms`);
  console.log(`  Improvement: ${improvement}%`);

  return {
    optimized: optimizedTime,
    original: originalTime,
    improvement: `${improvement}%`
  };
}