# docker gotchas

- [gotcha] compose depends_on only waits for the container to start; add a healthcheck on the database and `condition: service_healthy` or the app races it · paths: **/*compose*.y*ml
- [gotcha] Host node_modules copied into a Linux image carry macOS native binaries (bcrypt, sharp, esbuild) and crash at require time · paths: **/Dockerfile*
- [gotcha] Inside compose, services reach each other by service name, not localhost; DATABASE_URL differs between host and container · paths: **/*compose*.y*ml
