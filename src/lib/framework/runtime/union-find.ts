/**
 * Union-Find (Disjoint Set Union) with path compression + union by rank.
 *
 * Used by DomainGraph.buildEquipotentialNodes() to collapse ports connected by
 * equivalence-like edges (wires in circuits, rigid links in mechanics) into a
 * single "node" for the solver.
 *
 * Generic over string keys (typically PortRef keys from portKey()).
 */

export class UnionFind {
  private parent = new Map<string, string>();
  private rank = new Map<string, number>();

  /** Ensure a key is in the structure; idempotent. */
  add(key: string): void {
    if (!this.parent.has(key)) {
      this.parent.set(key, key);
      this.rank.set(key, 0);
    }
  }

  /** Find root representative; applies path compression. */
  find(key: string): string {
    this.add(key);
    let root = key;
    while (this.parent.get(root)! !== root) {
      root = this.parent.get(root)!;
    }
    // Path compression: point every node on the path directly to root.
    let cur = key;
    while (this.parent.get(cur)! !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  /** Union two keys. Returns true if a merge actually happened. */
  union(a: string, b: string): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    const rankA = this.rank.get(ra)!;
    const rankB = this.rank.get(rb)!;
    if (rankA < rankB) {
      this.parent.set(ra, rb);
    } else if (rankA > rankB) {
      this.parent.set(rb, ra);
    } else {
      this.parent.set(rb, ra);
      this.rank.set(ra, rankA + 1);
    }
    return true;
  }

  /** True iff a and b share the same root. */
  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b);
  }

  /** Return the set of unique root keys = "equivalence class count". */
  roots(): string[] {
    const out = new Set<string>();
    for (const k of this.parent.keys()) out.add(this.find(k));
    return [...out];
  }

  /** All currently tracked keys. */
  keys(): string[] {
    return [...this.parent.keys()];
  }

  /** Group keys by root → classId map. */
  partition(): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const k of this.parent.keys()) {
      const r = this.find(k);
      const arr = groups.get(r) ?? [];
      arr.push(k);
      groups.set(r, arr);
    }
    return groups;
  }
}
