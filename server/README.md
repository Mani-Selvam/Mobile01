# Auth Server

A Node.js Express server for authentication with PostgreSQL (Neon) and Google OAuth using Drizzle ORM.

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Set up Neon PostgreSQL:

    - Sign up at https://neon.tech
    - Create a new project
    - Copy the connection string and update `.env`

3. Configure environment variables:

    - Update `.env` with your database URL, JWT secret, and Google Client ID

4. Push database schema:

    ```bash
    npm run db:push
    ```

5. Generate migrations (optional):

    ```bash
    npm run db:generate
    ```

6. Start the server:
    ```bash
    npm run dev  # For development with nodemon
    npm start    # For production
    ```

## Database Commands

-   `npm run db:push` - Push schema to database
-   `npm run db:migrate` - Run migrations
-   `npm run db:generate` - Generate migration files
-   `npm run db:studio` - Open Drizzle Studio

## API Endpoints

### Authentication

-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Login with email/password
-   `POST /api/auth/google` - Login/Signup with Google OAuth
-   `GET /api/auth/me` - Get current user info (protected)

## Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URIs (for mobile app)
6. Copy the Client ID to `.env`

## Technologies Used

-   Node.js
-   Express.js
-   PostgreSQL (Neon)
-   Drizzle ORM
-   JWT (authentication)
-   bcryptjs (password hashing)
-   Google Auth Library
