import { CircuitBuilder, circuitAssembler } from '../src/lib/framework/domains/circuit/index';

describe('Large Graph Benchmark', () => {
  it('should parse and assemble >10000 nodes within reasonable time', () => {
    const builder = new CircuitBuilder();
    const NUM_NODES = 10000;
    
    const startBuild = performance.now();
    
    // Add nodes
    for (let i = 0; i < NUM_NODES; i++) {
      builder.resistor({ id: `r${i}`, resistance: 10 });
    }
    
    // Add edges (chain them)
    for (let i = 0; i < NUM_NODES - 1; i++) {
      builder.connect(`r${i}`, 'b', `r${i+1}`, 'a');
    }
    
    const spec = builder.toSpec();
    const buildDuration = performance.now() - startBuild;
    
    const startAssemble = performance.now();
    const graph = circuitAssembler.assembleCircuit(spec);
    const assembleDuration = performance.now() - startAssemble;
    
    console.log(`Large graph benchmark (nodes=${NUM_NODES}):`);
    console.log(`  - Spec Generation: ${buildDuration.toFixed(2)} ms`);
    console.log(`  - Assembly: ${assembleDuration.toFixed(2)} ms`);
    
    expect(graph.componentCount()).toBe(NUM_NODES);
    // Be generous with the threshold, e.g. 1000ms
    expect(assembleDuration).toBeLessThan(1000);
  });
});

