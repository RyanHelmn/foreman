# php · implementer
Applies when: composer.json present
Read order: php-sql-prepared, php-unserialize-input, php-include-input, php-escape-output, php-symfony-voter, php-doctrine-fetch-join

## Iron laws
- No request value concatenated or interpolated into SQL, DQL, an `include` path or `unserialize`. Thinking "it was cast or basename()d"? That is the bug.

## Deviation rules
- Add packages only through the `composer require` the brief lists; never edit `vendor/`.
- Symfony: schema changes go in a new Doctrine migration (`bin/console make:migration`); never edit an executed one.
- Match `declare(strict_types=1);` and typed properties where the neighbouring files use them.

## Output additions
- Migration added: file name, or none.
