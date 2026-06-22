/**
 * pathfinding.test.js — zero-dependency Node tests: `node pathfinding.test.js`.
 * Verifies the priority queue and the correctness/optimality of both searches.
 */
const PF = require('./pathfinding.js');

let passed = 0, failed = 0;
function ok(name, cond) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.error('  ✗ ' + name); }
}
function eq(name, a, b) { ok(name + ' (got ' + a + ')', a === b); }

console.log('Pathfinding tests\n');

// --- MinHeap pops in ascending priority order ---
(() => {
  const h = new PF.MinHeap();
  [5, 1, 8, 3, 2, 9, 4].forEach(n => h.push('n' + n, n));
  const order = [];
  while (h.size) order.push(h.pop());
  ok('min-heap yields sorted order',
    order.join() === ['n1', 'n2', 'n3', 'n4', 'n5', 'n8', 'n9'].join());
})();

// --- Open grid: shortest path length == Manhattan distance + 1 cells ---
(() => {
  const grid = { rows: 5, cols: 5, walls: new Set() };
  const start = { r: 0, c: 0 }, end = { r: 4, c: 4 };
  const d = PF.dijkstra(grid, start, end);
  const a = PF.astar(grid, start, end);
  eq('dijkstra cost on open 5x5', d.cost, 8);
  eq('astar cost on open 5x5', a.cost, 8);
  eq('path has 9 cells', d.path.length, 9);
  ok('path starts at start', d.path[0].r === 0 && d.path[0].c === 0);
  ok('path ends at end', d.path[8].r === 4 && d.path[8].c === 4);
})();

// --- A* expands no more nodes than Dijkstra (heuristic guidance) ---
(() => {
  const grid = { rows: 15, cols: 15, walls: new Set() };
  const start = { r: 0, c: 0 }, end = { r: 14, c: 14 };
  const d = PF.dijkstra(grid, start, end);
  const a = PF.astar(grid, start, end);
  eq('A* and Dijkstra agree on optimal cost', a.cost, d.cost);
  ok('A* visits <= Dijkstra (' + a.visited.length + ' <= ' + d.visited.length + ')',
    a.visited.length <= d.visited.length);
})();

// --- Walls force a detour, increasing cost ---
(() => {
  // Wall blocks the whole middle column except the bottom cell.
  const walls = new Set();
  for (let r = 0; r < 4; r++) walls.add(PF.key(r, 2));
  const grid = { rows: 5, cols: 5, walls };
  const d = PF.dijkstra(grid, { r: 0, c: 0 }, { r: 0, c: 4 });
  ok('detour around wall costs more than straight line', d.cost > 4);
  ok('no path cell sits on a wall', d.path.every(p => !walls.has(PF.key(p.r, p.c))));
})();

// --- Fully walled-off target is unreachable ---
(() => {
  const walls = new Set([PF.key(0, 1), PF.key(1, 0), PF.key(1, 1)]);
  const grid = { rows: 5, cols: 5, walls };
  const d = PF.dijkstra(grid, { r: 0, c: 0 }, { r: 4, c: 4 });
  // start is boxed in its own corner
  const boxed = new Set();
  boxed.add(PF.key(0, 1)); boxed.add(PF.key(1, 0));
  const grid2 = { rows: 5, cols: 5, walls: boxed };
  const d2 = PF.dijkstra(grid2, { r: 0, c: 0 }, { r: 4, c: 4 });
  eq('unreachable target has empty path', d2.path.length, 0);
  eq('unreachable cost is Infinity', d2.cost, Infinity);
})();

// --- Weighted cells make a longer-but-cheaper route preferable ---
(() => {
  const weights = new Map();
  // Make the direct row 0 expensive so the search dips down a row.
  weights.set(PF.key(0, 1), 9);
  weights.set(PF.key(0, 2), 9);
  const grid = { rows: 3, cols: 3, walls: new Set(), weights };
  const d = PF.dijkstra(grid, { r: 0, c: 0 }, { r: 0, c: 2 });
  ok('weighted detour avoids expensive cells',
    d.path.some(p => p.r !== 0)); // it left row 0 to dodge cost-9 cells
})();

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
