# Bounded contexts

Each folder in `modules/` is a bounded context. Add only the layers a context needs:

```
modules/<context>/
├── domain/          # Entities, value objects, aggregates, domain events, repository interfaces. Pure TS — no Next/React/IO.
├── application/     # Use cases orchestrating the domain. Depends on domain only.
├── infrastructure/  # Repository implementations, API clients, DB access. Implements domain/application ports.
├── presentation/    # React components, views, server actions for this context.
└── index.ts         # Public API — other code imports from "@/modules/<context>" only.
```

Dependency rule: `presentation → application → domain ← infrastructure`.
`src/app/` stays a thin routing layer that imports from module public APIs.
Cross-context building blocks live in `src/shared/`.
