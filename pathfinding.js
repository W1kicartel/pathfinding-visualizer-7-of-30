/**
 * pathfinding.js — Grid pathfinding algorithms (Dijkstra & A*).
 *
 * This is the "logic showcase" of the project and the part worth reading:
 * a real binary-heap priority queue plus two classic graph-search algorithms,
 * written as pure functions so they can be unit-tested under Node and reused
 * by the browser UI (see index.html). UMD module: works as `require('./pathfinding')`
 * and as the global `window.Pathfinding`.
 *
 * A Grid is described by { rows, cols, walls, weights }:
 *   - walls   : Set of "r,c" keys that are impassable
 *   - weights : optional Map of "r,c" -> movement cost (default 1)
 * Coordinates are { r, c } (row, col). Movement is 4-directional.
 *
 * Each search returns { visited, path, cost }:
 *   - visited : nodes in the order they were expanded (drives the animation)
 *   - path    : the shortest path from start to end (empty if unreachable)
 *   - cost    : total cost of that path (Infinity if unreachable)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Pathfinding = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Binary min-heap keyed by a numeric priority. O(log n) push/pop.
   * Used as the open set / frontier for both Dijkstra and A*.
   */
  class MinHeap {
    constructor() { this.items = []; }
    get size() { return this.items.length; }

    push(value, priority) {
      const node = { value, priority };
      const a = this.items;
      a.push(node);
      let i = a.length - 1;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (a[parent].priority <= a[i].priority) break;
        [a[parent], a[i]] = [a[i], a[parent]];
        i = parent;
      }
    }

    pop() {
      const a = this.items;
      if (a.length === 0) return undefined;
      const top = a[0];
      const last = a.pop();
      if (a.length > 0) {
        a[0] = last;
        let i = 0;
        const n = a.length;
        while (true) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let smallest = i;
          if (l < n && a[l].priority < a[smallest].priority) smallest = l;
          if (r < n && a[r].priority < a[smallest].priority) smallest = r;
          if (smallest === i) break;
          [a[smallest], a[i]] = [a[i], a[smallest]];
          i = smallest;
        }
      }
      return top.value;
    }
  }

  const key = (r, c) => r + ',' + c;

  /** Reconstruct the path by walking the cameFrom map back from end to start. */
  function rebuild(cameFrom, start, end) {
    const path = [];
    let cur = key(end.r, end.c);
    const startKey = key(start.r, start.c);
    if (!cameFrom.has(cur) && cur !== startKey) return path; // unreachable
    while (cur) {
      const [r, c] = cur.split(',').map(Number);
      path.push({ r, c });
      if (cur === startKey) break;
      cur = cameFrom.get(cur);
    }
    return path.reverse();
  }

  /** Manhattan distance — admissible heuristic for 4-directional grids. */
  function manhattan(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  /**
   * Core best-first search. With heuristicWeight 0 it is Dijkstra; with the
   * Manhattan heuristic it is A*. Keeps both algorithms in one tested code path.
   */
  function search(grid, start, end, useHeuristic) {
    const { rows, cols } = grid;
    const walls = grid.walls || new Set();
    const weights = grid.weights || new Map();
    const inBounds = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;
    const costOf = (r, c) => (weights.has(key(r, c)) ? weights.get(key(r, c)) : 1);

    const open = new MinHeap();
    const gScore = new Map();   // cheapest known cost from start to node
    const cameFrom = new Map();
    const visited = [];
    const closed = new Set();

    const sKey = key(start.r, start.c);
    gScore.set(sKey, 0);
    open.push(start, useHeuristic ? manhattan(start, end) : 0);

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (open.size > 0) {
      const cur = open.pop();
      const cKey = key(cur.r, cur.c);
      if (closed.has(cKey)) continue;   // stale heap entry — skip
      closed.add(cKey);
      visited.push({ r: cur.r, c: cur.c });

      if (cur.r === end.r && cur.c === end.c) {
        const path = rebuild(cameFrom, start, end);
        return { visited, path, cost: gScore.get(cKey) };
      }

      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr, nc = cur.c + dc;
        if (!inBounds(nr, nc)) continue;
        const nKey = key(nr, nc);
        if (walls.has(nKey) || closed.has(nKey)) continue;

        const tentative = gScore.get(cKey) + costOf(nr, nc);
        if (!gScore.has(nKey) || tentative < gScore.get(nKey)) {
          gScore.set(nKey, tentative);
          cameFrom.set(nKey, cKey);
          const priority = tentative + (useHeuristic ? manhattan({ r: nr, c: nc }, end) : 0);
          open.push({ r: nr, c: nc }, priority);
        }
      }
    }

    return { visited, path: [], cost: Infinity }; // no path exists
  }

  const dijkstra = (grid, start, end) => search(grid, start, end, false);
  const astar = (grid, start, end) => search(grid, start, end, true);

  return { MinHeap, dijkstra, astar, manhattan, key };
});
