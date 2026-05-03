import type { ComponentStamp, ComponentSolvedValues } from '../../contracts/component';
import type { MechanicsStampEntry } from './components';
import { AbstractSolver } from '../../core/AbstractSolver';
import type { EventBus } from '../../core/EventBus';

interface MechanicsNodeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface MechanicsSystemState {
  nodes: Record<string, MechanicsNodeState>;
  time: number;
}

const DEFAULT_MASS = 1;
const DEFAULT_DAMPING = 0.08;
const DEFAULT_GRAVITY = 9.81;
const DEFAULT_REST_LENGTH = 1;
const DEFAULT_SPRING_CONSTANT = 30;
const MAX_DELTA_TIME = 1 / 30;
const MAX_ABS_VALUE = 1_000_000;

export class MechanicsSolver extends AbstractSolver {
  public readonly domain = 'mechanics';
  private stamps: ComponentStamp<MechanicsStampEntry>[] = [];
  private state: MechanicsSystemState = { nodes: {}, time: 0 };

  public lastResults: Record<string, ComponentSolvedValues> = {};

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  addStamp(stamp: ComponentStamp<MechanicsStampEntry>): void {
    this.stamps.push(stamp);
  }

  protected performUpdate(deltaTime: number): void {
    const dt = clampFinite(deltaTime, 0, MAX_DELTA_TIME);
    const results: Record<string, ComponentSolvedValues> = {};

    for (const stamp of this.stamps) {
      results[stamp.componentId] = this.solveStamp(stamp, dt);
    }

    this.state.time += dt;
    this.lastResults = results;
  }

  clear(): void {
    this.stamps = [];
    this.state = { nodes: {}, time: 0 };
    this.lastResults = {};
  }

  private solveStamp(
    stamp: ComponentStamp<MechanicsStampEntry>,
    dt: number,
  ): ComponentSolvedValues {
    const primaryEntry = stamp.entries[0];

    if (!primaryEntry) {
      return { status: 'invalid', reason: 'empty_stamp', dt };
    }

    if (primaryEntry.kind === 'spring') {
      return this.solveSpring(stamp, primaryEntry, dt);
    }

    return this.solveMassBlock(stamp, primaryEntry, dt);
  }

  private solveMassBlock(
    stamp: ComponentStamp<MechanicsStampEntry>,
    entry: MechanicsStampEntry,
    dt: number,
  ): ComponentSolvedValues {
    const nodeId = entry.nodes[0] ?? `${stamp.componentId}#center`;
    const node = this.getNode(nodeId, entry.parameters);
    const mass = positiveFinite(entry.parameters.mass, DEFAULT_MASS);
    const damping = nonNegativeFinite(entry.parameters.damping, DEFAULT_DAMPING);
    const gravity = finiteOrDefault(entry.parameters.gravity, DEFAULT_GRAVITY);
    const forceX = finiteOrDefault(entry.parameters.forceX, 0);
    const forceY = finiteOrDefault(entry.parameters.forceY, mass * gravity);

    integrateNode(node, dt, forceX / mass, forceY / mass, damping);

    if (!isNodeFinite(node)) {
      resetNode(node);
      return { status: 'invalid', reason: 'non_finite_state', dt };
    }

    return {
      status: 'simulating',
      kind: 'mass-block',
      x: node.x,
      y: node.y,
      vx: node.vx,
      vy: node.vy,
      kineticEnergy: 0.5 * mass * (node.vx * node.vx + node.vy * node.vy),
      dt,
    };
  }

  private solveSpring(
    stamp: ComponentStamp<MechanicsStampEntry>,
    entry: MechanicsStampEntry,
    dt: number,
  ): ComponentSolvedValues {
    const leftNode = this.getNode(entry.nodes[0] ?? `${stamp.componentId}#left`, entry.parameters, 'left');
    const rightNode = this.getNode(entry.nodes[1] ?? `${stamp.componentId}#right`, entry.parameters, 'right');
    const mass = positiveFinite(entry.parameters.mass, DEFAULT_MASS);
    const damping = nonNegativeFinite(entry.parameters.damping, DEFAULT_DAMPING);
    const k = positiveFinite(entry.parameters.k, DEFAULT_SPRING_CONSTANT);
    const restLength = positiveFinite(entry.parameters.restLength, DEFAULT_REST_LENGTH);
    const dx = rightNode.x - leftNode.x;
    const dy = rightNode.y - leftNode.y;
    const distance = Math.max(Math.hypot(dx, dy), 0.000001);
    const extension = distance - restLength;
    const forceMagnitude = k * extension;
    const forceX = (forceMagnitude * dx) / distance;
    const forceY = (forceMagnitude * dy) / distance;

    integrateNode(leftNode, dt, forceX / mass, forceY / mass, damping);
    integrateNode(rightNode, dt, -forceX / mass, -forceY / mass, damping);

    if (!isNodeFinite(leftNode) || !isNodeFinite(rightNode)) {
      resetNode(leftNode);
      resetNode(rightNode);
      return { status: 'invalid', reason: 'non_finite_state', dt };
    }

    return {
      status: 'simulating',
      kind: 'spring',
      leftX: leftNode.x,
      leftY: leftNode.y,
      rightX: rightNode.x,
      rightY: rightNode.y,
      extension,
      force: forceMagnitude,
      potentialEnergy: 0.5 * k * extension * extension,
      dt,
    };
  }

  private getNode(
    nodeId: string,
    parameters: Record<string, number>,
    suffix: 'left' | 'right' | 'center' = 'center',
  ): MechanicsNodeState {
    const existing = this.state.nodes[nodeId];

    if (existing) return existing;

    const suffixX = suffix === 'right' ? 1 : 0;
    const suffixY = 0;
    const node = {
      x: finiteOrDefault(parameters[`${suffix}X`], finiteOrDefault(parameters.x, suffixX)),
      y: finiteOrDefault(parameters[`${suffix}Y`], finiteOrDefault(parameters.y, suffixY)),
      vx: finiteOrDefault(parameters[`${suffix}Vx`], finiteOrDefault(parameters.velocityX, 0)),
      vy: finiteOrDefault(parameters[`${suffix}Vy`], finiteOrDefault(parameters.velocityY, 0)),
    };

    this.state.nodes[nodeId] = node;
    return node;
  }
}

function integrateNode(
  node: MechanicsNodeState,
  dt: number,
  ax: number,
  ay: number,
  damping: number,
): void {
  const dampingFactor = Math.max(0, 1 - damping * dt);
  node.vx = (node.vx + ax * dt) * dampingFactor;
  node.vy = (node.vy + ay * dt) * dampingFactor;
  node.x += node.vx * dt;
  node.y += node.vy * dt;
}

function clampFinite(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function finiteOrDefault(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function positiveFinite(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegativeFinite(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function isNodeFinite(node: MechanicsNodeState): boolean {
  return [node.x, node.y, node.vx, node.vy].every(
    (value) => Number.isFinite(value) && Math.abs(value) <= MAX_ABS_VALUE,
  );
}

function resetNode(node: MechanicsNodeState): void {
  node.x = 0;
  node.y = 0;
  node.vx = 0;
  node.vy = 0;
}
