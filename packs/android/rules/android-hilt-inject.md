---
id: android-hilt-inject
title: Inject dependencies with Hilt bindings per layer; don't construct them in ViewModels
impact: MEDIUM
impactDescription: "the ViewModel can't be tested with a fake and creates a second HTTP client and cache"
roles: [implementer, reviewer]
tags: android, hilt, structure
---
ViewModels take interfaces through an `@Inject` constructor. Implementations are bound in a module for their layer (network, data, domain) installed in the right component, matching the modules the project already has.

**Incorrect:**

```kotlin
class OrdersViewModel : ViewModel() {
  private val repo = OrdersRepositoryImpl(Retrofit.Builder().baseUrl(BASE).build().create(OrdersApi::class.java))
}
```

**Correct:**

```kotlin
@HiltViewModel
class OrdersViewModel @Inject constructor(private val repo: OrdersRepository) : ViewModel()

@Module @InstallIn(SingletonComponent::class)
abstract class DataModule {
  @Binds abstract fun ordersRepository(impl: OrdersRepositoryImpl): OrdersRepository
}
```

Reference: https://developer.android.com/training/dependency-injection/hilt-android
