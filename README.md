# EduMarket

EduMarket is a course marketplace platform connecting students with educational institutions.

## Project Structure

*   **frontend/**: Static Single Page Application (HTML/CSS/JS).
*   **backend/**: Node.js + Express API with PostgreSQL.

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL

### Backend Setup

1.  Navigate to backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment:
    Create a `.env` file in `backend/`:
    ```env
    PORT=3000
    DATABASE_URL=postgres://user:pass@localhost:5432/edumarket
    JWT_SECRET=your_secret
    ```
4.  Run Database Schema:
    ```bash
    psql -d edumarket -f src/schema.sql
    ```
5.  Start Server:
    ```bash
    npm start
    ```

### Frontend Setup

1.  Navigate to frontend:
    ```bash
    cd frontend
    ```
2.  Serve the `public` directory using any static server (e.g., `http-server`, `live-server`, or VS Code Live Server).
    *   Note: Ensure `api.js` points to your local backend URL (default is relative `/api`, so you might need a proxy or update the URL for dev).

## Deployment

*   **Frontend**: Deployed to Netlify.
*   **Backend**: Deployed to Railway.
