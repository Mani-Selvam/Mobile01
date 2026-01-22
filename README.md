# MyApp - React Native Auth App

A modern React Native application with authentication screens and a backend API server.

## Project Structure

```
myApp/          # React Native Expo app
├── src/
│   ├── screens/Auth/
│   │   ├── LoginScreen.js
│   │   └── SignupScreen.js
│   └── navigation/AppNavigator.tsx
└── server/         # Node.js Express API server
    ├── src/db/
    │   ├── schema.ts
    │   └── index.ts
    ├── drizzle.config.ts
    └── server.js
```

## Features

-   **Login Screen**: Email/password authentication
-   **Signup Screen**: User registration
-   **Google OAuth**: Social login/signup
-   **Modern UI**: Clean, premium design with animations
-   **Backend API**: RESTful authentication endpoints
-   **PostgreSQL**: Database with Neon hosting

## Setup

### React Native App

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure Google OAuth:

    - Go to Google Cloud Console
    - Create OAuth 2.0 credentials for mobile
    - Update `YOUR_GOOGLE_CLIENT_ID` in LoginScreen.js and SignupScreen.js

3. Start the app:
    ```bash
    npm start
    ```

### Backend Server

1. Set up Neon PostgreSQL:

    - Sign up at https://neon.tech
    - Create a new project
    - Copy the connection string to `server/.env`

2. Configure environment:

    - Update `server/.env` with DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID

3. Push database schema:
    ```bash
    cd server
    npm run db:push
    npm run dev
    ```

## Database Commands

-   `npm run db:push` - Push schema to database
-   `npm run db:migrate` - Run migrations
-   `npm run db:generate` - Generate migration files
-   `npm run db:studio` - Open Drizzle Studio

## API Endpoints

-   `POST /api/auth/register` - User registration
-   `POST /api/auth/login` - Email/password login
-   `POST /api/auth/google` - Google OAuth authentication
-   `GET /api/auth/me` - Get user profile (protected)

## Technologies Used

### Frontend

-   React Native
-   Expo
-   React Navigation
-   Expo Auth Session (Google OAuth)
-   Axios (HTTP client)
-   React Native Reanimated (animations)

### Backend

-   Node.js
-   Express.js
-   PostgreSQL (Neon)
-   Drizzle ORM
-   JWT (authentication)
-   bcryptjs (password hashing)
-   Google Auth Library

## Notes

-   Update the server URL in the app if deploying to production
-   For production, use environment variables for API URLs
-   Consider using AsyncStorage or SecureStore for token persistence
-   Add proper error handling and loading states as needed
