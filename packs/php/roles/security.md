# php · security
Applies when: composer.json present
Read order: php-sql-prepared, php-unserialize-input, php-include-input, php-escape-output, php-symfony-voter

## Also trace (no rule file yet)
- `exec`, `shell_exec`, `system`, `passthru`, backticks with input not wrapped in `escapeshellarg`; prefer Symfony `Process` with an argument array.
- `file_get_contents`/`fopen`/`readfile` with a request path or URL (path traversal, SSRF, `phar://`).
- Uploads stored under the web root with a client-chosen extension.
- `==` comparisons of tokens or hashes (type juggling); use `hash_equals`.
- Symfony: `APP_ENV=dev` or the profiler/`web-profiler-bundle` enabled in production; `security.yaml` firewalls with `security: false` on app routes.

## Commands
- `composer audit` (Composer ≥ 2.4) when `composer.json` or `composer.lock` changed.
