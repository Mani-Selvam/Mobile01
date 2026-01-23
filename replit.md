# CRM Mobile App

## Overview
A React Native/Expo CRM (Customer Relationship Management) mobile application that can run on web, iOS, and Android. The app includes features for managing enquiries, follow-ups, and generating reports.

## Project Structure
- `/src` - Frontend React Native code
  - `/components` - Reusable UI components
  - `/contexts` - React Context providers (AuthContext)
  - `/navigation` - App navigation configuration
  - `/screens` - App screens (Home, Enquiry, FollowUp, Report, Auth)
  - `/services` - API service modules
  - `/assets` - Images and other assets
- `/server` - Node.js Express backend API
  - `/config` - Database configuration
  - `/models` - Mongoose data models
  - `/routes` - API route handlers

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Web Support**: Expo Web with Metro bundler
- **Backend**: Node.js with Express
- **Database**: MongoDB (configured externally via MongoDB Atlas)
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **HTTP Client**: Axios

## Running the App
- **Web**: `npm run web` (runs on port 5000)
- **Backend API**: `npm run server` (runs on port 3000)

## API Configuration
The API URL is configured in `src/services/apiConfig.js` and automatically detects the correct URL based on the platform (web vs native).

## Key Features
- User authentication (login/signup)
- Onboarding flow for new users
- Enquiry management
- Follow-up scheduling and tracking
- Dashboard with statistics
- Report generation

## Notes
- The app uses AsyncStorage for local data persistence
- The backend connects to an external MongoDB Atlas instance
- For production, ensure MongoDB credentials are properly secured
