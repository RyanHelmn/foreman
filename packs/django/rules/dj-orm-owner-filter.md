---
id: dj-orm-owner-filter
title: Scope every lookup to request.user in the queryset, including DRF get_queryset
impact: CRITICAL
impactDescription: "any logged-in user reads or edits another user's rows by changing the pk in the URL"
roles: [implementer, reviewer, security]
check: "rg -n 'objects\\.get\\(pk=|get_object_or_404\\(\\w+, pk=|queryset = \\w+\\.objects\\.all\\(\\)' --type py"
tags: auth, django
---
Source: a pk or slug from the URL or body. Sink: `Model.objects.get`, `get_object_or_404`, or a DRF viewset's `queryset`. `@login_required` and `IsAuthenticated` prove who the caller is, not that the row is theirs. Filter by owner in the same query; in DRF override `get_queryset()` instead of a class-level `queryset = Model.objects.all()`.

**Incorrect:**

```python
@login_required
def invoice_detail(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
```

**Correct:**

```python
@login_required
def invoice_detail(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk, owner=request.user)

class InvoiceViewSet(ModelViewSet):
    def get_queryset(self):
        return Invoice.objects.filter(owner=self.request.user)
```
