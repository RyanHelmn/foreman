---
id: py-subprocess-no-shell
title: Call subprocess with an argument list, never shell=True or os.system on input
impact: CRITICAL
impactDescription: "a filename like `x; rm -rf ~` runs arbitrary commands on the server"
roles: [implementer, reviewer, security]
check: "rg -n 'shell=True|os\\.system\\(|os\\.popen\\(' --type py"
tags: security, python
---
Source: any request field, filename or DB value. Sink: `subprocess.*(..., shell=True)`, `os.system`, `os.popen`. Pass a list so no shell parses the input; put `--` before user values the tool could read as flags. `shlex.quote` is a patch, not the fix.

**Incorrect:**

```python
subprocess.run(f"convert {upload.filename} out.png", shell=True, check=True)
```

**Correct:**

```python
subprocess.run(["convert", "--", upload_path, "out.png"], check=True, timeout=30)
```

Reference: https://docs.python.org/3/library/subprocess.html#security-considerations
