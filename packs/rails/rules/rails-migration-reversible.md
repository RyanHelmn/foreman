---
id: rails-migration-reversible
title: Write migrations that roll back: typed remove_column, or up/down for irreversible steps
impact: MEDIUM
impactDescription: "a failed deploy cannot be rolled back; db:rollback raises IrreversibleMigration"
roles: [implementer, reviewer]
tags: migrations
---
`change` only reverses operations Rails can invert. `remove_column` without a type, `change_column`, and `execute` are irreversible there. Give `remove_column` its type, wrap SQL in `reversible do |dir|` or write `up`/`down`. Never edit a migration that has run on a shared environment; add a new one.

**Incorrect:**

```ruby
def change
  remove_column :users, :nickname
  execute "UPDATE orders SET status = 'open' WHERE status IS NULL"
end
```

**Correct:**

```ruby
def change
  remove_column :users, :nickname, :string
  reversible do |dir|
    dir.up { execute "UPDATE orders SET status = 'open' WHERE status IS NULL" }
  end
end
```

Reference: https://guides.rubyonrails.org/active_record_migrations.html#using-reversible
