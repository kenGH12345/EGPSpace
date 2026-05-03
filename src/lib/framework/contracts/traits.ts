/**
 * Experiment Component Framework — Traits
 * 
 * This file defines standard cross-domain physical, chemical, and biological 
 * properties (Traits) that can be mixed into any component's Props.
 * 
 * By using these standardized interfaces, cross-domain solvers (like a global 
 * Thermodynamics reaction rule) can interact with components without knowing 
 * what the components specifically are.
 */

/**
 * Basic physical properties: mass, volume, density, state of matter.
 */
export interface ITraitPhysical {
  /** Mass in kilograms (kg) */
  mass: number;
  /** Volume in cubic meters (m^3) */
  volume?: number;
  /** State of matter */
  state: 'solid' | 'liquid' | 'gas' | 'plasma';
}

/**
 * Thermodynamic properties related to temperature and combustion.
 */
export interface ITraitFlammable {
  /** Ignition temperature in Celsius (°C) */
  ignitionPoint: number;
  /** Whether the object is currently burning */
  isBurning: boolean;
}

/**
 * Electrical conductivity properties.
 */
export interface ITraitConductive {
  /** Electrical resistance in Ohms (Ω). Infinity or very large for insulators. */
  resistance: number;
}

/**
 * Optical properties for interaction with light.
 */
export interface ITraitOptical {
  /** Refractive index (n) of the material. Vacuum = 1.0 */
  refractiveIndex?: number;
  /** Transparency from 0.0 (opaque) to 1.0 (perfectly transparent) */
  transparency?: number;
  /** RGB Color as hex string (#RRGGBB) or literal */
  color?: string;
}

/**
 * Biological properties for living organisms or organic matter.
 */
export interface ITraitBiological {
  /** Whether the organism is currently alive */
  isAlive: boolean;
  /** General health points (0.0 to 1.0) */
  health?: number;
}

/**
 * Properties for objects that can be eaten/consumed.
 */
export interface ITraitEdible {
  /** Nutritional value or healing amount */
  nutrition: number;
  /** Whether it is toxic/poisonous */
  isToxic: boolean;
}

/**
 * Helper type to extract traits from a component's props.
 */
export type HasTrait<Props, Trait> = Props extends Trait ? true : false;
