# EduMarket Backend Setup

This project now includes a full Node.js + Express backend with PostgreSQL.

## Prerequisites
- Node.js (v18+)
- PostgreSQL Database

## Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Database Setup**:
    - Create a PostgreSQL database (e.g., `edumarket`).
    - Run the schema script to create tables:
        ```bash
        psql -U postgres -d edumarket -f server/schema.sql
        ```
    - (Optional) Seed the database with mock data:
        ```bash
        node server/seed.js
        ```

3.  **Environment Variables**:
    - Create a `.env` file in the root directory:
        ```env
        PORT=3000
        DB_USER=postgres
        DB_PASSWORD=yourpassword
        DB_HOST=localhost
        DB_PORT=5432
        DB_NAME=edumarket
        JWT_SECRET=supersecretkey
        ```

## Running the Server

```bash
npm start
# OR for development with auto-reload
npm run dev
```

## Frontend Integration

To switch the frontend to use the real backend:

1.  Include `api.js` in `index.html` before `app.js`:
    ```html
    <script src="/js/api.js"></script>
    <script src="/js/app.js"></script>
    ```

2.  Modify `app.js` to use `window.api` instead of `MOCK_DATA`.
    - Replace `state.courses = window.MOCK_DATA.courses` with `state.courses = await api.getCourses()`.
    - Replace `login()` logic with `await api.login(email, password)`.
    - See `backend_design.md` for detailed refactoring steps.
