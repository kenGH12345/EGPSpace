/**
 * ChemistryBuilder — browser mirror of framework/domains/chemistry/assembly/chemistry-builder.ts.
 *
 * Produces an AssemblySpec<'chemistry'> (JSON-safe) that is posted to the engine
 * via requestCompute('chemistry/reaction', { graph: builder.toSpec() }).
 *
 * Only the methods templates actually need are mirrored: flask / pour / drop /
 * observe / connect. Must stay in sync with the TS builder — tests fingerprint
 * DTOs to detect drift.
 *
 * Anchor policy (post D-separation):
 *   - sugar API signatures unchanged: .flask({id, anchor}) etc.
 *   - _components do NOT store anchors (matches TS AssemblySpec contract)
 *   - _layout.entries store anchors separately (toLayoutSpec() exposes them)
 *   - components() returns a merged view (component + anchor from layout) for renderers
 */

(function () {
  'use strict';

  class CBuilder {
    constructor() {
      this._components = [];
      this._connections = [];
      this._layout = { domain: 'chemistry', entries: [] };
      this._counter = 0;
    }

    _nextId(kind) {
      return kind + (++this._counter);
    }

    _add(kind, props, opts) {
      opts = opts || {};
      const id = opts.id || this._nextId(kind);
      this._components.push({
        id: id,
        kind: kind,
        props: props || {},
        // anchor intentionally NOT written to _components (D-3 split)
      });
      if (opts.anchor) {
        this._writeAnchor(id, opts.anchor);
      }
      return id;
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

    flask(opts) {
      if (!opts || typeof opts.volumeML !== 'number' || !opts.shape) {
        throw new Error('ChemistryBuilder.flask: volumeML and shape are required');
      }
      this._add('flask', {
        volumeML: opts.volumeML,
        shape: opts.shape,
        label: opts.label,
      }, { id: opts.id, anchor: opts.anchor });
      return this;
    }

    pour(flaskId, opts) {
      if (!flaskId) throw new Error('ChemistryBuilder.pour: flaskId is required');
      if (!opts || !opts.formula || typeof opts.moles !== 'number' || !opts.phase) {
        throw new Error('ChemistryBuilder.pour: formula, moles, and phase required');
      }
      const id = this._add('reagent', {
        formula: opts.formula,
        moles: opts.moles,
        concentration: opts.concentration || 0,
        phase: opts.phase,
        label: opts.label,
      }, { id: opts.id, anchor: opts.anchor });
      this._connections.push({
        from: { componentId: id, portName: 'in' },
        to: { componentId: flaskId, portName: 'contents' },
      });
      return this;
    }

    drop(flaskId, opts) {
      if (!flaskId) throw new Error('ChemistryBuilder.drop: flaskId is required');
      if (!opts || !opts.formula || typeof opts.massG !== 'number') {
        throw new Error('ChemistryBuilder.drop: formula and massG required');
      }
      const id = this._add('solid', {
        formula: opts.formula,
        massG: opts.massG,
        state: opts.state || 'intact',
      }, { id: opts.id, anchor: opts.anchor });
      this._connections.push({
        from: { componentId: id, portName: 'in' },
        to: { componentId: flaskId, portName: 'contents' },
      });
      return this;
    }

    observe(flaskId, opts) {
      if (!flaskId) throw new Error('ChemistryBuilder.observe: flaskId is required');
      opts = opts || {};
      const id = this._add('thermometer', {
        tempC: typeof opts.tempC === 'number' ? opts.tempC : 25,
        range: opts.range || [-10, 110],
      }, { id: opts.id, anchor: opts.anchor });
      this._connections.push({
        from: { componentId: id, portName: 'in' },
        to: { componentId: flaskId, portName: 'contents' },
      });
      return this;
    }

    connect(fromId, fromPort, toId, toPort, kind) {
      this._connections.push({
        from: { componentId: fromId, portName: fromPort },
        to: { componentId: toId, portName: toPort },
        kind: kind,
      });
      return this;
    }

    // ── Accessors used by templates ──

    /**
     * Returns components merged with anchors from _layout for rendering.
     * _components is the topology source; _layout supplies anchors.
     */
    components() {
      const lookup = {};
      for (const e of this._layout.entries) lookup[e.componentId] = e.anchor;
      return this._components.map(function (c) {
        return Object.assign({}, c, { anchor: lookup[c.id] || { x: 0, y: 0 } });
      });
    }

    findById(id) {
      return this._components.find(function (c) { return c.id === id; });
    }

    toSpec() {
      // Deep clone, anchor-free. Matches TS AssemblySpec.
      return {
        domain: 'chemistry',
        components: this._components.map(function (c) {
          return { id: c.id, kind: c.kind, props: Object.assign({}, c.props) };
        }),
        connections: this._connections.slice(),
      };
    }

    toLayoutSpec() {
      return JSON.parse(JSON.stringify(this._layout));
    }

    toBundle() {
      return { spec: this.toSpec(), layout: this.toLayoutSpec() };
    }
  }

  window.ChemistryBuilder = CBuilder;
})();
