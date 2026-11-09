---
id: expo-list-stable-rows
title: Render long lists with FlashList or FlatList, id keys and memoised rows
impact: MEDIUM
impactDescription: "every row mounts at once and re-renders on each parent update, dropping frames and memory on large lists"
roles: [implementer, reviewer]
check: "rg -nU '<ScrollView[\s\S]{0,300}\.map\('"
tags: expo, performance, lists
---
A `ScrollView` with `.map()` mounts every item. Use `FlashList` (if installed) or `FlatList`, key rows by a stable id (never the index, which breaks recycling and state on insert), wrap the row in `memo`, and pass a stable `renderItem` and handlers so memo holds.

**Incorrect:**

```tsx
<ScrollView>
  {orders.map((o, i) => <OrderRow key={i} order={o} onPress={() => open(o.id)} />)}
</ScrollView>
```

**Correct:**

```tsx
const OrderRow = memo(function OrderRow({ order, onOpen }: Props) { … })
const renderItem = useCallback(({ item }: { item: Order }) => <OrderRow order={item} onOpen={open} />, [open])

<FlatList data={orders} keyExtractor={(o) => o.id} renderItem={renderItem} />
```

Reference: https://reactnative.dev/docs/optimizing-flatlist-configuration
