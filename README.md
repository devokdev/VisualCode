# 🚀 VisualCode

**VisualCode** is a next-generation, high-fidelity code execution visualizer and educational platform designed for LeetCode, DSA, and competitive programming. It transforms complex code into interactive, step-by-step visual animations with live pointer tracking, stack frames, heap inspection, and plain-English explanations that anyone—from beginners to experienced engineers—can understand.

---

## 🌟 Key Highlights

- **🧠 Real Native Runtime Tracing**:
  - **Python**: Line-by-line interpreter hooks via `sys.settrace()` (reusing Python Tutor's battle-tested `pg_logger` engine).
  - **Java**: Java Debug Interface (`JDI` / `jdb`) for stepping, stack frame inspection, and heap array tracking.
  - **C++**: GDB Machine Interface (`gdb --interpreter=mi2`) for `-exec-step`, `-stack-list-variables`, and `-data-evaluate-expression`.
- **⚡ Universal Custom Code Interpreter**: Executes your exact custom code line-by-line (e.g. brute-force nested loops, custom swaps, two pointers, binary search) with zero hardcoded assumptions.
- **🌐 Direct LeetCode GraphQL Scraper & Fast Autocomplete**:
  - Scrapes official problem data, starter code (Python, Java, C++), descriptions, constraints, and test cases directly from LeetCode.
  - 0ms instant autocomplete suggestions for top curated problems with debounced live search fallback.
- **🧪 Interactive Testcase & Custom Input Console**:
  - One-click switching between official LeetCode example test cases (`Case 1`, `Case 2`, `Case 3`).
  - Edit or enter custom input arrays, target values, and tree structures in real-time.
- **🎛️ Python Tutor-Style Stepping Timeline**:
  - `<< First`, `< Prev`, `Next >`, and `Last >>` controls with full keyboard navigation (<kbd>→</kbd>, <kbd>←</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>).
- **💡 Plain-English Narrative Cards (Non-Coder Friendly)**:
  - Multi-phase real-world conceptual stories for every step (e.g. 🔄 *Swapping Values*, 🔍 *Checking Condition*, 📦 *Saving into Temp Holding Box*, ➡️ *Moving Pointers*).
- **🤖 AI Dedicated Exclusively to Error Diagnosis**:
  - AI (DeepSeek / OpenRouter) is called strictly when runtime exceptions or output mismatches occur to classify errors (Syntax, Semantic, Logic) and generate code fix diffs.

---

## 🎨 Visualization Engines

| Data Structure | Visualization Engine | Features |
|---|---|---|
| **Arrays & Matrices** | Framer Motion & Spring Physics | Multi-array transformations, glowing pointer chips (`i`, `j`, `left`, `right`, `start`, `end`, `mid`), swap animations, and mutation diffs. |
| **Hash Maps & Sets** | Dynamic Memory Table | Live key-value insertion table tracking seen entries and complement lookups. |
| **Binary Trees & BSTs** | D3 Hierarchy | Interactive, zoomable, draggable binary trees with recursive stack highlight and active node indicators. |
| **Linked Lists** | React Flow (`@xyflow/react`) | Animated directed link transitions, pointer badges (`head`, `curr`, `prev`, `next`), and node value boxes. |
| **Graphs** | Cytoscape.js | Directed and undirected graph traversals with BFS/DFS exploration states. |

---

## 🛠️ Architecture

```
   ┌────────────────────────────────────────────────────────┐
   │         VisualCode React / Framer Motion Web App       │
   └───────────────────────────▲────────────────────────────┘
                               │ POST /api/trace (Unified Trace JSON)
   ┌───────────────────────────┴────────────────────────────┐
   │            VisualCode Native Trace Server (Port 3001)  │
   ├───────────────────┬───────────────────┬────────────────┤
   │      PYTHON       │       JAVA        │      C++       │
   │  sys.settrace()   │  Java JDI / JDB   │   GDB/MI v2    │
   │ (pg_logger model) │ (Debug Stepper)   │ (Machine Inter)│
   └───────────────────┴───────────────────┴────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python 3** (for Python native tracing)
- **JDK 17+** (for Java JDI native tracing)
- **g++ / GDB** (for C++ GDB/MI native tracing)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/devokdev/VisualCode.git
cd VisualCode
npm install
```

### 2. Start the Development Servers

#### Start the Native Trace Backend:
```bash
npm run server
```
*Runs on `http://localhost:3001`.*

#### Start the Vite Frontend:
```bash
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🔑 AI Error Diagnostics Configuration (Optional)
AI is used solely for error classification and code fixes. You can provide a free OpenRouter API key via the **API Key** settings modal in the top navigation bar.

---

## 📜 License
MIT License. Built with ❤️ for computer science students, educators, and software engineers.
