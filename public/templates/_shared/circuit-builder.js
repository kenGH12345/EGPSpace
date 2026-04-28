/**
 * Browser-side CircuitBuilder — mirror of src/lib/framework/domains/circuit/assembly/circuit-builder.ts.
 *
 * Produces AssemblySpec JSON identical in shape to the TS side. Templates use
 * this to declaratively build a circuit and pass it to requestCompute().
 *
 *   const circuit = new CircuitBuilder()
 *     .battery({ voltage: 6, id: 'B1' })
 *     .resistor({ resistance: 10, id: 'R1' })
 *     .bulb({ id: 'L1' })
 *     .loop();
 *   const result = await requestCompute('physics/circuit', {
 *     graph: circuit.toSpec(),
 *     overrides: { B1: { voltage: getParam('voltage') } }
 *   });
 *   ComponentMirror.renderAll(ctx, circuit.components(), result.values.perComponent);
 *
 * Cross-language contract (see src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts):
 *   This file MUST produce the same DTO shape as the TS CircuitBuilder.
 *   Any drift will break the engine's v2 path.
 *
 * Anchor policy (post D-separation):
 *   - sugar API signature unchanged: .battery({voltage, id, anchor})
 *   - _spec.components[i].anchor is NO longer written — anchor routes to _layout
 *   - toSpec() returns components without anchors (matches TS AssemblySpec)
 *   - toLayoutSpec() returns the sibling LayoutSpec
 *   - components() still returns a view WITH anchor merged from _layout
 *     (renderers need anchor; they pull it from this method, not from toSpec())
 */

(function () {
  'use strict';

  class CircuitBuilder {
    constructor() {
      this._spec = {
        domain: 'circuit',
        components: [],
        connections: [],
      };
      this._layout = {
        domain: 'circuit',
        entries: [],
      };
      this._idCounter = 0;
      this._addOrder = [];
    }

    // ── Generic add ──
    _add(kind, props, opts) {
      opts = opts || {};
      const id = opts.id || (kind + ++this._idCounter);
      this._spec.components.push({
        id: id,
        kind: kind,
        props: props || {},
        // anchor intentionally NOT written here (D-3 split)
      });
      this._addOrder.push(id);
      if (opts.anchor) {
        this._writeAnchor(id, opts.anchor);
      }
      return this;
    }

    _writeAnchor(id, anchor) {
      for (var i = 0; i < this._layout.entries.length; i++) {
        if (this._layout.entries[i].componentId === id) {
          this._layout.entries[i] = { componentId: id, anchor: anchor };
          return;
        }
      }
      this._layout.entries.push({ componentId: id, anchor: anchor });
    }

    // ── Typed sugar methods ──
    battery(opts) {
      if (!opts || typeof opts.voltage !== 'number') {
        throw new Error('CircuitBuilder.battery: opts.voltage is required');
      }
      return this._add('battery', { voltage: opts.voltage }, { id: opts.id, anchor: opts.anchor });
    }

    wire(opts) {
      opts = opts || {};
      return this._add('wire', {}, { id: opts.id, anchor: opts.anchor });
    }

    switch_(opts) {
      opts = opts || {};
      const closed = opts.closed !== undefined ? !!opts.closed : true;
      return this._add('switch', { closed: closed }, { id: opts.id, anchor: opts.anchor });
    }

    resistor(opts) {
      if (!opts || typeof opts.resistance !== 'number') {
        throw new Error('CircuitBuilder.resistor: opts.resistance is required');
      }
      return this._add(
        'resistor',
        { resistance: opts.resistance, label: opts.label },
        { id: opts.id, anchor: opts.anchor },
      );
    }

    bulb(opts) {
      opts = opts || {};
      return this._add(
        'bulb',
        {
          resistance: opts.resistance || 6,
          ratedPower: opts.ratedPower || 2,
          label: opts.label,
        },
        { id: opts.id, anchor: opts.anchor },
      );
    }

    ammeter(opts) {
      opts = opts || {};
      return this._add('ammeter', {}, { id: opts.id, anchor: opts.anchor });
    }

    voltmeter(opts) {
      opts = opts || {};
      return this._add('voltmeter', {}, { id: opts.id, anchor: opts.anchor });
    }

    // ── Explicit connection ──
    connect(fromId, fromPort, toId, toPort, kind) {
      this._spec.connections.push({
        from: { componentId: fromId, portName: fromPort },
        to: { componentId: toId, portName: toPort },
        kind: kind,
      });
      return this;
    }

    // ── Loop convenience ──
    loop() {
      const comps = this._spec.components;
      if (comps.length < 2) return this;
      for (let i = 0; i < comps.length; i++) {
        const a = comps[i];
        const b = comps[(i + 1) % comps.length];
        this._spec.connections.push({
          from: { componentId: a.id, portName: this._endPort(a.kind) },
          to: { componentId: b.id, portName: this._startPort(b.kind) },
        });
      }
      return this;
    }

    _startPort(kind) {
      if (kind === 'battery') return 'negative';
      if (kind === 'switch' || kind === 'ammeter') return 'in';
      return 'a';
    }
    _endPort(kind) {
      if (kind === 'battery') return 'positive';
      if (kind === 'switch' || kind === 'ammeter') return 'out';
      return 'b';
    }

    // ── Terminal operations ──
    toSpec() {
      // Deep clone for safety (callers may mutate slider overrides independently).
      // This output is anchor-free by design — renderers use components() instead.
      return JSON.parse(JSON.stringify(this._spec));
    }

    toLayoutSpec() {
      return JSON.parse(JSON.stringify(this._layout));
    }

    toBundle() {
      return { spec: this.toSpec(), layout: this.toLayoutSpec() };
    }

    /**
     * Returns components merged with their anchors from _layout. This is what
     * renderers consume (they need id + kind + props + anchor to paint).
     * The merge is a one-way view; does not mutate _spec or _layout.
     */
    components() {
      const lookup = {};
      for (const e of this._layout.entries) lookup[e.componentId] = e.anchor;
      return this._spec.components.map(function (c) {
        return Object.assign({}, c, { anchor: lookup[c.id] || { x: 0, y: 0 } });
      });
    }

    findById(id) {
      for (const c of this._spec.components) {
        if (c.id === id) return c;
      }
      return null;
    }

    metadata(meta) {
      this._spec.metadata = Object.assign({}, this._spec.metadata || {}, meta);
      return this;
    }
  }

  window.CircuitBuilder = CircuitBuilder;
  window.__EUREKA_CIRCUIT_BUILDER_LOADED = true;
})();
