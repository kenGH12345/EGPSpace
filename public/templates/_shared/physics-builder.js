/**
 * PhysicsBuilder - v3-component Architecture
 * Declarative component builder for physics experiments.
 * Counterpart to ChemistryBuilder, generates 'physics' domain spec graph.
 */
class PhysicsBuilder {
  constructor() {
    this.spec = {
      domain: 'physics',
      components: [],
    };
  }

  /**
   * Adds a solid block.
   */
  block(props) {
    this.spec.components.push({
      id: props.id,
      kind: 'block',
      anchor: props.anchor || { x: 0, y: 0 },
      props: {
        mass: props.mass || 1,
        volume: props.volume || 1,
        area: props.area || 1,
        density: props.density || 1000,
        ...props
      }
    });
    return this;
  }

  /**
   * Adds a container of liquid.
   */
  liquidContainer(props) {
    this.spec.components.push({
      id: props.id,
      kind: 'liquid-container',
      anchor: props.anchor || { x: 0, y: 0 },
      props: {
        liquidDensity: props.liquidDensity || 1000,
        depth: props.depth || 0.5,
        ...props
      }
    });
    return this;
  }

  /**
   * Adds a generic force vector.
   */
  forceArrow(props) {
    this.spec.components.push({
      id: props.id,
      kind: 'force-arrow',
      anchor: props.anchor || { x: 0, y: 0 },
      props: {
        magnitude: props.magnitude || 0,
        direction: props.direction || 'down',
        label: props.label || '',
        ...props
      }
    });
    return this;
  }

  /**
   * Returns the assembled graph spec.
   */
  toSpec() {
    return this.spec;
  }

  components() {
    return this.spec.components;
  }
}

if (typeof window !== 'undefined') {
  window.PhysicsBuilder = PhysicsBuilder;
}
