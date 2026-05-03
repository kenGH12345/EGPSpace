import type { AssemblySpec, ComponentDecl, ConnectionDecl, SpecPortRef } from '../contracts/assembly';
import type { MacroDefinition, MacroPortRef } from '../contracts/layout';

// Re-export MacroDefinition so existing imports `from '@/lib/framework/macro/flattener'`
// keep working. The canonical definition lives in contracts/layout.ts (shared
// between Bundle persistence and the flattener).
export type { MacroDefinition };

export interface MacroResolver {
  resolve(kind: string): MacroDefinition | undefined;
}

export class SpecFlattener {
  constructor(private readonly resolver: MacroResolver) {}

  /**
   * Flattens an AssemblySpec containing macro components into a pure atomic AssemblySpec.
   * Resolves nested macros recursively.
   */
  public flatten(spec: AssemblySpec): AssemblySpec {
    return this._flattenRecursive(spec, new Set());
  }

  private _flattenRecursive(spec: AssemblySpec, visitedMacros: Set<string>, prefix: string = ''): AssemblySpec {
    const flatComponents: ComponentDecl[] = [];
    const flatConnections: ConnectionDecl[] = [];

    // Map: [componentId in this spec scope] -> MacroDefinition (if it was a macro)
    const macroInstances = new Map<string, MacroDefinition>();

    // 1. Process components
    for (const comp of spec.components) {
      const macroDef = this.resolver.resolve(comp.kind);
      
      if (macroDef) {
        // Cycle detection
        if (visitedMacros.has(comp.kind)) {
          throw new Error(`Circular macro dependency detected: ${comp.kind}`);
        }
        
        macroInstances.set(comp.id, macroDef);

        const nextVisited = new Set(visitedMacros);
        nextVisited.add(comp.kind);

        const instancePrefix = prefix ? `${prefix}${comp.id}_` : `${comp.id}_`;
        
        // Recursively flatten the macro's internal spec
        const subFlat = this._flattenRecursive(macroDef.spec, nextVisited, instancePrefix);
        
        // Add all flattened internal components
        flatComponents.push(...subFlat.components);
        
        // Add all flattened internal connections
        flatConnections.push(...subFlat.connections);
      } else {
        // Atomic component
        flatComponents.push({
          ...comp,
          id: prefix + comp.id
        });
      }
    }

    // 2. Process connections in the current scope
    for (const conn of spec.connections) {
      const flatFrom = this._resolvePort(conn.from, macroInstances, prefix);
      const flatTo = this._resolvePort(conn.to, macroInstances, prefix);

      flatConnections.push({
        from: flatFrom,
        to: flatTo,
        kind: conn.kind
      });
    }

    return {
      domain: spec.domain,
      components: flatComponents,
      connections: flatConnections,
      metadata: spec.metadata
    };
  }

  private _resolvePort(
    portRef: SpecPortRef, 
    macroInstances: Map<string, MacroDefinition>, 
    prefix: string
  ): SpecPortRef {
    const macroDef = macroInstances.get(portRef.componentId);
    
    if (macroDef) {
      // It's connecting to a macro, we need to map to the internal port
      const internalMapping = macroDef.exportPortMap[portRef.portName];
      if (!internalMapping) {
        throw new Error(`Macro instance "${portRef.componentId}" does not export port "${portRef.portName}"`);
      }
      
      // The internal component itself might have been renamed with the instance prefix
      // So we apply prefix + macroInstanceId + _ + internalCompId
      const newPrefix = prefix ? `${prefix}${portRef.componentId}_` : `${portRef.componentId}_`;
      
      // Note: we don't handle deep port mapping here recursively for the connection resolution,
      // because the internalMapping points to a component inside the immediate macro scope.
      // If THAT component is also a macro, its internal connection would have been resolved 
      // during the _flattenRecursive of that macro, but wait!
      // The connection comes from the PARENT scope, targeting the macro's exported port.
      // The exported port points to an internal ID. We just replace it with the fully prefixed internal ID.
      // What if that internal ID is ALSO a macro? 
      // In our design, exportPortMap must point to the FINAL atomic port, OR we recursively resolve it.
      // For simplicity, we assume exportPortMap points to an immediate child component. 
      // If that child is a macro, we need to recursively resolve the port again.
      return this._resolveDeepPort(internalMapping, macroDef.spec, newPrefix);
    }
    
    // Atomic component port, just apply prefix
    return {
      componentId: prefix + portRef.componentId,
      portName: portRef.portName
    };
  }

  private _resolveDeepPort(
    ref: MacroPortRef,
    scopeSpec: AssemblySpec, 
    prefix: string
  ): SpecPortRef {
    // Find the component in the macro's spec
    const comp = scopeSpec.components.find(c => c.id === ref.componentId);
    if (!comp) {
      throw new Error(`Exported port maps to missing internal component: ${ref.componentId}`);
    }

    const macroDef = this.resolver.resolve(comp.kind);
    if (macroDef) {
      // The target is another macro, keep drilling down
      const internalMapping = macroDef.exportPortMap[ref.portName];
      if (!internalMapping) {
        throw new Error(`Nested macro "${ref.componentId}" does not export port "${ref.portName}"`);
      }
      const nextPrefix = `${prefix}${ref.componentId}_`;
      return this._resolveDeepPort(internalMapping, macroDef.spec, nextPrefix);
    }

    // It's atomic
    return {
      componentId: prefix + ref.componentId,
      portName: ref.portName
    };
  }
}
