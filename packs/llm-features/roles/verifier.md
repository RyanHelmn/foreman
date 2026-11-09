# llm-features · verifier
Applies when: an LLM provider SDK, AI framework or vector database client is a dependency

## Commands
- Tests run with the provider mocked (the AI SDK mock models from `ai/test`, or a stubbed client); never spend real tokens in the suite unless the project's eval command does so deliberately.

## Obstacles to report
- A mocked model passes every test regardless of prompt changes; prompt or model changes without an eval run are INCONCLUSIVE for behaviour.
- Missing provider API keys in CI: INCONCLUSIVE, not FAILED.
