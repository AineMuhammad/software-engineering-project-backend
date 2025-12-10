# Architecture Documentation

This document describes the system architecture, design decisions, and technical implementation details of the Mood Tracker application.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [API Design](#api-design)
8. [External Integrations](#external-integrations)
9. [State Management](#state-management)
10. [Security Considerations](#security-considerations)

## System Overview

The Mood Tracker is a full-stack web application built with a modern, decoupled architecture:

- **Frontend**: React SPA (Single Page Application) with Vite
- **Backend**: RESTful API built with Express.js
- **Database**: MongoDB (NoSQL document database)
- **Authentication**: JWT tokens + Firebase Auth
- **Deployment**: Development containers for isolated environments

### Technology Choices

**Frontend:**
- **React 19**: Latest React with improved performance and features
- **Vite**: Fast build tool and dev server (replaces Create React App)
- **Material-UI**: Comprehensive component library with theming
- **SWR**: Data fetching with caching, revalidation, and error handling
- **React Router**: Client-side routing

**Backend:**
- **Node.js + Express**: Lightweight, fast server framework
- **Mongoose**: MongoDB ODM for schema validation and queries
- **JWT**: Stateless authentication
- **bcryptjs**: Password hashing

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Frontend (Vite)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Dashboard│  │ Sign In  │  │ Sign Up  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌─────────────────────────────────────────┐         │  │
│  │  │     Components (Modals, Charts, etc)    │         │  │
│  │  └─────────────────────────────────────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
                        │ (JWT Authentication)
┌───────────────────────┴─────────────────────────────────────┐
│              Express.js Backend (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Middleware                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │   CORS   │  │   Auth   │  │  Parser  │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Controllers                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │   Mood   │  │  User    │  │ Weather  │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │ Spotify  │  │  Movie   │  │Reflection│          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Models (Mongoose)                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │   User   │  │   Mood   │  │ Weather │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬───────────────┐
        │               │               │               │
┌───────┴────┐  ┌───────┴────┐  ┌───────┴────┐  ┌───────┴────┐
│  MongoDB   │  │  Spotify   │  │    TMDB    │  │  OpenWeather│
│   Atlas    │  │    API     │  │    API     │  │     API    │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
                        │
                ┌───────┴────┐
                │  Hugging    │
                │  Face AI    │
                └────────────┘
```

## Frontend Architecture

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx       # Navigation header
│   ├── MoodLogModal.jsx # Mood logging interface
│   ├── ReflectionModal.jsx # AI reflection modal
│   ├── SpotifyModal.jsx # Music recommendations
│   └── MovieModal.jsx   # Movie recommendations
├── pages/               # Page-level components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── SignIn.jsx       # Login page
│   └── SignUp.jsx       # Registration page
├── context/             # React Context providers
│   └── MoodContext.jsx  # Global mood state
├── utils/               # Utility functions
│   └── api.js          # API client and SWR fetchers
└── App.jsx             # Root component with routing
```

### State Management

**Local State:**
- Component-level state using `useState` hook
- Form state, modal open/close, UI interactions

**Server State:**
- **SWR** for data fetching and caching
- Automatic revalidation and error handling
- Optimistic updates for better UX

**Global State:**
- **React Context** for mood data that needs to be shared
- Minimal global state to avoid prop drilling

### Data Fetching Pattern

```javascript
// Using SWR for data fetching
const { data, error, isLoading } = useSWR('/mood/today', getTodayMoodFetcher);

// Using SWR Mutation for mutations
const { trigger, isMutating } = useSWRMutation('/mood/today', addTodayMoodFetcher);
```

**Benefits:**
- Automatic caching and revalidation
- Request deduplication
- Error retry logic
- Loading states handled automatically

### Routing

```javascript
// React Router setup
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />
</Routes>
```

Protected routes are handled at the component level by checking for authentication tokens.

## Backend Architecture

### MVC Pattern

The backend follows a Model-View-Controller (MVC) pattern:

- **Models**: Mongoose schemas defining data structure
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, CORS, parsing

### Request Flow

```
Client Request
    ↓
Express App (server.js)
    ↓
CORS Middleware
    ↓
JSON Parser
    ↓
Route Handler (routes/*.js)
    ↓
Auth Middleware (if protected)
    ↓
Controller (controllers/*.js)
    ↓
Model (models/*.js)
    ↓
MongoDB Database
    ↓
Response to Client
```

### Middleware Stack

1. **CORS**: Enables cross-origin requests from frontend
2. **express.json()**: Parses JSON request bodies
3. **Authentication**: JWT token verification (for protected routes)
4. **Error Handling**: Centralized error responses

### Controller Pattern

Each controller handles:
- Request validation
- Business logic
- Database operations
- External API calls
- Response formatting

Example:
```javascript
const getTodayMood = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const mood = await Mood.findOne({ userId, ... });
    res.json({ success: true, data: mood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  firebaseUid: String (optional, for Google auth),
  createdAt: Date
}
```

**Indexes:**
- `email`: Unique index for fast lookups

### Mood Model

```javascript
{
  userId: ObjectId (ref: User, required, indexed),
  mood: String (enum: ['happy', 'calm', 'sad', 'angry', 'neutral']),
  date: Date (required, default: now),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ userId: 1, date: -1 }` for efficient queries

**Features:**
- Supports multiple mood entries per hour
- Timestamps for tracking creation and updates
- Notes field for additional context

### Weather Model

```javascript
{
  userId: ObjectId (ref: User, required),
  location: String,
  temperature: Number,
  description: String,
  date: Date (default: now),
  createdAt: Date
}
```

## Authentication Flow

### Registration Flow

```
1. User submits signup form
   ↓
2. Frontend sends POST /api/signup
   ↓
3. Backend validates input
   ↓
4. Backend hashes password (bcrypt)
   ↓
5. Backend creates user in MongoDB
   ↓
6. Backend generates JWT token
   ↓
7. Backend returns token to frontend
   ↓
8. Frontend stores token in localStorage
   ↓
9. Frontend redirects to Dashboard
```

### Login Flow

```
1. User submits signin form
   ↓
2. Frontend sends POST /api/signin
   ↓
3. Backend finds user by email
   ↓
4. Backend compares password (bcrypt)
   ↓
5. Backend generates JWT token
   ↓
6. Backend returns token to frontend
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend redirects to Dashboard
```

### Protected Route Flow

```
1. Frontend makes API request
   ↓
2. Frontend includes token in Authorization header
   ↓
3. Backend auth middleware extracts token
   ↓
4. Backend verifies JWT signature
   ↓
5. Backend checks token expiration
   ↓
6. Backend fetches user from database
   ↓
7. Backend attaches user to request (req.user, req.userId)
   ↓
8. Controller processes request with user context
```

### Firebase Google Auth Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Firebase Auth handles OAuth flow
   ↓
3. Frontend receives Firebase ID token
   ↓
4. Frontend sends token to backend
   ↓
5. Backend verifies Firebase token
   ↓
6. Backend creates/finds user by firebaseUid
   ↓
7. Backend generates JWT token
   ↓
8. Backend returns JWT to frontend
   ↓
9. Frontend stores JWT in localStorage
```

## API Design

### RESTful Principles

- **GET**: Retrieve resources
- **POST**: Create resources or trigger actions
- **PUT/PATCH**: Update resources (not currently used)
- **DELETE**: Remove resources (not currently used)

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Status Codes

- `200`: Success
- `201`: Created (not currently used)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `500`: Internal Server Error

### API Endpoints

See [README.md](./README.md) for complete endpoint list.

## External Integrations

### Spotify API

**Purpose**: Get mood-based music playlists

**Flow:**
1. Backend receives mood from frontend
2. Backend maps mood to Spotify search queries
3. Backend makes authenticated request to Spotify API
4. Backend formats and returns playlist data

**Authentication**: Client Credentials flow (server-to-server)

### The Movie Database (TMDB)

**Purpose**: Get mood-based movie recommendations

**Flow:**
1. Backend receives mood from frontend
2. Backend maps mood to genre/keyword filters
3. Backend queries TMDB API
4. Backend formats movie data (title, poster, rating, etc.)

### OpenWeatherMap

**Purpose**: Get current weather for user's location

**Flow:**
1. Frontend gets user location (browser geolocation)
2. Frontend sends location to backend
3. Backend queries OpenWeatherMap API
4. Backend stores weather data in database
5. Backend returns weather to frontend

### Hugging Face AI

**Purpose**: Generate personalized reflection recommendations

**Flow:**
1. Frontend sends mood and weather context
2. Backend formats prompt for AI model
3. Backend calls Hugging Face Router API (OpenAI-compatible)
4. Backend processes AI response
5. Backend returns recommendation (or fallback if API fails)

**Model**: `deepseek-ai/DeepSeek-V3.2:novita` via Hugging Face Router

**Fallback**: Curated recommendations based on mood and weather

## Security Considerations

### Password Security

- Passwords are hashed using bcrypt (salt rounds: 10)
- Passwords are never returned in API responses
- Minimum password length: 6 characters

### JWT Security

- Tokens expire (configured in token generation)
- Tokens are signed with secret key (stored in environment)
- Tokens are verified on every protected request
- Tokens stored in localStorage (consider httpOnly cookies for production)

### API Security

- CORS configured to allow only frontend origin
- Input validation on all user inputs
- SQL injection not applicable (NoSQL)
- XSS protection via React's built-in escaping

### Environment Variables

- Sensitive keys stored in `.env` files
- `.env` files excluded from version control
- Different keys for development/production

### MongoDB Security

- Connection string includes authentication
- Database user has minimal required permissions
- IP whitelist configured in MongoDB Atlas

## Performance Optimizations

### Frontend

- **Code Splitting**: Vite automatically splits code
- **Lazy Loading**: Components loaded on demand
- **SWR Caching**: Reduces redundant API calls
- **Image Optimization**: Poster images from CDN
- **CSS Animations**: Hardware-accelerated animations

### Backend

- **Database Indexing**: Indexes on frequently queried fields
- **Connection Pooling**: Mongoose manages connections
- **Error Handling**: Prevents crashes and provides graceful errors
- **Response Caching**: Consider adding Redis for production

## Future Improvements

1. **Real-time Updates**: WebSocket support for live mood tracking
2. **Offline Support**: Service workers for PWA capabilities
3. **Advanced Analytics**: More detailed mood trend analysis
4. **Social Features**: Share mood with friends/family
5. **Mobile App**: React Native version
6. **Machine Learning**: Predictive mood analysis
7. **Export Data**: CSV/PDF export of mood history
8. **Reminders**: Push notifications for mood logging

## Deployment Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB connection pooling
- [ ] Add rate limiting
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure environment-specific API keys
- [ ] Enable compression middleware
- [ ] Set up CI/CD pipeline
- [ ] Add health check endpoints
- [ ] Configure backup strategy for MongoDB

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, AWS EC2, or DigitalOcean
- **Database**: MongoDB Atlas (already in use)

---

For setup instructions, see [SETUP.md](./SETUP.md).

