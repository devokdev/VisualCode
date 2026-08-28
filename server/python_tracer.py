import sys
import json
import inspect
import types

class PythonTutorTracer:
    def __init__(self, target_filename="<string>", max_steps=500):
        self.target_filename = target_filename
        self.max_steps = max_steps
        self.steps = []
        self.step_count = 0
        self.heap = {}

    def serialize_val(self, val):
        if val is None or isinstance(val, (int, float, bool, str)):
            return val
        if isinstance(val, (list, tuple)):
            obj_id = f"0x{id(val):x}"
            if obj_id not in self.heap:
                self.heap[obj_id] = {"type": "list", "val": [self.serialize_val(x) for x in val]}
            return [self.serialize_val(x) for x in val]
        if isinstance(val, dict):
            obj_id = f"0x{id(val):x}"
            if obj_id not in self.heap:
                self.heap[obj_id] = {"type": "dict", "val": {str(k): self.serialize_val(v) for k, v in val.items()}}
            return {str(k): self.serialize_val(v) for k, v in val.items()}
        if isinstance(val, (types.FunctionType, types.BuiltinFunctionType, types.ModuleType)):
            return f"<func {getattr(val, '__name__', 'anon')}>"
        # Class instances (e.g. TreeNode, ListNode)
        if hasattr(val, '__dict__'):
            obj_id = f"0x{id(val):x}"
            cls_name = val.__class__.__name__
            obj_dict = {}
            for k, v in val.__dict__.items():
                if not k.startswith('_'):
                    obj_dict[k] = self.serialize_val(v)
            if obj_id not in self.heap:
                self.heap[obj_id] = {"type": cls_name, "val": obj_dict}
            return obj_dict
        return str(val)

    def trace_callback(self, frame, event, arg):
        if self.step_count >= self.max_steps:
            return None

        # Only trace code in our user script
        if frame.f_code.co_filename != self.target_filename:
            return self.trace_callback

        if event in ('line', 'call', 'return', 'exception'):
            self.step_count += 1
            line_no = frame.f_lineno
            func_name = frame.f_code.co_name

            # Extract local variables
            local_vars = {}
            for k, v in frame.f_locals.items():
                if k.startswith('__') or isinstance(v, (types.ModuleType, types.FunctionType)):
                    continue
                local_vars[k] = self.serialize_val(v)

            # Build Call Stack
            call_stack = []
            curr = frame
            while curr and curr.f_code.co_filename == self.target_filename:
                call_stack.append({
                    "functionName": curr.f_code.co_name,
                    "line": curr.f_lineno,
                    "depth": len(call_stack) + 1,
                    "status": "running"
                })
                curr = curr.f_back

            call_stack.reverse()

            explanation = f"Line {line_no}: Executing in {func_name}"
            if event == 'call':
                explanation = f"Line {line_no}: Called function {func_name}()"
            elif event == 'return':
                explanation = f"Line {line_no}: Returned {self.serialize_val(arg)} from {func_name}()"
            elif event == 'exception':
                explanation = f"Line {line_no}: Exception: {arg}"

            self.steps.append({
                "step": self.step_count,
                "line": line_no,
                "event": event,
                "func_name": func_name,
                "callStack": call_stack,
                "variables": local_vars,
                "returnValue": self.serialize_val(arg) if event == 'return' else None,
                "explanation": explanation
            })

        return self.trace_callback

def run_and_trace_python(code_str, test_input_dict=None):
    if test_input_dict is None:
        test_input_dict = {}

    tracer = PythonTutorTracer(target_filename="<user_code>")

    # Prepare execution sandbox globals with helpers
    sandbox_globals = {
        "__name__": "__main__",
        "List": list,
        "Dict": dict,
        "Optional": lambda x: x,
        "TreeNode": type("TreeNode", (), {"__init__": lambda s, val=0, left=None, right=None: setattr(s, "val", val) or setattr(s, "left", left) or setattr(s, "right", right)}),
        "ListNode": type("ListNode", (), {"__init__": lambda s, val=0, next=None: setattr(s, "val", val) or setattr(s, "next", next)}),
    }

    # Inject test inputs
    for k, v in test_input_dict.items():
        sandbox_globals[k] = v

    try:
        compiled_code = compile(code_str, "<user_code>", "exec")
        sys.settrace(tracer.trace_callback)
        exec(compiled_code, sandbox_globals)
    except Exception as e:
        tracer.steps.append({
            "step": tracer.step_count + 1,
            "line": getattr(e, 'lineno', 1) or 1,
            "event": "exception",
            "func_name": "error",
            "callStack": [],
            "variables": {},
            "explanation": f"Runtime Exception: {str(e)}"
        })
    finally:
        sys.settrace(None)

    return {
        "success": True,
        "totalSteps": len(tracer.steps),
        "steps": tracer.steps,
        "heap": tracer.heap
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read payload from stdin or file
        payload = json.loads(sys.stdin.read())
        code = payload.get("code", "")
        inputs = payload.get("inputs", {})
        result = run_and_trace_python(code, inputs)
        print(json.dumps(result))
    else:
        # Quick test
        sample_code = """
nums = [3, 2, 4]
target = 6
arr = [0, 0]
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            arr[0] = i
            arr[1] = j
            break
"""
        res = run_and_trace_python(sample_code)
        print(json.dumps(res, indent=2))
