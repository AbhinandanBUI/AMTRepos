# Changes

## Agile Workflow

- Added Mongoose `Project`, `Sprint`, and `AgileIssue` models with field validation, reference indexes, project/sprint virtual population, unique project keys, generated issue keys, and status/sprint history.
- Added authenticated APIs under `/api/agile` for projects, sprints, issues, sprint transitions, story assignment, and project analytics.
- Added an opt-in API seeder for Admin, ScrumMaster, ProductOwner, and Developer test accounts. It only creates `example.test` identities by default, requires an explicit enable flag and a local password, and will not alter non-test accounts.
- Enforced project membership on reads and writes. A project can have only one active sprint; project/sprint administration is limited to `ADMIN`, `Admin`, `ScrumMaster`, and `ProductOwner`. Developers can access boards and update issues.
- Starting/completing a sprint validates lifecycle state. Completing a sprint moves unfinished issues to a planned sprint when provided, otherwise back to the backlog.
- Added velocity for the last five completed sprints and daily actual/ideal burndown for the active sprint.
- Replaced demo Sprint and Board data with API-backed Angular signals. The Sprint screen supports project/sprint creation, backlog story creation and assignment, lifecycle actions, velocity, and burndown summaries.
- Added a standalone story card and Angular CDK drag/drop status changes on the four-column Kanban board.
- Added a signal-backed auth service and `roleGuard`; Sprint and Board routes now check role claims saved at sign-in. The API also enforces agile roles, so the client guard is not the security boundary.
- Added an Admin-only standalone Test Users page with Agile role selection, `.test` email validation, exact six-digit password validation, success/error feedback, and in-session created-account listing.
- Added `POST /api/users/test-users`, restricted to Admin roles. It creates active, verified, explicitly marked test accounts and never returns password data.
- Connected the existing email/password sign-in form to the API so created and seeded test users can sign in through the UI.
- Replaced the Admin Work Item Type and Development State placeholders with authenticated create/list workflows, color selection, duplicate/field validation, collection refresh, and user-facing loading/success/error states.
- Added `POST /api/common/create-work-item` and `POST /api/common/create-development-state`; existing default master-data seed endpoints remain available.
- Added project member selection during project creation and a team editor for existing projects. The Sprint page displays the current project roster with each member's name, email, role, and assignment state; creator and lead are retained automatically.
- Added management-only `GET /api/agile/users` and `PATCH /api/agile/projects/:projectId/members` endpoints. Project responses populate the lead and members for clear roster display.
- Added backlog assignee selection on story creation and reassignment for existing backlog stories. Once a story is assigned to a sprint, the Kanban board groups its status columns into project-member swimlanes plus an Unassigned bucket, so ownership is visible throughout the workflow.
- Added `PATCH /api/agile/issues/:issueId/assignee`, validating that the selected active user belongs to the issue's project; passing `assigneeRef: null` returns the story to the Unassigned bucket.
- Replaced the sample-only Backlogs page with persisted Agile backlog issues. It defaults to the signed-in user's assigned items, supports an all-project-backlog view, and can move a story into a selected sprint; the API transitions sprinted Backlog stories to `To Do` so they appear on the board.
- Fixed Tailwind v4 component stylesheet referencing so the Angular production build can resolve `@apply` utilities.

## API Routes

All routes require a valid access token and an agile workflow role.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/agile/projects` | List accessible projects or create a project |
| `GET` | `/api/agile/users` | List active users for project assignment (management roles only) |
| `PATCH` | `/api/agile/projects/:projectId/members` | Update project members while retaining the creator and lead |
| `GET`, `POST` | `/api/agile/projects/:projectId/sprints` | List or plan project sprints |
| `GET`, `POST` | `/api/agile/projects/:projectId/issues` | List or create project issues; optional `sprintId` query filters a sprint or `backlog` |
| `POST` | `/api/agile/sprints/:sprintId/start` | Start a planned sprint |
| `POST` | `/api/agile/sprints/:sprintId/complete` | Complete an active sprint; optional body `targetSprintId` moves unresolved issues to another planned sprint |
| `PATCH` | `/api/agile/issues/:issueId/status` | Change issue status and append status history |
| `PATCH` | `/api/agile/issues/:issueId/sprint` | Move an issue to a sprint or backlog (`sprintRef: null`) |
| `PATCH` | `/api/agile/issues/:issueId/assignee` | Assign an issue to a project member or clear its assignee |
| `GET` | `/api/agile/projects/:projectId/analytics` | Fetch velocity and active sprint burndown |
| `POST` | `/api/users/test-users` | Admin-only creation of an Agile test user with a reserved `.test` email |
| `POST` | `/api/common/create-work-item` | Create a custom work item type |
| `POST` | `/api/common/create-development-state` | Create an ordered development workflow state |

Project and sprint creation endpoints require `ADMIN`, `Admin`, `ScrumMaster`, or `ProductOwner`. Existing `USER` accounts must be assigned an agile role by an administrator before accessing these routes. The existing role-assignment endpoint accepts the added role values.

## Test Users

From `AMTAPI`, set `ALLOW_TEST_USER_SEED=true` and `TEST_USER_PASSWORD` to exactly six digits in the local shell or ignored `.env` file, then run `npm run seed:test-users`. The password is shared by the four fixture users on first creation. The fixture emails are `agile-admin@example.test`, `scrum-master@example.test`, `product-owner@example.test`, and `agile-developer@example.test`; override the domain with `TEST_USER_EMAIL_DOMAIN`. Rerunning updates fixture profile/role fields but retains each existing password. Do not use these accounts outside a development database.

## Validation

- `AMTUI`: `npm run build` passes.
- Updated Sprint and Board component specs pass (`2/2`).
- Full Angular suite: `16/27` pass; 11 existing tests fail in unrelated legacy component setup/API-dependent tests.
- `AMTAPI`: `node --check` passes on agile models, controllers, route, constants, and API entry point.

## Architecture Notes

The repository currently uses JavaScript ES modules for Express/Mongoose and a module-based work feature in Angular. The agile backend follows the existing JavaScript API rather than introducing a second TypeScript backend; the reusable StoryCard is standalone and the existing work module imports it. Project membership can be supplied through the project API, but a member-management screen and user picker are not part of this change. Existing unrelated in-progress worktree edits were left untouched.