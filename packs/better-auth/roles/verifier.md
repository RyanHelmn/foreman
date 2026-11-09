# better-auth · verifier
Applies when: `better-auth` is a dependency

## Commands
- Schema drift: `npx @better-auth/cli generate` must leave the schema file unchanged after a plugin or field change; a diff means the migration is missing.

## Obstacles to report
- Tests that mock `auth.api.getSession` pass whether or not the handler calls it: an unauthenticated-request test is the only proof.
- Rate limiting is off outside production, so passing tests say nothing about it.
