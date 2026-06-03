# ⚡ TaskFlow: Premium Personal Task Manager Monorepo

TaskFlow is a state-of-the-art, premium-grade Personal Task Manager built with a modular monorepo architecture. It features a stunning glassmorphic UI styled with Tailwind CSS, a high-concurrency transactional `better-sqlite3` database engine, type-safe Zod schema validations, and TanStack React Query hooks with advanced **Optimistic Updates** and automated rollback capabilities.

---

## 🔗 1. Live Demo Links
* **Frontend Web App:** [https://taskflow-client.vercel.app](https://taskflow-client.vercel.app) *(Demo Placeholder)*
* **Backend API Gateway:** [https://taskflow-api.railway.app/health](https://taskflow-api.railway.app/health) *(Demo Placeholder)*

---

## 🛠️ 2. Tech Stack & Architectural Rationale

### Frontend Layer
* **React 18 & Vite:** Lightning-fast HMR (Hot Module Replacement) and optimized bundling speeds using ES modules.
* **TypeScript:** End-to-end type safety, preventing compilation regressions and ensuring seamless synchronization with database models.
* **TanStack React Query (v5):** Smart server-state management. Implements high-performance cache operations, automatic invalidation queries, and **Optimistic Updates** with state snapshot rollbacks to guarantee instantaneous UI responsiveness.
* **React Hook Form & Zod:** Lightweight, high-performance forms with full schema-driven client-side validations.
* **Tailwind CSS & Lucide Icons:** A modern, customizable CSS utility structure configured to render a premium glassmorphic dark/light UI layer.
* **Sonner:** Silky smooth rich-color toast alerts for instant status updates on network queries.

### Backend Layer
* **Node.js & Express:** Lightweight, highly extensible REST API server structure.
* **better-sqlite3:** A fully synchronous, extremely low-overhead SQLite3 driver. Configured with write-ahead logging (WAL) mode to support rapid local transactional query structures.
* **Zod Schemas:** Acts as a gatekeeper middleware for database writes, automatically rejecting ill-formatted request payloads and returning clean structured error codes.
* **CORS Middleware:** Enabled global route accessibility, allowing clean front-end domain interactions.
* **Vitest:** Extremely fast parallelized unit and integration test runner.

---

## 🚀 3. How to Run Locally

Get a fully functional local development environment up and running in under 60 seconds with these exact copy-paste commands:

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your system.

### Step-by-Step Launch
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install Root & Sub-project Dependencies:**
   From the repository root, install dependencies for both `client` and `server`:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   
   # Return to repository root
   cd ..
   ```

3. **Configure Environment Variables:**
   The frontend is pre-configured to point to the server. If you need a custom api url, create a `.env.local` file inside the `client` directory:
   ```bash
   echo "VITE_API_URL=http://localhost:5000" > client/.env.local
   ```

4. **Spin up Server and Client Concurrently:**
   You can run the development servers inside each directory:
   * Run the Express server:
     ```bash
     cd server
     npm run dev
     ```
     *(Runs at [http://localhost:5000](http://localhost:5000))*
   * Run the Vite React client:
     ```bash
     cd client
     npm run dev
     ```
     *(Runs at [http://localhost:5173](http://localhost:5173))*

5. **Run Integration Tests:**
   Validate backend route operations, database writes, and validation failures by running:
   ```bash
   cd server
   npm run test
   ```

---

## 📊 4. API Documentation

All API endpoints reside under `/api/tasks`. They are backed by strict Zod schema validation and return consistent JSON structures.

| Method | Endpoint | Description | Query Parameters | Response Format (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Returns a list of tasks sorted by `created_at` DESC. | `status` (completed/pending), `q` (fuzzy search) | `Task[]` |
| **GET** | `/api/tasks/stats` | Calculates task counts, completion rate, and overdue metrics. | None | `{ total, completed, pending, completionRate, overdue }` |
| **GET** | `/api/tasks/:id` | Fetches a single task by its UUID. | None | `Task` |
| **POST** | `/api/tasks` | Validates body and creates a new task with a generated UUID. | None | `Task` |
| **PATCH** | `/api/tasks/:id` | Validates body and partially updates task fields. | None | `Task` |
| **DELETE** | `/api/tasks/:id` | Deletes a task from the database. | None | `{ message: string, id: string }` |

### Error Payload Format
If a request encounters a validation failure (400), not found (404), or internal error (500), it is processed by the centralized error handler and returned as:
```json
{
  "error": "Validation Error",
  "message": "title: Title is required and must not be empty"
}
```

---

## 📁 5. Project Structure

```text
taskflow/
├── client/                     # React + Vite Frontend App
│   ├── src/
│   │   ├── api/
│   │   │   └── tasks.ts        # Fetch wrappers (GET, POST, PATCH, DELETE)
│   │   ├── components/
│   │   │   ├── ConfirmDialog.tsx # Delete verification dialog modal
│   │   │   ├── EmptyState.tsx  # Dynamic list placeholder illustration
│   │   │   ├── FilterBar.tsx   # All/Active/Completed control segmented pills
│   │   │   ├── SearchBar.tsx   # Debounced 300ms fuzzy text search input
│   │   │   ├── StatsBar.tsx    # Completion progress indicator and metric cards
│   │   │   ├── TaskForm.tsx    # Zod-validated create & edit react-hook-form
│   │   │   ├── TaskItem.tsx    # Completed checkbox, pencil edit, delete triggers
│   │   │   └── TaskList.tsx    # Shimmer loading skeleton list, error handling
│   │   ├── hooks/
│   │   │   └── useTasks.ts     # TanStack Query query/mutation cache wrappers
│   │   ├── lib/
│   │   │   └── utils.ts        # Tailwind merge helper functions
│   │   ├── App.tsx             # Main client page, layout manager, dark theme
│   │   ├── index.css           # Premium glassmorphic base styles
│   │   ├── main.tsx            # App bootstrapping
│   │   └── types.ts            # Core types (Task, DTOs, Stats, Filters)
│   ├── package.json
│   ├── tailwind.config.js      # Custom theme mappings
│   └── tsconfig.json
│
├── server/                     # Express + TypeScript Backend Service
│   ├── src/
│   │   ├── middleware/
│   │   │   └── error.ts        # Centralized app error handling
│   │   ├── routes/
│   │   │   └── tasks.ts        # CRUD route endpoints (GET, POST, PATCH, DELETE)
│   │   ├── schemas/
│   │   │   └── task.ts         # Zod schemas for create & update payloads
│   │   ├── app.ts              # CORS and middleware bindings
│   │   ├── db.ts               # Transaction-based seed, better-sqlite3 startup
│   │   └── index.ts            # Server entrypoint
│   ├── tests/
│   │   └── tasks.test.ts       # Integration tests suite
│   ├── package.json
│   └── tsconfig.json
```

---

## 🔮 6. Next Steps

Here are the planned premium features currently on the roadmap for TaskFlow:

1. **Kanban Board & Drag-and-Drop Reordering:**
   - Integrate `dnd-kit` or HTML5 Drag-and-Drop API to visual board layouts, enabling users to reorder tasks or drag active tasks directly into the completed list to trigger automated updates.
2. **User Authentication Pipelines (JWT & OAuth):**
   - Incorporate secure User Authentication using JWT tokens and OAuth providers (Google, GitHub) to save and segregate individual task boards.
3. **Advanced Theme Customization:**
   - Extend the theme switcher to support an OS-default auto tracker, along with multiple premium curated HSL themes (like Nordic Frost, Cyberpunk neon, or Midnight OLED dark mode).

---

## 🚀 7. Deployment Instructions

This monorepo is fully configured and ready for seamless production deployment.

### 🌐 Backend API (Render.com)
The backend is set up for hosting on **Render.com** as a **Web Service** with a persistent disk volume to ensure SQLite database data is retained across deploys.
1. Create a new **Web Service** on Render and connect your repository.
2. In the configuration:
   - **Environment:** `Node`
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
3. Add a **Persistent Disk Volume**:
   - **Name:** `sqlite-data`
   - **Mount Path:** `/opt/render/project/src/server/data`
   - **Size:** `1 GB` (free plan)
4. Configure **Environment Variables** in the service settings:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave empty, default 10000)

Alternatively, connect your repository and Render will automatically pick up the **[`render.yaml`](./render.yaml)** blueprint file at the repository root!

### 💻 Frontend Client (Vercel)
The React client is pre-configured with **[`vercel.json`](./client/vercel.json)** single-page routing rewrites, optimized for hosting on **Vercel**.
1. Go to Vercel, click **Add New Project**, and import your repository.
2. Configure project settings:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the following **Environment Variable**:
   - `VITE_API_URL`: The URL of your deployed Render backend (e.g. `https://taskflow-api.onrender.com`).
4. Click **Deploy**!

