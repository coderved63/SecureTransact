# SecureTransact Refactoring Roadmap

This roadmap is based on the current implementation and is ordered to improve correctness first, then maintainability, then feature depth.

## Phase 1: Correctness And Safety

1. Centralize money movement.
   - Create a dedicated transaction processor/domain service used by both normal submission and admin approval.
   - Keep balance validation, account status validation, optimistic locking, and status transitions in one place.

2. Strengthen transaction request validation.
   - `DEPOSIT` should require `toAccountId` and reject `fromAccountId`.
   - `WITHDRAWAL` should require `fromAccountId` and reject `toAccountId`.
   - `TRANSFER` should require both account IDs and reject same-account transfers earlier.
   - Consider a class-level validator for `TransactionRequest`.

3. Make flagged transaction approval concurrency-safe.
   - Reuse the same optimistic-locking processor as regular transactions.
   - Define the final status when an admin approves a transaction but balance is no longer sufficient.

4. Fix frontend unmount tracking.
   - `frontend/src/hooks/useApi.js` should use `useEffect` cleanup, not `useState`, to mark the hook unmounted.

5. Make CSRF hydration deterministic.
   - Await `fetchCsrfToken()` after login/register before the next mutating request.
   - Confirm logout behavior with CSRF enabled.

## Phase 2: Backend Clean Architecture

1. Move auth registration/login business logic out of `AuthController`.
   - Add an `AuthService`.
   - Keep the controller focused on HTTP concerns.

2. Replace raw map responses with DTOs.
   - Add `UserProfileResponse`, `UpdateProfileResponse`, `MessageResponse`, and possibly `ErrorResponse`.

3. Create transaction state policy.
   - Make allowed transitions explicit.
   - Prevent accidental transitions such as `FAILED -> COMPLETED` unless intentionally supported.

4. Improve fraud rule testability.
   - Inject `Clock` instead of calling `now()` directly.
   - Add focused unit tests per rule.

5. Store triggered fraud rules structurally.
   - Replace comma-joined text with JSON or a child table.
   - Preserve rule code, points, and explanation separately.

## Phase 3: Production-Style Features

1. Add account lifecycle operations.
   - Freeze account.
   - Unfreeze account.
   - Close account when balance is zero.
   - Admin audit trail for lifecycle changes.

2. Add transaction categories and richer statements.
   - Export CSV/PDF statement.
   - Include running balance snapshots.
   - Add date presets and filters.

3. Add audit events.
   - Log login, profile updates, password changes, fraud review decisions, account status changes, and transaction processing outcomes.

4. Improve idempotency semantics.
   - Require idempotency keys for transaction submissions from the frontend.
   - Scope keys by user or endpoint if needed.
   - Return consistent status for in-flight/duplicate requests.

5. Add admin investigation workflow.
   - Add review notes.
   - Add assigned reviewer.
   - Add fraud log detail endpoint.
   - Add status filters and risk score filters.

## Phase 4: Frontend Maintainability

1. Split large page files.
   - Extract dashboard layout, sidebar, topbar, settings panel, and statement modal.
   - Keep page files as orchestration shells.

2. Consolidate repeated admin/user dashboard layout.
   - Share sidebar/topbar patterns while preserving role-specific navigation.

3. Move inline styles into reusable components or CSS modules.
   - Keep design tokens in `globals.css`.
   - Create consistent button, field, table, modal, badge, and toolbar primitives.

4. Add frontend error and empty states.
   - Make API errors consistent.
   - Add retry states and clear no-data states.

5. Add frontend tests.
   - API wrapper tests.
   - AuthContext hydration tests.
   - Dashboard smoke tests.

## Suggested First Refactor

Start with the transaction processor extraction. It gives the biggest payoff because it reduces duplicate business logic and protects the most important domain behavior: balances and transaction statuses.

Target shape:

- `TransactionProcessor`
  - `process(Transaction transaction)`
  - validates account status and balance
  - moves money
  - handles optimistic locking/retries
  - returns final status or result object

- `TransactionService`
  - validates request ownership
  - creates transaction
  - runs fraud analysis
  - calls processor for auto-approved transactions

- `AdminService`
  - validates admin decision
  - loads flagged transaction and fraud log
  - calls processor for approved transactions
  - records review outcome

