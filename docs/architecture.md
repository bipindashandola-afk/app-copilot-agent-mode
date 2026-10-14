# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the React views thin and data-driven; they should fetch from the shared API client, show loading and empty states, and surface API failures with accessible alerts without direct database or business logic.
- Logic tier decision: Build the Express route/service layer to validate inputs, convert IDs safely, and return deliberate 4xx responses rather than leaking cast errors or generic 500s.
- Data tier decision: Add required Mongoose validation for core entities, default empty member arrays, and seed representative records idempotently so the API and frontend can rely on consistent contracts.
- Activity tracking approach: Validate `userId`/`teamId` against existing records, compute `points` from minutes, store `occurredAt`, and reject malformed or missing references with a controlled 4xx.
- Team management approach: Require a team `name` and `mascot`, accept `members` as object IDs, and preserve team membership arrays as the source of truth for UI and leaderboard calculations.
- Leaderboard approach: Aggregate team activity points in the service layer, sort descending by total, and assign 1-based ranks without mutating the underlying records.
- Workout suggestions approach: Match a user's recent activity pattern and goal to seeded workout recommendations, include an explanatory `reason`, and return a 4xx for unknown users instead of a sparse or empty fallback.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — fails first because the schemas are missing required validation; this is the foundation to fix before API work.
- API command: `npm run test:api --prefix octofit-tracker/backend` — exposes the service contract gaps: invalid activity/team payloads still return 501, leaderboard is empty, and workout suggestions are not matched to the user's activity pattern.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — verifies the UI contract: it must show loading, empty, and error states, and render data from the shared API client rather than placeholder text.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — confirms the TypeScript logic compiles once the data and API contracts are implemented.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — confirms the presentation tier compiles with the shared client and accessible UI states.
