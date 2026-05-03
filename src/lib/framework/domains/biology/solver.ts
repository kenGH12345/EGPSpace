import type { ComponentStamp, ComponentSolvedValues } from '../../contracts/component';
import type { BiologyStampEntry } from './components';
import { AbstractSolver } from '../../core/AbstractSolver';
import type { EventBus } from '../../core/EventBus';

interface BiologyEntityState {
  population: number;
  age: number;
}

const MAX_DELTA_TIME = 1;
const DEFAULT_POPULATION = 1;
const DEFAULT_CAPACITY = 1_000;
const DEFAULT_GROWTH_RATE = 0.35;
const MAX_POPULATION = 1_000_000;

export class BiologySolver extends AbstractSolver {
  public readonly domain = 'biology';
  private stamps: ComponentStamp<BiologyStampEntry>[] = [];
  private entities: Record<string, BiologyEntityState> = {};

  public lastResults: Record<string, ComponentSolvedValues> = {};

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  addStamp(stamp: ComponentStamp<BiologyStampEntry>): void {
    this.stamps.push(stamp);
  }

  protected performUpdate(deltaTime: number): void {
    const dt = clampFinite(deltaTime, 0, MAX_DELTA_TIME);
    const results: Record<string, ComponentSolvedValues> = {};

    for (const stamp of this.stamps) {
      results[stamp.componentId] = this.solveStamp(stamp, dt);
    }

    this.lastResults = results;
  }

  clear(): void {
    this.stamps = [];
    this.entities = {};
    this.lastResults = {};
  }

  private solveStamp(
    stamp: ComponentStamp<BiologyStampEntry>,
    dt: number,
  ): ComponentSolvedValues {
    const entry = stamp.entries[0];

    if (!entry) {
      return { status: 'invalid', reason: 'empty_stamp', dt };
    }

    if (entry.kind === 'microscope-slide') {
      return this.solveMicroscopeSlide(entry, dt);
    }

    return this.solvePlantCell(stamp.componentId, entry, dt);
  }

  private solvePlantCell(
    componentId: string,
    entry: BiologyStampEntry,
    dt: number,
  ): ComponentSolvedValues {
    const isAlive = booleanOrDefault(entry.parameters.isAlive, true);
    const entity = this.getEntity(componentId, entry);
    const hydration = clampFiniteNumber(entry.parameters.hydration, 0, 1, 0.8);
    const sunlight = clampFiniteNumber(entry.parameters.sunlight, 0, 1, 0.5);
    const health = clampFiniteNumber(entry.parameters.health, 0, 1, 1);
    const nutrition = clampFiniteNumber(entry.parameters.nutrition, 0, 10, 5) / 10;
    const capacity = Math.min(
      positiveFinite(entry.parameters.carryingCapacity, DEFAULT_CAPACITY),
      MAX_POPULATION,
    );
    const baseGrowthRate = nonNegativeFinite(entry.parameters.growthRate, DEFAULT_GROWTH_RATE);
    const environmentFactor = hydration * 0.35 + sunlight * 0.35 + nutrition * 0.2 + health * 0.1;
    const effectiveGrowthRate = isAlive ? baseGrowthRate * environmentFactor : -baseGrowthRate;
    const deltaPopulation = effectiveGrowthRate * entity.population * (1 - entity.population / capacity) * dt;

    entity.population = clampFiniteNumber(entity.population + deltaPopulation, 0, MAX_POPULATION, DEFAULT_POPULATION);
    entity.age += dt;

    const stage = determineStage(entity.age, entity.population, capacity);
    const metabolism = isAlive && environmentFactor >= 0.45 ? 'active' : 'stressed';

    return {
      status: isAlive ? 'simulating' : 'dormant',
      kind: 'plant-cell',
      population: entity.population,
      carryingCapacity: capacity,
      growthRate: effectiveGrowthRate,
      environmentFactor,
      stage,
      metabolism,
      age: entity.age,
      dt,
    };
  }

  private solveMicroscopeSlide(entry: BiologyStampEntry, dt: number): ComponentSolvedValues {
    const magnification = positiveFinite(entry.parameters.magnification, 100);
    const specimenId = stringOrDefault(entry.parameters.specimenId, '');

    return {
      status: 'observing',
      kind: 'microscope-slide',
      magnification,
      specimenId,
      dt,
    };
  }

  private getEntity(componentId: string, entry: BiologyStampEntry): BiologyEntityState {
    const existing = this.entities[componentId];

    if (existing) return existing;

    const entity = {
      population: positiveFinite(entry.parameters.population, DEFAULT_POPULATION),
      age: nonNegativeFinite(entry.parameters.age, 0),
    };
    this.entities[componentId] = entity;
    return entity;
  }
}

function determineStage(age: number, population: number, capacity: number): string {
  if (population >= capacity * 0.8) return 'mature';
  if (age >= 5) return 'growing';
  return 'seedling';
}

function clampFinite(deltaTime: number, min: number, max: number): number {
  if (!Number.isFinite(deltaTime)) return min;
  return Math.min(Math.max(deltaTime, min), max);
}

function clampFiniteNumber(
  value: number | boolean | string | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function positiveFinite(value: number | boolean | string | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegativeFinite(value: number | boolean | string | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function booleanOrDefault(value: number | boolean | string | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOrDefault(value: number | boolean | string | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}
