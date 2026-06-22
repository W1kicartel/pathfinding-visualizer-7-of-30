# Pathfinding Visualizer — Dijkstra & A*

**Tool 7 of 30 — Building in public.**

An interactive grid where you can watch **Dijkstra's algorithm** and **A\* search**
explore their way from a start cell to a goal. Draw walls with the mouse, drag the
start/goal around, generate a maze, and compare how many cells each algorithm has
to visit to find the *same* optimal path.

The heart of the project is `pathfinding.js` — a dependency-free module with a real
**binary-heap priority queue** and both search algorithms written as pure, testable
functions.

![Pathfinding Visualizer screenshot](screenshot.png)

## Why it's interesting

- **Real data structure** — a hand-written binary min-heap (O(log n) push/pop)
  serves as the frontier, instead of re-sorting an array each step.
- **One tested code path, two algorithms** — Dijkstra and A* share a single
  best-first `search()`; A* just adds the Manhattan heuristic. This keeps the
  logic DRY and makes the heuristic's effect easy to see.
- **Correct & optimal** — the test suite proves both find the lowest-cost path,
  that A* never expands more nodes than Dijkstra, that walls force detours, and
  that unreachable goals return no path.
- **Weighted grids** — cells can carry movement costs, not just walls.

## Features

- Interactive grid: drag to draw/erase walls, drag start (green) and goal (red).
- Animated search: visited cells fill in, then the shortest path lights up.
- Algorithm switch (A* ↔ Dijkstra) and an adjustable animation speed.
- **Recursive-division maze generator**.
- Live stats: cells visited, path length and total cost.

## Run it

A single static page — no build step.

```bash
open index.html      # macOS
start index.html     # Windows
# or: npx serve .
```

## Tests

```bash
node pathfinding.test.js
```

Sample output:

```
✓ min-heap yields sorted order
✓ A* and Dijkstra agree on optimal cost (got 28)
✓ A* visits <= Dijkstra (140 <= 225)
...
13 passed, 0 failed
```

## Tech & skills demonstrated

- Graph search: **Dijkstra** and **A\*** with an admissible (Manhattan) heuristic
- Data structures: **binary min-heap** priority queue, `Map`/`Set` for scores & walls
- Pure functions + a Node test suite (correctness, optimality, edge cases)
- DOM rendering, mouse drag interaction, `async`/`await` animation, procedural maze generation
- UMD module pattern: the same code runs in the browser and under Node

## Project structure

```
index.html          # interactive grid UI + animation
pathfinding.js      # MinHeap + Dijkstra + A* (browser & Node)
pathfinding.test.js # zero-dependency unit tests
```

---

Part of my [30 tools in 30 days](https://github.com/w1kicartel) series.
