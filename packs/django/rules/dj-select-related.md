---
id: dj-select-related
title: select_related for FK/one-to-one, prefetch_related for reverse and many-to-many
impact: HIGH
impactDescription: "a 50-row list runs 51+ queries; templates and serializers hide the loop"
roles: [implementer, reviewer]
tags: django, performance
---
Accessing `obj.fk` or `obj.related_set.all()` per row in a view, template or DRF serializer issues a query per row. Add `select_related` (SQL join) for forward FK/one-to-one and `prefetch_related` (one extra query) for reverse FK and M2M on the queryset that feeds the loop. Use `Prefetch(..., queryset=...)` when the related rows need filtering. `assertNumQueries` in a test pins it.

**Incorrect:**

```python
orders = Order.objects.filter(owner=request.user)
# template: {% for o in orders %}{{ o.customer.name }} {{ o.items.count }}{% endfor %}
```

**Correct:**

```python
orders = (Order.objects.filter(owner=request.user)
          .select_related("customer")
          .prefetch_related("items"))
```

Reference: https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related
