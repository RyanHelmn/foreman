# laravel · security
Applies when: laravel/framework in composer.json, or an artisan file present
Read order: lara-policy-authorize, lara-mass-fillable, lara-raw-bindings, lara-blade-unescaped, lara-validate-form-request

## Also trace (no rule file yet)
- `APP_DEBUG=true` or `APP_ENV=local` in a production env file or deploy config: error pages leak env values and stack traces.
- Telescope, Horizon, Pulse or `/log-viewer` reachable in production without a gate.
- Routes in `routes/web.php` excluded from CSRF in `VerifyCsrfToken::$except` / `validateCsrfTokens(except:)` that use the session.
- `Storage::disk('public')` for private uploads; `response()->download()` or `Storage::get()` with a request path.
- `throttle` middleware on login, password reset, and verification routes.
- `redirect($request->input('next'))` without a same-host check.

## Commands
- `composer audit` when `composer.json` or `composer.lock` changed.
