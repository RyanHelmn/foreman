# node gotchas

- [gotcha] Fastify plugins are encapsulated: a hook or decorator registered inside one plugin does not apply to sibling plugins unless the plugin is wrapped with fastify-plugin · paths: **/plugins/**
- [gotcha] Express 4's default query parser turns ?email[$ne]=x into an object, so req.query.email is not always a string; validate query with a schema · paths: **/routes/**
- [gotcha] Express middleware order is execution order: express.json() or auth registered after a router does not run for that router · paths: **/app.ts
- [gotcha] Exporting the app separately from listen() lets Supertest, Fastify inject() and Hono app.request() test it without binding a port · paths: **/server.ts
