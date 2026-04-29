/**
 * Assembly Framework Tests — cross-domain generality probe (Wave 1.5 Gate).
 *
 * Purpose: prove that framework/assembly/* is truly domain-agnostic by
 * instantiating 5 mock domains (optics, chemistry, mechanics, biology, circuit)
 * and asserting each one:
 *   - can build via literal spec (Assembler.assemble)
 *   - can build via chained DSL (FluentAssembly subclass)
 *   - produces equivalent DomainGraph.toDTO() for literal ≡ DSL (AC-E)
 *   - framework files contain zero domain-specific keywords (AC-A)
 *
 * Adding a 6th mock domain MUST NOT require any edit under framework/assembly/*.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AbstractComponent,
  Assembler,
  FluentAssembly,
  validateSpec,
  isAssemblySpec,
  emptySpec,
  AssemblyBuildError,
  DomainGraph,
  type ComponentDomain,
  type AssemblySpec,
  type ComponentDecl,
  type IExperimentComponent,
} from '@/lib/framework';

// ══════════════════════════════════════════════════════════════════════════
// Helpers: generic mock component + mock builder factory
// ══════════════════════════════════════════════════════════════════════════

/** Generic "dummy" component for mock domains. Ports are declared up-front. */
class MockComponent extends AbstractComponent<Record<string, unknown>, never> {
  readonly domain: ComponentDomain;
  readonly kind: string;
  readonly ports: readonly string[];

  constructor(
    domain: ComponentDomain,
    kind: string,
    id: string,
    ports: readonly string[],
    props: Record<string, unknown> = {},
    anchor?: { x: number; y: number },
  ) {
    super(id, props, anchor);
    this.domain = domain;
    this.kind = kind;
    this.ports = ports;
  }

  toStamp() {
    return { componentId: this.id, entries: [] as never[] };
  }
}

/** Shape of a minimal mock domain descriptor. */
interface MockDomainDescriptor {
  domain: ComponentDomain;
  // kind → port-names
  kinds: Record<string, readonly string[]>;
}

/** Build an Assembler for a given mock domain descriptor. */
function buildMockAssembler(desc: MockDomainDescriptor): Assembler<ComponentDomain, MockComponent> {
  return new Assembler<ComponentDomain, MockComponent>(
    desc.domain,
    (decl: ComponentDecl) => {
      const ports = desc.kinds[decl.kind];
      if (!ports) throw new Error(`Unknown kind "${decl.kind}" in mock domain "${desc.domain}"`);
      return new MockComponent(desc.domain, decl.kind, decl.id, ports, decl.props, decl.anchor);
    },
  );
}

/** Generic FluentAssembly subclass parameterised by a descriptor. */
class MockBuilder extends FluentAssembly<ComponentDomain, MockComponent> {
  constructor(private readonly _desc: MockDomainDescriptor) {
    super(_desc.domain);
  }

  /** Add a component by kind — subclass is responsible for mapping to add(). */
  piece(kind: string, id?: string, props: Record<string, unknown> = {}): this {
    if (!this._desc.kinds[kind]) {
      throw new Error(`Unknown kind "${kind}" for domain "${this._desc.domain}"`);
    }
    return this.add(kind, props, { id });
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 5 mock domain descriptors
// ══════════════════════════════════════════════════════════════════════════

const MOCK_OPTICS: MockDomainDescriptor = {
  domain: 'optics',
  kinds: {
    lightSource: ['out'],
    lens: ['in', 'out'],
    mirror: ['in', 'out'],
    screen: ['in'],
  },
};

const MOCK_CHEMISTRY: MockDomainDescriptor = {
  domain: 'chemistry',
  kinds: {
    flask: ['inlet', 'outlet'],
    reagent: ['port'],
    thermometer: ['probe'],
  },
};

const MOCK_MECHANICS: MockDomainDescriptor = {
  domain: 'mechanics',
  kinds: {
    mass: ['top', 'bottom'],
    spring: ['upper', 'lower'],
    anchor: ['hook'],
  },
};

const MOCK_BIOLOGY: MockDomainDescriptor = {
  domain: 'biology',
  kinds: {
    cell: ['membrane'],
    solution: ['contact'],
  },
};

const MOCK_CIRCUIT_LIGHT: MockDomainDescriptor = {
  // Reuse 'circuit' domain label but with minimal kinds (doesn't conflict with real registry
  // because this test uses its own assembler, not componentRegistry).
  domain: 'circuit',
  kinds: {
    battery: ['positive', 'negative'],
    resistor: ['a', 'b'],
    wire: ['a', 'b'],
  },
};

const ALL_MOCK_DOMAINS = [
  MOCK_OPTICS,
  MOCK_CHEMISTRY,
  MOCK_MECHANICS,
  MOCK_BIOLOGY,
  MOCK_CIRCUIT_LIGHT,
];

// ══════════════════════════════════════════════════════════════════════════
// describe blocks — each AC has its own block (AC-B structural requirement)
// ══════════════════════════════════════════════════════════════════════════

describe('Assembly Framework · spec.ts (isAssemblySpec, emptySpec)', () => {
  test('emptySpec returns a well-formed spec', () => {
    const s = emptySpec('circuit');
    expect(s).toEqual({ domain: 'circuit', components: [], connections: [] });
  });

  test('isAssemblySpec type guard works', () => {
    expect(isAssemblySpec({ domain: 'x', components: [], connections: [] })).toBe(true);
    expect(isAssemblySpec({})).toBe(false);
    expect(isAssemblySpec(null)).toBe(false);
    expect(isAssemblySpec({ domain: 'x', components: 'nope', connections: [] })).toBe(false);
  });
});

describe('Assembly Framework · errors.ts (AssemblyBuildError, makeError)', () => {
  test('AssemblyBuildError wraps structured errors', () => {
    const err = new AssemblyBuildError('build fail', [
      { code: 'duplicate_component_id', severity: 'error', message: 'dup' },
    ]);
    expect(err.code).toBe('build_failed');
    expect(err.errors).toHaveLength(1);
    expect(err.errors[0].code).toBe('duplicate_component_id');
  });
});

describe('Assembly Framework · validator.ts (structural + referential checks)', () => {
  test('layer 1: rejects non-object', () => {
    const r = validateSpec(null);
    expect(r.ok).toBe(false);
    expect(r.errors[0].code).toBe('spec_shape_invalid');
  });

  test('layer 2: detects duplicate component ids', () => {
    const r = validateSpec({
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: {} },
        { id: 'b1', kind: 'resistor', props: {} },
      ],
      connections: [],
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === 'duplicate_component_id')).toBe(true);
  });

  test('layer 2: detects self-connection', () => {
    const r = validateSpec({
      domain: 'circuit',
      components: [{ id: 'b1', kind: 'battery', props: {} }],
      connections: [{ from: { componentId: 'b1', portName: 'p' }, to: { componentId: 'b1', portName: 'p' } }],
    });
    expect(r.errors.some((e) => e.code === 'self_connection')).toBe(true);
  });

  test('layer 2: detects invalid component reference', () => {
    const r = validateSpec({
      domain: 'circuit',
      components: [{ id: 'b1', kind: 'battery', props: {} }],
      connections: [{ from: { componentId: 'ghost', portName: 'x' }, to: { componentId: 'b1', portName: 'y' } }],
    });
    expect(r.errors.some((e) => e.code === 'port_reference_invalid')).toBe(true);
  });

  test('layer 3: detects invalid port name using portsOf lookup', () => {
    const ports = (kind: string) => (kind === 'battery' ? ['positive', 'negative'] : undefined);
    const r = validateSpec({
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: {} },
        { id: 'b2', kind: 'battery', props: {} },
      ],
      connections: [{ from: { componentId: 'b1', portName: 'POSITIVE_TYPO' }, to: { componentId: 'b2', portName: 'negative' } }],
    }, ports);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) =>
      e.code === 'port_reference_invalid' && String(e.message).includes('POSITIVE_TYPO'),
    )).toBe(true);
  });

  test('layer 3: emits warnings (not errors) for floating ports', () => {
    const ports = (kind: string) => (kind === 'battery' ? ['positive', 'negative'] : undefined);
    const r = validateSpec({
      domain: 'circuit',
      components: [{ id: 'b1', kind: 'battery', props: {} }],
      connections: [],
    }, ports);
    expect(r.warnings.length).toBe(2);
    expect(r.warnings.every((w) => w.code === 'floating_port')).toBe(true);
  });
});

describe('Assembly Framework · assembler.ts (Spec → DomainGraph)', () => {
  test('assembles a minimal mock-optics graph', () => {
    const asm = buildMockAssembler(MOCK_OPTICS);
    const spec: AssemblySpec = {
      domain: 'optics',
      components: [
        { id: 'src', kind: 'lightSource', props: {} },
        { id: 'l1', kind: 'lens', props: { focal: 10 } },
      ],
      connections: [{ from: { componentId: 'src', portName: 'out' }, to: { componentId: 'l1', portName: 'in' } }],
    };
    const graph = asm.assemble(spec);
    expect(graph.componentCount()).toBe(2);
    expect(graph.connections()).toHaveLength(1);
  });

  test('throws AssemblyBuildError on unknown kind', () => {
    const asm = buildMockAssembler(MOCK_OPTICS);
    expect(() => asm.assemble({
      domain: 'optics',
      components: [{ id: 'x', kind: 'blackhole', props: {} }],
      connections: [],
    })).toThrow(AssemblyBuildError);
  });

  test('throws on domain mismatch', () => {
    const asm = buildMockAssembler(MOCK_OPTICS);
    expect(() => asm.assemble({
      domain: 'chemistry',
      components: [],
      connections: [],
    } as unknown as AssemblySpec)).toThrow(/Domain mismatch/);
  });
});

describe('Assembly Framework · fluent.ts (chainable DSL)', () => {
  test('adds components and auto-generates ids', () => {
    const b = new MockBuilder(MOCK_MECHANICS);
    b.piece('mass').piece('spring').piece('anchor');
    const spec = b.toSpec();
    expect(spec.components.length).toBe(3);
    expect(spec.components[0].id).toBe('mass1');
    expect(spec.components[1].id).toBe('spring2');
  });

  test('connect chains port references', () => {
    const b = new MockBuilder(MOCK_MECHANICS);
    b.piece('mass', 'm1').piece('spring', 's1')
      .connect('m1', 'bottom', 's1', 'upper');
    const spec = b.toSpec();
    expect(spec.connections).toHaveLength(1);
    expect(spec.connections[0]).toEqual({
      from: { componentId: 'm1', portName: 'bottom' },
      to: { componentId: 's1', portName: 'upper' },
      kind: undefined,
    });
  });

  test('metadata merges correctly', () => {
    const b = new MockBuilder(MOCK_OPTICS);
    b.metadata({ name: 'Lens demo' }).metadata({ description: 'shows focal length' });
    expect(b.toSpec().metadata).toEqual({ name: 'Lens demo', description: 'shows focal length' });
  });

  test('toSpec returns a deep clone (mutation-safe)', () => {
    const b = new MockBuilder(MOCK_OPTICS);
    b.piece('lightSource', 'src');
    const s1 = b.toSpec();
    s1.components[0].id = 'HACKED';
    const s2 = b.toSpec();
    expect(s2.components[0].id).toBe('src');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// AC-A: Framework is domain-agnostic (keyword scan)
// ══════════════════════════════════════════════════════════════════════════

describe('AC-A · framework/assembly is domain-agnostic', () => {
  test('no domain-specific keyword appears in framework/{runtime,builders}/*.ts', () => {
    const forbiddenKeywords = [
      'battery', 'bulb', 'resistor', 'circuit\\b',
      'lens', 'lightSource', 'optics',
      'flask', 'reagent',
      'spring', 'pendulum',
      'cell\\b', 'osmosis',
    ];
    // F 阶段 · AC-A 只扫 runtime/ + builders/（impl 层禁止 domain 字样）
    //       contracts/ 豁免：它含 ComponentDomain union 元类型，必须列举 domain 名字
    //       该豁免是 F 阶段物理分层的合理副作用（精神仍保留：impl/builder 不掺杂 domain 语义）
    const dirs = [
      path.resolve(__dirname, '..', 'runtime'),
      path.resolve(__dirname, '..', 'builders'),
    ];
    const offenders: Array<{ file: string; keyword: string; line: string }> = [];
    let totalFiles = 0;
    for (const dir of dirs) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
      totalFiles += files.length;
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          // Skip comment-only lines (docs may mention domain examples)
          const trimmed = line.trim();
          if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
          for (const kw of forbiddenKeywords) {
            const re = new RegExp(`\\b${kw}`, 'i');
            if (re.test(line)) {
              offenders.push({ file, keyword: kw, line: `L${idx + 1}: ${trimmed}` });
            }
          }
        });
      }
    }
    expect(totalFiles).toBeGreaterThan(0);

    if (offenders.length > 0) {
      console.error('AC-A offenders:', offenders);
    }
    expect(offenders).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// AC-C: Extensibility — 5 mock domains all go through the same pipeline
// ══════════════════════════════════════════════════════════════════════════

describe('AC-C · 5 mock domains compose without touching framework', () => {
  test.each(ALL_MOCK_DOMAINS)('domain=$domain assembles via literal spec', (desc) => {
    const asm = buildMockAssembler(desc);
    const kinds = Object.keys(desc.kinds);
    const spec: AssemblySpec = {
      domain: desc.domain,
      components: kinds.map((k, i) => ({ id: `${k}_${i}`, kind: k, props: {} })),
      connections: [],
    };
    const graph = asm.assemble(spec);
    expect(graph.componentCount()).toBe(kinds.length);
  });

  test.each(ALL_MOCK_DOMAINS)('domain=$domain assembles via DSL (FluentAssembly subclass)', (desc) => {
    const b = new MockBuilder(desc);
    const kinds = Object.keys(desc.kinds);
    kinds.forEach((k, i) => b.piece(k, `${k}_${i}`));
    const asm = buildMockAssembler(desc);
    const graph = b.build(asm);
    expect(graph.componentCount()).toBe(kinds.length);
    expect(graph.domain).toBe(desc.domain);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// AC-D: Maintainability — framework files are bounded in size + adding a new
// domain doesn't touch framework code (already proven by AC-C, re-asserted here)
// ══════════════════════════════════════════════════════════════════════════

describe('AC-D · maintainability contracts', () => {
  test('each framework/{contracts,runtime,builders} file ≤ 250 lines', () => {
    // F 阶段 · 路径更新：assembly/ → contracts/ + runtime/ + builders/
    const dirs = [
      path.resolve(__dirname, '..', 'contracts'),
      path.resolve(__dirname, '..', 'runtime'),
      path.resolve(__dirname, '..', 'builders'),
    ];
    const offenders: Array<{ file: string; lines: number }> = [];
    for (const dir of dirs) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const lines = content.split('\n').length;
        if (lines > 250) offenders.push({ file, lines });
      }
    }
    if (offenders.length) console.error('AC-D offenders:', offenders);
    expect(offenders).toHaveLength(0);
  });

  test('adding a 6th mock domain requires zero edits to framework/assembly/*', () => {
    // Create a brand-new MockDomainDescriptor at runtime; if this test passes
    // without importing or modifying anything under framework/assembly/, the
    // framework is truly extensible.
    // We reuse 'meta' as a catch-all legal ComponentDomain label here to avoid
    // needing to extend the ComponentDomain union (which itself is a controlled
    // evolution surface, not something tests should hot-patch).
    const MOCK_GEOLOGY: MockDomainDescriptor = {
      domain: 'meta',
      kinds: {
        plate: ['north', 'south', 'east', 'west'],
        fault: ['a', 'b'],
      },
    };
    const asm = buildMockAssembler(MOCK_GEOLOGY);
    const b = new MockBuilder(MOCK_GEOLOGY);
    b.piece('plate', 'p1').piece('fault', 'f1')
      .connect('p1', 'east', 'f1', 'a');
    const graph = b.build(asm);
    expect(graph.componentCount()).toBe(2);
    expect(graph.connections()).toHaveLength(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// AC-E: Configurability — literal spec ≡ DSL spec for every mock domain
// ══════════════════════════════════════════════════════════════════════════

describe('AC-E · literal spec ≡ DSL build (same DomainGraph DTO)', () => {
  test.each(ALL_MOCK_DOMAINS)('$domain — literal and DSL produce equivalent DTO', (desc) => {
    const kinds = Object.keys(desc.kinds);
    // Literal path
    const literalSpec: AssemblySpec = {
      domain: desc.domain,
      components: kinds.map((k, i) => ({ id: `${k}_${i}`, kind: k, props: {} })),
      connections: [],
    };
    const asm = buildMockAssembler(desc);
    const graphA = asm.assemble(literalSpec);

    // DSL path
    const b = new MockBuilder(desc);
    kinds.forEach((k, i) => b.piece(k, `${k}_${i}`));
    const graphB = b.build(asm);

    // Deep equal on DTOs
    expect(graphB.toDTO()).toEqual(graphA.toDTO());
  });
});
