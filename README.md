# 🚀 VisualCode

**VisualCode** is an AI-powered code execution visualizer and error diagnosis platform designed for LeetCode and competitive programming problems. It helps developers understand *exactly what their code does* step-by-step with real-time pointer tracking, call stack frames, and robust 3-tier error classification.

---

## ✨ Features

- **🌐 Direct Problem Fetching**: Search any LeetCode problem by name (e.g. *"Validate Binary Search Tree"*, *"Invert Binary Tree"*, *"Number of Islands"*) or number to instantly fetch problem statements, test cases, constraints, and starter templates.
- **⚡ Multi-Language Support**: Write and visualize code in **Python**, **Java**, and **C++** with full Monaco Editor syntax highlighting.
- **🚦 3-Tier Error Classification**:
  - 🔴 **Syntax Error**: Immediate compiler and parser detection with exact line indicators and fix recommendations.
  - 🟠 **Semantic / Runtime Error**: Runtime crash detection (e.g. `NullPointerException`, null/None dereferencing, out-of-bounds) with call stack inspection.
  - 🟡 **Logical Error**: When code runs cleanly but produces incorrect output/data structures, it provides diff analysis (Expected vs Actual) and visualizes *what your code actually did wrong*.
  - 🟢 **Success**: Clean execution with celebratory confetti.
- **🌲 Battle-Tested Visualizers**:
  - **D3-Hierarchy Tree Visualizer**: Interactive, zoomable, draggable Binary Search Trees / Binary Trees with active node glowing and pointer tracking (`root`, `curr`, `p`, `q`).
  - **Cytoscape Graph Visualizer**: Directed & undirected graphs with edge traversal indicators.
  - **Sequence & Pointer Visualizer**: 1D arrays with two-pointer tracking (`left`, `right`, `mid`), linked lists with pointer arrows, and 2D grid matrices.
- **🎛️ Interactive Step-by-Step Timeline**: Step backward/forward, scrub timeline, and auto-play with 0.5x, 1x, 2x speeds accompanied by plain-English line explanations.
- **📦 State Inspector**: Real-time variables watcher and recursion depth call stack frames.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Code Editor**: `@monaco-editor/react`
- **Visualization Engines**: `d3`, `d3-hierarchy`, `cytoscape`
- **AI Execution Engine**: OpenRouter API (`google/gemini-2.5-flash`)
- **Styling & UI**: Tailwind CSS, `lucide-react`, `canvas-confetti`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/devokdev/VisualCode.git
cd VisualCode

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 OpenRouter API Configuration
You can configure your OpenRouter API key directly in the UI via the **API Key** settings button in the top search bar.
