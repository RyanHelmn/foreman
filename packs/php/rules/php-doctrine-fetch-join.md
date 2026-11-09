---
id: php-doctrine-fetch-join
title: Fetch-join Doctrine associations that a list iterates
impact: HIGH
impactDescription: "one query per row when a lazy association is touched in a loop or template"
roles: [implementer, reviewer]
tags: doctrine, n+1
---
Doctrine associations are lazy proxies. Touching `$order->getCustomer()->getName()` in a loop or Twig `for` issues one query per row. Join and select the association in the repository query that loads the list.

**Incorrect:**

```php
return $this->createQueryBuilder('o')->where('o.status = :s')->setParameter('s', $status)->getQuery()->getResult();
```

**Correct:**

```php
return $this->createQueryBuilder('o')
    ->addSelect('c')->join('o.customer', 'c')
    ->where('o.status = :s')->setParameter('s', $status)
    ->getQuery()->getResult();
```

Reference: https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/dql-doctrine-query-language.html#joins
