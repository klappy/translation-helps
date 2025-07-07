# React → Svelte Migration Plan

## 1. Current Baseline Metrics (07-Jul-2025)

_Source branch:_ `dev`

| Metric | Value | Notes |
| --- | --- | --- |
| Bundle size (JS, post-build) | **556 KB** (minified) | `vite build` → `dist/assets/*.js` |
| Total static assets | **724 KB** | `dist/assets/` directory |
| React component count | **74** production components | Excludes `.test.jsx`, backups, and story files |
| Runtime dependencies | **17** packages | From `package.json` `dependencies` field |
| Test files | 19 `*.test.jsx` | Unit & integration tests |
| Build tool | Vite 4 | via `vite.config.ts` |
| React version | 18.2.0 | `package.json` |

> These numbers were gathered on 07-Jul-2025 using automated CLI scripts (`find`, `du`, `vite build`). They serve as the baseline against which all Svelte migrations will be measured.

---

## 2. Migration Strategy Overview

We will employ a **"Strangler-Fig"** pattern, incrementally enveloping the existing React UI with Svelte islands until React can be excised.

1. Bootstrap a parallel SvelteKit shell inside the monorepo (`svelte-poc/`).
2. Expose Svelte components as custom elements to embed within React during coexistence.
3. Route low-complexity, high-traffic pages to Svelte first (landing, auth, settings).
4. Gradually port complex dashboards and shared widgets.
5. Decommission React, drop its deps, and perform a full perf regression audit.

---

## 3. Phase Breakdown & Timeline

| Phase | Sprint(s) | Goal |
| --- | --- | --- |
| Foundation | 0-1 | Create SvelteKit shell, align ESLint/Prettier, set up CI job |
| Bridge Layer | 2-3 | Embed first Svelte island via `svelte-web-components`, establish shared routing context |
| Priority Pages | 4-7 | Port landing, auth, settings; A/B test with Mirage flags |
| Complex Widgets | 8-13 | Migrate dashboards, charting, data grids; retire Redux slices |
| React Decommission | 14-15 | Remove bridge, purge React deps, shrink bundle |
| Polish & Docs | 16-18 | Final QA, docs, stakeholder sign-off, `staging` → `production` |

_Total duration: ≈18 weeks; core squad: 5 FE devs, 1 QA, 1 DevOps._

---

## 4. Risk Mitigation

• **Library gaps**: Favor lightweight vanilla wrappers; track in risk register.
• **Team ramp-up**: 1-week Svelte workshop; pair programming sessions.
• **SEO parity**: Native SvelteKit SSR maintains ranking.
• **Legacy divergence**: Maintain dual-runtime CI until React fully removed.

---

## 5. KPIs & Success Criteria

| KPI | Target |
| --- | --- |
| Bundle JS size | ≤ **300 KB** gzipped |
| Lighthouse Performance | ≥ **90** across pages |
| Main-thread idle | ↑ **25 %** vs. baseline |
| Error rate | ≤ baseline |
| Team velocity | No drop after sprint 3 |

---

*Maintained by **Prowl** – last updated 07-Jul-2025.*