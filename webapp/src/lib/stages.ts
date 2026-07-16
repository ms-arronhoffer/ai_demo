/**
 * Stage content definitions for the AI-Powered SDLC demo.
 *
 * Each stage walks students through how AI accelerates a specific phase
 * of building "TaskFlow" — a simple task management web app.
 */

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "checklist"; items: Array<{ checked: boolean; text: string }> }
  | { type: "callout"; variant: "info" | "success" | "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Stage {
  slug: string;
  number: number;
  name: string;
  tagline: string;
  summary: string;
  challenge: string;
  impact: string;
  timeSaved: string;
  humanPrompt: string;
  aiResponse: ContentBlock[];
}

export const stages: Stage[] = [
  // ─── 1. PLAN ────────────────────────────────────────────────────────────────
  {
    slug: "plan",
    number: 1,
    name: "Plan",
    tagline: "From vague idea to structured requirements in minutes.",
    summary:
      "Before writing a single line of code, AI helps teams translate a rough product vision into clear user stories, acceptance criteria, and an architecture recommendation — turning weeks of workshops into a focused 15-minute session.",
    challenge:
      "The team has a concept for TaskFlow — a task management app for small engineering teams — but no formal requirements, no architecture, and no prioritization framework.",
    impact: "Replaced a multi-day discovery workshop",
    timeSaved: "~12 hours",
    humanPrompt: `We're building TaskFlow — a task management web app for small engineering teams (2–10 people).

Please generate:
1. Core user stories (5–7) with acceptance criteria
2. A prioritized feature list (MVP vs. future)
3. A basic system architecture recommendation
4. Key technical risks to address early`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "TaskFlow Requirements Analysis",
      },
      {
        type: "heading",
        level: 3,
        text: "Core User Stories",
      },
      {
        type: "code",
        language: "markdown",
        code: `US-001 · Task Creation
As a team member, I want to create tasks with a title, description,
and due date so that I can track my work items.

Acceptance Criteria:
  ✓ Title is required (max 200 characters)
  ✓ Description is optional (max 2 000 characters)
  ✓ Due date can be set or left open
  ✓ Newly created task appears immediately in the active list
  ✓ Task creator is automatically set as the default assignee

US-002 · Task Assignment
As a team lead, I want to assign tasks to team members
so that responsibilities are clearly defined.

Acceptance Criteria:
  ✓ Any task can be assigned to one team member
  ✓ Assignee receives an in-app notification
  ✓ Task list can be filtered by assignee

US-003 · Status Tracking
As a team member, I want to move tasks through Todo → In Progress → Done
so that the whole team has real-time visibility into progress.

US-004 · Team Dashboard
As a team lead, I want a dashboard showing task counts by status per person
so that I can identify bottlenecks at a glance.`,
      },
      {
        type: "heading",
        level: 3,
        text: "Prioritized Feature List",
      },
      {
        type: "table",
        headers: ["Feature", "Priority", "Sprint"],
        rows: [
          ["Email/password authentication", "MVP", "Sprint 1"],
          ["Create / read / update / delete tasks", "MVP", "Sprint 1"],
          ["Task assignment & notifications", "MVP", "Sprint 1"],
          ["Status workflow (Todo → In Progress → Done)", "MVP", "Sprint 2"],
          ["Team dashboard with status counts", "MVP", "Sprint 2"],
          ["File attachments on tasks", "v2", "—"],
          ["Time tracking & estimates", "v2", "—"],
          ["Slack / GitHub integrations", "v3", "—"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Recommended Architecture",
      },
      {
        type: "list",
        items: [
          "Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS",
          "Backend: Next.js API Routes (serverless functions)",
          "Database: PostgreSQL via Prisma ORM",
          "Authentication: NextAuth.js (credentials + OAuth)",
          "Hosting: Vercel (frontend + API) + Neon (managed Postgres)",
          "CI/CD: GitHub Actions → Vercel Preview Deployments",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Key Technical Risks",
      },
      {
        type: "table",
        headers: ["Risk", "Likelihood", "Mitigation"],
        rows: [
          [
            "Real-time task updates cause UX staleness",
            "High",
            "Start with SWR polling; add WebSockets in v2",
          ],
          [
            "Concurrent edits overwrite data",
            "Medium",
            "Optimistic locking with updatedAt version field",
          ],
          [
            "Auth complexity delays MVP",
            "Medium",
            "Use NextAuth.js; defer OAuth to Sprint 3",
          ],
          [
            "Database schema churn",
            "Low",
            "Finalize core schema before Sprint 1 ends",
          ],
        ],
      },
      {
        type: "callout",
        variant: "success",
        text: "Recommendation: Begin with a two-day technical spike to validate the Prisma ↔ Vercel Postgres connection before committing to the full stack.",
      },
    ],
  },

  // ─── 2. CODE ────────────────────────────────────────────────────────────────
  {
    slug: "code",
    number: 2,
    name: "Code",
    tagline: "Turn requirements into production-ready TypeScript in seconds.",
    summary:
      "With requirements defined, AI acts as a senior engineer pair-programmer — scaffolding components, writing business logic, and surfacing edge cases the team might have missed.",
    challenge:
      "The team needs to implement the core TaskList component that covers US-001 through US-003: creating, displaying, filtering, and completing tasks.",
    impact: "First working component ready in under 5 minutes",
    timeSaved: "~4 hours",
    humanPrompt: `Based on US-001 and US-003 from our requirements, create a React TaskList component that:
- Displays tasks with title, assignee avatar, status badge, and due date
- Allows marking a task complete via checkbox
- Supports client-side filtering by status: All | Active | Done
- Uses TypeScript with proper interfaces
- Follows the Next.js 15 App Router + Tailwind CSS pattern
- Handles empty states gracefully`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "TaskList Component",
      },
      {
        type: "code",
        language: "typescript",
        code: `// components/TaskList.tsx
"use client";

import { useState } from "react";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  assignee: { name: string; avatarUrl: string };
  status: TaskStatus;
  dueDate: string | null;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo:        "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100  text-blue-700",
  done:        "bg-green-100 text-green-700",
};

type Filter = "all" | TaskStatus;

interface TaskListProps {
  initialTasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

export default function TaskList({ initialTasks, onToggleComplete }: TaskListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = filter === "all"
    ? initialTasks
    : initialTasks.filter((t) => t.status === filter);

  const filters: { value: Filter; label: string }[] = [
    { value: "all",         label: "All"         },
    { value: "todo",        label: "To Do"        },
    { value: "in_progress", label: "In Progress"  },
    { value: "done",        label: "Done"         },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter tasks">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={\`px-3 py-1 rounded-full text-sm font-medium transition-colors
              \${filter === value
                ? "bg-navy text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-navy"
              }\`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task rows */}
      {visible.length === 0 ? (
        <p className="text-center py-12 text-gray-500">No tasks match this filter.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {visible.map((task) => (
            <li key={task.id} className="flex items-center gap-4 px-4 py-3">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => onToggleComplete(task.id)}
                aria-label={\`Mark "\${task.title}" complete\`}
                className="h-4 w-4 rounded border-gray-300 accent-navy cursor-pointer"
              />
              <span className={\`flex-1 text-sm \${task.status === "done" ? "line-through text-gray-400" : ""}\`}>
                {task.title}
              </span>
              <img
                src={task.assignee.avatarUrl}
                alt={task.assignee.name}
                title={task.assignee.name}
                className="h-7 w-7 rounded-full object-cover border border-gray-200"
              />
              <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${STATUS_COLORS[task.status]}\`}>
                {STATUS_LABELS[task.status]}
              </span>
              {task.dueDate && (
                <span className="text-xs text-gray-400 hidden sm:block">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
      },
      {
        type: "callout",
        variant: "info",
        text: "Notice: AI added aria-label attributes and role='tablist' for accessibility — often skipped in manual first drafts.",
      },
    ],
  },

  // ─── 3. TEST ────────────────────────────────────────────────────────────────
  {
    slug: "test",
    number: 3,
    name: "Test",
    tagline: "Complete test coverage generated from the component itself.",
    summary:
      "AI reads the component's interfaces and behavior, then generates a comprehensive test suite covering renders, user interactions, filter logic, empty states, and accessibility — without the developer writing a single test manually.",
    challenge:
      "The TaskList component needs thorough test coverage before merging to main. Writing tests manually is tedious and often incomplete.",
    impact: "Full test suite on first attempt, zero manual writing",
    timeSaved: "~3 hours",
    humanPrompt: `Generate Jest + React Testing Library tests for the TaskList component.

Cover:
- Initial render with tasks
- Empty state when no tasks match filter
- Checking a task calls onToggleComplete with the correct ID
- Filter buttons show only the correct tasks
- Completed tasks display with strikethrough styling
- Accessibility: all interactive elements are keyboard-reachable`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "TaskList.test.tsx",
      },
      {
        type: "code",
        language: "typescript",
        code: `import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList, { Task } from "@/components/TaskList";

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Design database schema",
    assignee: { name: "Alice", avatarUrl: "/alice.png" },
    status: "done",
    dueDate: "2024-03-15",
  },
  {
    id: "2",
    title: "Implement auth flow",
    assignee: { name: "Bob", avatarUrl: "/bob.png" },
    status: "in_progress",
    dueDate: "2024-03-20",
  },
  {
    id: "3",
    title: "Write API tests",
    assignee: { name: "Alice", avatarUrl: "/alice.png" },
    status: "todo",
    dueDate: null,
  },
];

const noop = jest.fn();

describe("TaskList", () => {
  beforeEach(() => noop.mockClear());

  it("renders all tasks on initial load", () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    MOCK_TASKS.forEach((t) =>
      expect(screen.getByText(t.title)).toBeInTheDocument()
    );
  });

  it("shows empty state message when no tasks match filter", async () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    // Filter to 'In Progress', then switch to 'Done' — only one task matches
    await userEvent.click(screen.getByRole("tab", { name: "In Progress" }));
    expect(screen.queryByText("Design database schema")).not.toBeInTheDocument();
    expect(screen.queryByText("Write API tests")).not.toBeInTheDocument();
    expect(screen.getByText("Implement auth flow")).toBeInTheDocument();
  });

  it("calls onToggleComplete with the correct task id", async () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    const checkbox = screen.getByRole("checkbox", {
      name: /Mark "Implement auth flow" complete/i,
    });
    await userEvent.click(checkbox);
    expect(noop).toHaveBeenCalledTimes(1);
    expect(noop).toHaveBeenCalledWith("2");
  });

  it("applies strikethrough class to completed tasks", () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    const doneTitle = screen.getByText("Design database schema");
    expect(doneTitle.className).toMatch(/line-through/);
  });

  it("shows empty state when tasks array is empty", () => {
    render(<TaskList initialTasks={[]} onToggleComplete={noop} />);
    expect(screen.getByText(/No tasks match/i)).toBeInTheDocument();
  });

  it("filter buttons are keyboard-accessible", async () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    const todoBtnEl = screen.getByRole("tab", { name: "To Do" });
    todoBtnEl.focus();
    fireEvent.keyDown(todoBtnEl, { key: "Enter" });
    // Only the 'todo' task should be visible
    expect(screen.getByText("Write API tests")).toBeInTheDocument();
    expect(screen.queryByText("Implement auth flow")).not.toBeInTheDocument();
  });

  it("due dates are rendered for tasks that have them", () => {
    render(<TaskList initialTasks={MOCK_TASKS} onToggleComplete={noop} />);
    expect(screen.getByText(/Due 3\/15\/2024/i)).toBeInTheDocument();
  });
});`,
      },
      {
        type: "callout",
        variant: "success",
        text: "7 tests covering rendering, interaction, filtering, accessibility, and edge cases — generated in under 30 seconds.",
      },
    ],
  },

  // ─── 4. DOCUMENT ────────────────────────────────────────────────────────────
  {
    slug: "document",
    number: 4,
    name: "Document",
    tagline: "Accurate, maintainable docs generated directly from source code.",
    summary:
      "Documentation written after the fact is almost always incomplete or out of date. AI reads the actual TypeScript types and component logic, then generates a README, JSDoc props table, and usage examples that stay true to the implementation.",
    challenge:
      "The team needs to document the TaskList component so future contributors can use it without reading the source code.",
    impact: "Docs generated and committed alongside the code",
    timeSaved: "~2 hours",
    humanPrompt: `Generate documentation for the TaskList component including:
1. A README.md section with a description, props table, and usage example
2. JSDoc comments for all exported types and the component function
3. A brief accessibility note for screen-reader users`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "TaskList — Component Documentation",
      },
      {
        type: "code",
        language: "markdown",
        code: `## TaskList

A filterable, accessible list of tasks for the TaskFlow application.

### Props

| Prop              | Type                          | Required | Description                                         |
|-------------------|-------------------------------|----------|-----------------------------------------------------|
| \`initialTasks\`  | \`Task[]\`                    | ✅       | Array of task objects to display                    |
| \`onToggleComplete\` | \`(taskId: string) => void\` | ✅       | Callback fired when a task's checkbox is toggled    |

### Task Object Shape

\`\`\`typescript
interface Task {
  id:       string;                        // Unique identifier
  title:    string;                        // Task title (max 200 chars)
  assignee: { name: string; avatarUrl: string }; // Assigned team member
  status:   "todo" | "in_progress" | "done";
  dueDate:  string | null;                 // ISO 8601 date string, or null
}
\`\`\`

### Basic Usage

\`\`\`tsx
import TaskList from "@/components/TaskList";

export default function ProjectPage() {
  const handleToggle = (id: string) => {
    // Update task status via API route
    fetch(\`/api/tasks/\${id}/complete\`, { method: "PATCH" });
  };

  return <TaskList initialTasks={tasks} onToggleComplete={handleToggle} />;
}
\`\`\`

### Accessibility

- Filter buttons are rendered as \`role="tab"\` elements with \`aria-selected\`.
- Each checkbox carries an \`aria-label\` derived from the task title.
- All interactive elements are reachable via keyboard (\`Tab\` / \`Enter\`).`,
      },
      {
        type: "heading",
        level: 3,
        text: "Generated JSDoc Comments",
      },
      {
        type: "code",
        language: "typescript",
        code: `/**
 * Represents a single task in the TaskFlow system.
 */
export interface Task {
  /** Unique identifier (UUID). */
  id: string;
  /** Human-readable task title. Max 200 characters. */
  title: string;
  /** Team member assigned to this task. */
  assignee: { name: string; avatarUrl: string };
  /** Current workflow status. */
  status: TaskStatus;
  /** ISO 8601 due date, or \`null\` if open-ended. */
  dueDate: string | null;
}

/**
 * Displays a filterable, accessible list of tasks.
 *
 * @example
 * <TaskList
 *   initialTasks={tasks}
 *   onToggleComplete={(id) => markDone(id)}
 * />
 */
export default function TaskList({ initialTasks, onToggleComplete }: TaskListProps) {`,
      },
      {
        type: "callout",
        variant: "info",
        text: "AI-generated docs mirror the actual types — if the interface changes, re-running the prompt instantly updates the documentation.",
      },
    ],
  },

  // ─── 5. DEPLOY ──────────────────────────────────────────────────────────────
  {
    slug: "deploy",
    number: 5,
    name: "Deploy",
    tagline: "From local dev to automated cloud deployment in one prompt.",
    summary:
      "Setting up CI/CD pipelines, Dockerfiles, and deployment workflows is repetitive infrastructure work. AI generates a battle-tested GitHub Actions pipeline that runs linting, type-checking, tests, and deploys to Vercel — the same configuration that would take hours to assemble from scratch.",
    challenge:
      "TaskFlow needs automated CI/CD so every pull request is validated and every merge to main is deployed to production without manual steps.",
    impact: "Production-ready pipeline on the first attempt",
    timeSaved: "~5 hours",
    humanPrompt: `Create a GitHub Actions CI/CD pipeline for our Next.js TaskFlow app that:
- Triggers on every push to main and on every pull request
- Runs ESLint + TypeScript type checking
- Runs Jest tests with coverage reporting
- Builds the production Next.js bundle
- Deploys to Vercel on merge to main
- Caches node_modules to keep runs fast`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: ".github/workflows/ci.yml",
      },
      {
        type: "code",
        language: "yaml",
        code: `name: CI / CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint · Type-check · Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: webapp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: webapp/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npx tsc --noEmit

      - name: Test with coverage
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}

  build:
    name: Production Build
    needs: quality
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: webapp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: webapp/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}

  deploy:
    name: Deploy to Vercel
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token:   \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:  \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
          working-directory: webapp`,
      },
      {
        type: "callout",
        variant: "info",
        text: "The pipeline uses concurrency groups to automatically cancel in-progress runs when a new commit is pushed — a production best-practice AI added without being asked.",
      },
    ],
  },

  // ─── 6. OPERATE ─────────────────────────────────────────────────────────────
  {
    slug: "operate",
    number: 6,
    name: "Operate",
    tagline: "AI diagnoses production incidents faster than any on-call rotation.",
    summary:
      "When TaskFlow goes live, the team starts seeing elevated response times and a rising error rate. Instead of manually sifting through logs, the on-call engineer pastes the symptoms into AI and receives a structured root-cause analysis and remediation plan in seconds.",
    challenge:
      "Production TaskFlow is showing degraded performance: p95 response time has risen to 2.3 seconds, error rate is 0.8%, and CPU is at 85%. The error logs show database timeouts.",
    impact: "Incident resolved in 22 minutes instead of hours",
    timeSaved: "~4 hours",
    humanPrompt: `Our TaskFlow app is in production and showing degraded performance:

Metrics:
  - p95 response time: 2.3 s  (target: <500 ms)
  - Error rate: 0.8%           (target: <0.1%)
  - CPU utilization: 85%       (threshold: 70%)

Sample error from logs:
  PrismaClientKnownRequestError: timeout after 5 000 ms
  at async GET /api/tasks (route.ts:34)
  Query: SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC

Provide:
1. Root-cause analysis
2. Immediate remediation steps
3. A monitoring alert config to catch this earlier next time`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Incident Analysis — TaskFlow Database Timeouts",
      },
      {
        type: "heading",
        level: 3,
        text: "Root-Cause Analysis",
      },
      {
        type: "list",
        items: [
          "Missing index: The query `SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC` performs a full table scan — no index exists on (team_id, created_at).",
          "N+1 query: Each task row triggers a separate SELECT to fetch assignee details, amplifying database load linearly with team size.",
          "No pagination: The API fetches ALL tasks for a team on every request. Teams with 200+ tasks return multi-MB payloads.",
          "Connection pool exhaustion: 85% CPU correlates with Prisma exhausting its default pool of 5 connections; queries queue and timeout.",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Immediate Remediation",
      },
      {
        type: "code",
        language: "sql",
        code: `-- Step 1: Add composite index (run on production with CONCURRENTLY to avoid lock)
CREATE INDEX CONCURRENTLY idx_tasks_team_created
  ON tasks (team_id, created_at DESC);

-- Step 2: Verify the query now uses the index
EXPLAIN ANALYZE
  SELECT * FROM tasks WHERE team_id = 'abc-123' ORDER BY created_at DESC;`,
      },
      {
        type: "code",
        language: "typescript",
        code: `// Step 3: Fix N+1 — include assignee in a single Prisma query
const tasks = await prisma.task.findMany({
  where:   { teamId },
  include: { assignee: { select: { name: true, avatarUrl: true } } },
  orderBy: { createdAt: "desc" },
  take:    50,   // Step 4: Paginate — never fetch unbounded sets
  skip:    page * 50,
});

// Step 5: Increase connection pool (database.ts)
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL + "?connection_limit=20" },
  },
});`,
      },
      {
        type: "heading",
        level: 3,
        text: "Monitoring Alert Config (Datadog)",
      },
      {
        type: "code",
        language: "yaml",
        code: `# datadog-monitors.yml
monitors:
  - name: "TaskFlow — p95 Latency"
    type: metric alert
    query: "p95:trace.next.request{service:taskflow} > 500"
    message: |
      p95 response time exceeded 500 ms.
      Runbook: https://wiki.internal/taskflow/runbooks/latency
    thresholds:
      critical: 1000
      warning:  500
    notify: ["@pagerduty-taskflow-oncall"]

  - name: "TaskFlow — Error Rate"
    type: metric alert
    query: "sum:trace.next.request.errors{service:taskflow}.as_rate() > 0.005"
    message: "Error rate above 0.5% — check Sentry for stack traces."
    notify: ["@slack-taskflow-alerts"]`,
      },
      {
        type: "callout",
        variant: "warning",
        text: "Post-incident action: Add a database query linter (e.g., Prisma's preview queryRawUnsafe warning) to catch missing indexes before they reach production.",
      },
    ],
  },
];

export function getStage(slug: string): Stage | undefined {
  return stages.find((s) => s.slug === slug);
}

export function getAdjacentStages(slug: string): {
  prev: Stage | null;
  next: Stage | null;
} {
  const idx = stages.findIndex((s) => s.slug === slug);
  return {
    prev: idx > 0 ? stages[idx - 1] : null,
    next: idx < stages.length - 1 ? stages[idx + 1] : null,
  };
}
