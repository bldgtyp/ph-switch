# Security Review

Date: 2025-08-19
Scope: Repository `ph-switch` React/TypeScript unit conversion application.

## Summary

Overall risk: Low. The app is a client-side unit converter with no backend calls, minimal data persistence (localStorage), and a hardened expression evaluator for unit transforms. No direct handling of PII or authentication. Primary attack surface centers on: (1) transform expression evaluation, (2) user-provided natural-language conversion input, (3) localStorage integrity, and (4) potential XSS via rendered output. Current implementation avoids `eval`, `new Function`, direct HTML injection, and network requests. Recommendations below are mostly hardening and defense-in-depth.

## Positive Practices

- No usage of `eval`, `new Function`, `Function()` constructors, or dynamic script injection.
- Transform expressions parsed via `jsep` with a restricted character allow‑list and small safe function map.
- All unit conversion arithmetic executed with `decimal.js` (reduces FP rounding surprises; not a direct security control but avoids edge-case errors).
- Natural-language parser enforces a strict input pattern (`NUMBER UNIT to/as UNIT`) limiting unexpected tokens.
- Case-insensitive alias normalization; no uncontrolled object key access patterns.
- No external fetch / axios / XHR usage; app is isolated from network exfiltration risks (aside from any third-party libs loaded by bundler/runtime CDN, standard React tooling).
- localStorage interactions are wrapped with validation, quota handling, sanity checks, and recovery on parse errors.
- Error handling avoids leaking stack traces to users (user-visible errors are generic or concise).

## Identified Risks & Analysis

| Area                     | Risk                                                                          | Likelihood | Impact | Notes                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transform Evaluator      | Expression injection bypassing allow‑list                                     | Low        | Medium | Regex `^[0-9a-zA-Z_\s+\-*/().,^%]*$` blocks quotes & semicolons, preventing string literals & function injection. Only identifier accepted is `x` / `X`. Limited operators & whitelisted math functions. Appears safe. |
| Parser Input             | Excessively large numeric or pathological input causing performance issues    | Low        | Low    | Patterns limit format; length not explicitly capped. DOS potential minimal in typical browser.                                                                                                                         |
| localStorage             | Potential storage of untrusted data leading to XSS if later rendered unsafely | Low        | Medium | Stored entries contain raw `input` string. Current UI renders result strings via React (no `dangerouslySetInnerHTML`) mitigating XSS. Still recommend explicit encoding policy.                                        |
| Output Formatting        | Display of user input in error messages                                       | Low        | Low    | Error objects embed original input; React safe rendering prevents injection unless later switched to raw HTML.                                                                                                         |
| Dependency Supply Chain  | Outdated or vulnerable packages                                               | Medium     | Medium | Need periodic `npm audit` / SCA scans. Not assessed here for CVEs.                                                                                                                                                     |
| Denial of Service        | Large multi-line inputs processed sequentially                                | Low        | Low    | Debounced 300ms; loop linear in line count. Add soft cap for extremely large inputs (e.g., >500 lines).                                                                                                                |
| Precision / Numeric Edge | Division by zero in transforms                                                | Low        | Low    | Author-controlled configs; evaluator would throw -> caught and surfaced. Provide explicit guard if future user-extensible.                                                                                             |
| Insecure Randomness      | `Math.random()` for ID generation                                             | Low        | Low    | IDs are non-security tokens; acceptable.                                                                                                                                                                               |

## Detailed Findings & Recommendations

1. Transform Evaluator Hardening
   - Current allow‑list is adequate. Consider tightening: remove `%` if not required; audit need for `pow`/`min`/`max` and remove unused functions to reduce surface.
   - Add explicit AST depth or node count guard to prevent potential worst-case parse time if expressions ever become user-supplied (they are presently config-supplied).

2. Input Handling / Parser
   - Enforce maximum input length (e.g., 2KB per line, 200 lines total) to preempt accidental large pastes causing UI lag.
   - Add normalization step to collapse multiple hyphens or spaces to canonical single form before alias lookup—helps consistent caching.

3. localStorage Usage
   - Stored entries include raw input and output text only; minimal risk now. Add a small sanitization or encoding function before display—even though React escapes by default—to future-proof if `dangerouslySetInnerHTML` is ever introduced.
   - Consider namespacing versioned key: `ph-switch:v1:history` for easier migration logic.
   - Add explicit expiry or prune older entries by age (e.g., 90 days) to prevent indefinite growth (currently capped at 100 entries; acceptable but document it).

4. Error Messaging
   - Ensure no sensitive internal details are added in future (currently safe). Maintain a policy: user errors should not include stack traces.

5. Dependency & Build Security
   - Run `npm audit --production` (or a dedicated SCA tool) before deployment; triage high severity findings. Lockfile pinning recommended (ensure `package-lock.json` is committed; not visible in provided tree—add if missing).
   - Set up Dependabot / Renovate for ongoing patch updates.

6. Content Security Policy (CSP)
   - For deployment (if served via static hosting), supply strict CSP headers: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';` Adjust for actual needs (inline style hashing if removing `'unsafe-inline'`).
   - Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` with minimal grants, `X-Frame-Options: DENY` (or rely on CSP frame-ancestors), and `Strict-Transport-Security` when using HTTPS.

7. Privacy & Data Minimization
   - Document exactly what is stored: limited conversion history with units and numeric values only; clarify that no PII is collected.
   - Provide a “Clear History” UI action (if not already) calling `localStorage.removeItem(...)` for user control.

8. Performance / DOS Considerations
   - Debounce already mitigates rapid input churn. Add cancellation logic inside `processConversions` to discard stale runs if user keeps typing (avoid potential race conditions). Not a security vulnerability, but improves resilience.

9. Supply of Unit Configurations
   - Currently static. If in future configs become remotely loaded, ensure signature or checksum validation before use to prevent malicious transform injection.

10. Logging

- Console logs are fine for dev. For production build, consider gating all console.log/debug behind `NODE_ENV !== 'production'` to avoid leaking operational info to end users (not sensitive data, but a cleanliness measure).

## Quick Checklist

- [x] No dynamic code execution primitives (eval/new Function) present.
- [x] Expression evaluator constrained & validated.
- [x] No direct innerHTML / dangerouslySetInnerHTML usage found.
- [x] No network fetch/exfil in code.
- [x] localStorage access validated & bounded (100 entries).
- [ ] Add input length limits.
- [ ] Add dependency auditing in CI.
- [ ] Add CSP/security headers in deployment environment docs.
- [ ] Provide explicit history clear control (verify or implement).
- [ ] Commit lockfile & enable automated dependency updates.

## Prioritized Recommendations

1. Introduce CI step: `npm audit --omit=dev` + fail on High severity (manual approval override).
2. Add CSP & security headers in hosting configuration (Netlify, Vercel, S3, etc.).
3. Implement input length guard + early bail for >N lines.
4. Provide user-facing Clear History button (if absent) and document data stored.
5. Harden transform evaluator by removing unused operators/functions (if `%` not needed) and adding AST depth limit.

## Conclusion

Current implementation is appropriately cautious for a client-only converter. No critical vulnerabilities identified. Proceed with deployment after addressing dependency audit and adding recommended headers. Ongoing vigilance: monitor dependencies and avoid expanding expression language without corresponding validation.
