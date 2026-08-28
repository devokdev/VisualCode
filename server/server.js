import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { traceJava } from './java_tracer.js';
import { traceCpp } from './cpp_tracer.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/trace', async (req, res) => {
  const { language = 'python', code = '', inputs = {} } = req.body;

  if (!code.trim()) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    if (language === 'python') {
      const py = spawn('python', ['server/python_tracer.py']);
      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (d) => { stdout += d.toString(); });
      py.stderr.on('data', (d) => { stderr += d.toString(); });

      py.on('close', (exitCode) => {
        try {
          const result = JSON.parse(stdout);
          return res.json(result);
        } catch (e) {
          return res.json({
            success: false,
            error: stderr || stdout || 'Python trace parsing error',
            steps: [],
            totalSteps: 0,
          });
        }
      });

      // Write payload to python stdin
      py.stdin.write(JSON.stringify({ code, inputs }));
      py.stdin.end();
      return;
    }

    if (language === 'java') {
      const result = await traceJava(code, inputs);
      return res.json(result);
    }

    if (language === 'cpp') {
      const result = await traceCpp(code, inputs);
      return res.json(result);
    }

    return res.status(400).json({ error: `Unsupported language: ${language}` });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      steps: [],
      totalSteps: 0,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[VisualCode Native Trace Engine] Running on http://localhost:${PORT}`);
});
