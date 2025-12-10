 # Setup Guide

This guide will walk you through setting up the Mood Tracker application from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Environment Variables](#environment-variables)
5. [API Keys Configuration](#api-keys-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas) (free tier available)
- **VS Code or Cursor** (optional, for DevContainers)

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js
- Mongoose (MongoDB ODM)
- JWT authentication
- bcryptjs for password hashing
- Axios for HTTP requests
- OpenAI SDK for Hugging Face integration

### 3. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Or on Windows:
```cmd
type nul > .env
```

### 4. Configure Environment Variables

Add the following to your `.env` file (see [Environment Variables](#environment-variables) section for details):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
TMDB_API_KEY=your_tmdb_api_key
WEATHER_API_KEY=your_openweathermap_api_key
HF_TOKEN=your_huggingface_token
```

### 5. Verify Backend Setup

Start the backend server:

```bash
npm run dev
```

You should see:
```
Connected to MongoDB Atlas
Server running on port 5000
```

If you see errors, check:
- MongoDB connection string is correct
- All environment variables are set
- Port 5000 is not already in use

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 19
- Vite
- Material-UI components
- SWR for data fetching
- React Router
- Firebase SDK
- Recharts for visualizations
- And other dependencies

### 3. Create Environment File

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Or on Windows:
```cmd
type nul > .env
```

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 5. Verify Frontend Setup

Start the development server:

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser to see the application.

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No (default: 5000) | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your-super-secret-key-here` |
| `SPOTIFY_CLIENT_ID` | Spotify API client ID | Yes | `abc123...` |
| `SPOTIFY_CLIENT_SECRET` | Spotify API client secret | Yes | `xyz789...` |
| `TMDB_API_KEY` | The Movie Database API key | Yes | `abc123...` |
| `WEATHER_API_KEY` | OpenWeatherMap API key | Yes | `abc123...` |
| `HF_TOKEN` | Hugging Face API token | Yes | `hf_abc123...` |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:5000/api` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes | `1:123:web:abc` |

**Note**: All frontend environment variables must be prefixed with `VITE_` for Vite to expose them to the client.

## API Keys Configuration

### 1. MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Add to backend `.env` as `MONGO_URI`

### 2. Firebase (for Authentication)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → General
4. Scroll to "Your apps" → Add web app
5. Copy the configuration values
6. Add to frontend `.env` with `VITE_` prefix

### 3. Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy Client ID and Client Secret
4. Add redirect URI: `http://localhost:5173` (for development)
5. Add to backend `.env`:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`

### 4. The Movie Database (TMDB)

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings → API
4. Request an API key (free)
5. Copy the API key
6. Add to backend `.env` as `TMDB_API_KEY`

### 5. OpenWeatherMap

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API keys section
4. Generate a new API key
5. Add to backend `.env` as `WEATHER_API_KEY`

### 6. Hugging Face

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account
3. Go to Settings → Access Tokens
4. Create a new token (read access is sufficient)
5. Add to backend `.env` as `HF_TOKEN`

## Running the Application

### Development Mode

#### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Using DevContainers

1. Open project in VS Code/Cursor
2. For frontend: Use `.devcontainer/devcontainer.json`
3. For backend: Use `.devcontainer-backend/devcontainer.json`
4. Select "Reopen in Container"
5. Run `npm run dev` in the container

### Production Build

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for development)
- Ensure database user has proper permissions

**Port Already in Use**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or kill the process using port 5000:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

**JWT Secret Error**
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random string (at least 32 characters)

**Module Not Found**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### Frontend Issues

**API Connection Error**
- Verify backend is running on port 5000
- Check `VITE_API_BASE_URL` in `.env`
- Ensure CORS is enabled in backend (should be by default)

**Firebase Auth Error**
- Verify all Firebase environment variables are set
- Check Firebase project settings
- Ensure Firebase Authentication is enabled in Firebase Console

**Build Errors**
- Clear Vite cache: `rm -rf node_modules/.vite`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Port Already in Use**
- Vite will automatically use the next available port
- Or specify a different port: `npm run dev -- --port 3000`

### Common Issues

**Environment Variables Not Loading**
- Restart the development server after changing `.env`
- For frontend: Ensure variables start with `VITE_`
- Check for typos in variable names

**CORS Errors**
- Backend should have CORS enabled (check `server.js`)
- Verify frontend URL is allowed in CORS configuration

**Authentication Issues**
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify `JWT_SECRET` matches between token creation and verification

## Next Steps

After successful setup:

1. Create a test user account
2. Log your first mood entry
3. Explore the dashboard features
4. Test music and movie recommendations
5. Try the AI reflection feature

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

