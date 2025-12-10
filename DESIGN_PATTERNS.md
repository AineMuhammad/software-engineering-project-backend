# Design Patterns in Mood Tracker Application

This document explains the design patterns implemented in the Mood Tracker application, their purpose, implementation details, and benefits.

## Table of Contents

1. [Model-View-Controller (MVC) Pattern](#model-view-controller-mvc-pattern)
2. [Middleware Pattern](#middleware-pattern)
3. [Provider Pattern](#provider-pattern)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [Factory Pattern](#factory-pattern)
6. [Strategy Pattern](#strategy-pattern)
7. [Observer Pattern](#observer-pattern)
8. [Repository Pattern](#repository-pattern)
9. [Singleton Pattern](#singleton-pattern)
10. [Facade Pattern](#facade-pattern)

---

## Model-View-Controller (MVC) Pattern

### Overview

The backend architecture follows the MVC pattern, separating concerns into three distinct layers: Models (data), Views (responses), and Controllers (business logic).

### Implementation

**Structure:**
```
backend/
├── models/          # Models (Data Layer)
│   ├── User.js
│   ├── Mood.js
│   └── Weather.js
├── controllers/     # Controllers (Business Logic)
│   ├── moodController.js
│   ├── userController.js
│   └── ...
└── routes/          # Routes (View/API Layer)
    ├── mood.js
    ├── user.js
    └── ...
```

### Code Example

**Model (Mood.js):**
```javascript
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['happy', 'calm', 'sad', 'angry', 'neutral'] },
  date: { type: Date, default: Date.now },
  notes: String,
});

module.exports = mongoose.model('Mood', moodSchema);
```

**Controller (moodController.js):**
```javascript
const Mood = require('../models/Mood');

const getTodayMood = async (req, res) => {
  try {
    const userId = req.userId;
    const mood = await Mood.findOne({ userId }).sort({ date: -1 }).limit(1);
    
    res.status(200).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mood',
    });
  }
};
```

**Route (mood.js):**
```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTodayMood } = require('../controllers/moodController');

router.use(authenticate);
router.get('/today', getTodayMood);

module.exports = router;
```

### Benefits

- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Changes to one layer don't affect others
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new features following the same pattern

### Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ↓
┌─────────────┐
│   Routes    │ ← View Layer (API Endpoints)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Controllers │ ← Business Logic Layer
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Models    │ ← Data Layer (Database)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   MongoDB   │
└─────────────┘
```

---

## Middleware Pattern

### Overview

Express middleware functions process requests before they reach route handlers, enabling cross-cutting concerns like authentication, logging, and error handling.

### Implementation

**Authentication Middleware (auth.js):**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    req.userId = decoded.userId;
    next(); // Pass control to next middleware/route handler
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

module.exports = { authenticate };
```

**Middleware Stack (server.js):**
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware 1: CORS
app.use(cors());

// Middleware 2: JSON Parser
app.use(express.json());

// Middleware 3: Routes (with embedded auth middleware)
app.use('/api/mood', require('./routes/mood'));
```

### Request Flow

```
Request
  ↓
CORS Middleware (adds headers)
  ↓
JSON Parser (parses body)
  ↓
Route Handler
  ↓
Auth Middleware (if protected)
  ↓
Controller
  ↓
Response
```

### Benefits

- **Reusability**: Middleware can be applied to multiple routes
- **Composability**: Chain multiple middleware functions
- **Separation of Concerns**: Authentication logic separated from business logic
- **Flexibility**: Easy to add/remove middleware

---

## Provider Pattern

### Overview

The Provider pattern (React Context) provides global state management without prop drilling, allowing components to access shared state.

### Implementation

**Context Provider (MoodContext.jsx):**
```javascript
import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

const MoodContext = createContext();

const initialState = {
  currentUser: null,
  currentMood: null,
  theme: 'light',
  recommendations: [],
  preferences: {},
};

const moodReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_TODAY_MOOD':
      return { ...state, currentMood: action.payload };
    default:
      return state;
  }
};

export const MoodProvider = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);

  const setUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setTodayMood = useCallback((mood) => {
    dispatch({ type: 'SET_TODAY_MOOD', payload: mood });
  }, []);

  const actions = useMemo(() => ({
    setUser,
    setTodayMood,
  }), [setUser, setTodayMood]);

  const value = useMemo(() => ({
    ...state,
    actions,
  }), [state, actions]);

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within MoodProvider');
  }
  return context;
};
```

**Usage in Components:**
```javascript
import { useMood } from '../context/MoodContext';

const Dashboard = () => {
  const { currentUser, currentMood, actions } = useMood();
  
  // Use state and actions
  return <div>Welcome, {currentUser?.name}</div>;
};
```

### Benefits

- **Avoids Prop Drilling**: No need to pass props through multiple levels
- **Centralized State**: Single source of truth for global state
- **Performance**: Memoization prevents unnecessary re-renders
- **Type Safety**: Can be extended with TypeScript for better type checking

### Diagram

```
┌─────────────────┐
│   App.jsx       │
│  MoodProvider   │ ← Provides context
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Header │ │Dashboard│ ← Consume context
└───────┘ └────────┘
```

---

## Custom Hooks Pattern

### Overview

Custom hooks encapsulate reusable logic, following React's hooks pattern for data fetching, state management, and side effects.

### Implementation

**SWR Custom Hook Usage:**
```javascript
import useSWR from 'swr';
import { getTodayMoodFetcher } from '../utils/api';

const Dashboard = () => {
  // Custom hook pattern: useSWR encapsulates data fetching logic
  const { data: moodData, isLoading, error, mutate } = useSWR(
    '/mood/today',           // Key
    getTodayMoodFetcher,     // Fetcher function
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Mood: {moodData?.data?.mood}</div>;
};
```

**SWR Mutation Hook:**
```javascript
import useSWRMutation from 'swr/mutation';
import { getReflectionRecommendationFetcher } from '../utils/api';

const ReflectionModal = ({ mood, weather }) => {
  const { trigger, isMutating } = useSWRMutation(
    '/reflection/recommendation',
    getReflectionRecommendationFetcher
  );

  const handleFetch = async () => {
    const result = await trigger({
      mood: mood || 'neutral',
      weather: weather || null,
    });
  };

  return (
    <button onClick={handleFetch} disabled={isMutating}>
      {isMutating ? 'Loading...' : 'Get Recommendation'}
    </button>
  );
};
```

### Benefits

- **Reusability**: Logic can be shared across components
- **Separation of Concerns**: Data fetching separated from UI
- **Automatic Caching**: SWR handles caching and revalidation
- **Error Handling**: Built-in error states
- **Loading States**: Automatic loading state management

---

## Factory Pattern

### Overview

The Factory pattern creates objects (API fetcher functions) without specifying the exact class/function to create, providing a unified interface for different API calls.

### Implementation

**Base Fetcher Factory (api.js):**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Base fetcher function (factory)
export const fetcher = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// Factory functions for different endpoints
export const getTodayMoodFetcher = async (url) => {
  return fetcher(url);
};

export const addTodayMoodFetcher = async (url, { arg }) => {
  return fetcher(url, {
    method: 'POST',
    body: arg,
  });
};

export const getReflectionRecommendationFetcher = async (url, { arg }) => {
  return fetcher(url, {
    method: 'POST',
    body: arg,
  });
};
```

### Benefits

- **Consistency**: All API calls follow the same pattern
- **DRY Principle**: No code duplication for common logic (auth headers, error handling)
- **Flexibility**: Easy to add new fetcher functions
- **Maintainability**: Changes to API structure only need to be made in one place

### Diagram

```
┌─────────────────┐
│   Components    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Factory Funcs  │ ← Creates fetcher functions
│  (api.js)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Base Fetcher   │ ← Common logic
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   API Server    │
└─────────────────┘
```

---

## Strategy Pattern

### Overview

The Strategy pattern defines a family of algorithms (authentication strategies) and makes them interchangeable, allowing the system to choose the appropriate strategy at runtime.

### Implementation

**Authentication Strategies:**
```javascript
// Strategy 1: JWT Authentication
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
};

// Strategy 2: Firebase Authentication
const authenticateFirebase = async (req, res, next) => {
  const firebaseToken = req.headers.authorization?.substring(7);
  const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
  req.userId = decodedToken.uid;
  next();
};

// Context: Route that uses authentication strategy
router.use('/api/mood', authenticateJWT); // Uses JWT strategy
```

**Mood-to-Recommendation Strategy:**
```javascript
// Different strategies for generating recommendations based on mood
const recommendationStrategies = {
  happy: () => ({
    spotify: 'upbeat, energetic playlists',
    movies: 'comedy, adventure genres',
    activities: 'outdoor activities, social events',
  }),
  sad: () => ({
    spotify: 'calming, soothing playlists',
    movies: 'drama, inspirational genres',
    activities: 'self-care, journaling',
  }),
  calm: () => ({
    spotify: 'ambient, instrumental playlists',
    movies: 'documentary, nature genres',
    activities: 'meditation, reading',
  }),
};

const getRecommendations = (mood) => {
  const strategy = recommendationStrategies[mood] || recommendationStrategies.neutral;
  return strategy();
};
```

### Benefits

- **Flexibility**: Easy to add new authentication methods or recommendation strategies
- **Open/Closed Principle**: Open for extension, closed for modification
- **Testability**: Each strategy can be tested independently
- **Runtime Selection**: Choose strategy based on conditions

---

## Observer Pattern

### Overview

React's state management and SWR's data fetching implement the Observer pattern, where components (observers) subscribe to state changes and automatically re-render when data updates.

### Implementation

**React State (Observer Pattern):**
```javascript
const Dashboard = () => {
  const [mood, setMood] = useState(null);
  
  // Component observes 'mood' state
  // When setMood is called, component re-renders
  useEffect(() => {
    // Side effect when mood changes
    console.log('Mood changed:', mood);
  }, [mood]);
  
  return <div>Current mood: {mood}</div>;
};
```

**SWR Observer Pattern:**
```javascript
const Dashboard = () => {
  // Component subscribes to '/mood/today' data
  // Automatically re-renders when data changes
  const { data, mutate } = useSWR('/mood/today', getTodayMoodFetcher);
  
  // mutate() triggers re-fetch and re-render
  const handleUpdate = () => {
    mutate(); // Notifies all observers
  };
  
  return <div>Mood: {data?.data?.mood}</div>;
};
```

**Context Observer:**
```javascript
// Provider (Subject) notifies observers when state changes
const MoodProvider = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);
  
  // All components using useMood() are observers
  // They automatically re-render when state changes
  return (
    <MoodContext.Provider value={state}>
      {children}
    </MoodContext.Provider>
  );
};
```

### Benefits

- **Automatic Updates**: Components update when data changes
- **Decoupling**: Observers don't need to know about each other
- **Reactivity**: UI stays in sync with data
- **Performance**: React optimizes re-renders

### Diagram

```
┌──────────────┐
│   Subject    │ ← State/Data Source
│  (Provider)  │
└──────┬───────┘
       │
       │ Notifies
       ↓
┌──────────────┐
│  Observers   │ ← Components
│ (Components) │
└──────────────┘
```

---

## Repository Pattern

### Overview

Mongoose models act as repositories, abstracting database operations and providing a clean interface for data access.

### Implementation

**Mood Repository (Mood.js):**
```javascript
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['happy', 'calm', 'sad', 'angry', 'neutral'] },
  date: { type: Date, default: Date.now },
  notes: String,
});

// Repository methods (provided by Mongoose)
// Mood.create() - Create new document
// Mood.findOne() - Find single document
// Mood.find() - Find multiple documents
// Mood.findByIdAndUpdate() - Update document
// Mood.findByIdAndDelete() - Delete document

module.exports = mongoose.model('Mood', moodSchema);
```

**Usage in Controller:**
```javascript
const Mood = require('../models/Mood');

// Repository abstraction - controller doesn't know about MongoDB
const getTodayMood = async (req, res) => {
  const mood = await Mood.findOne({ userId: req.userId })
    .sort({ date: -1 })
    .limit(1);
  // Repository handles database query
};
```

### Benefits

- **Abstraction**: Controllers don't need to know database implementation
- **Testability**: Can mock repository for testing
- **Consistency**: Standardized data access methods
- **Maintainability**: Database changes isolated to models

---

## Singleton Pattern

### Overview

The Singleton pattern ensures a class has only one instance. In this application, database connections and Express app instances are singletons.

### Implementation

**Database Connection (Singleton):**
```javascript
// server.js
const mongoose = require('mongoose');

// Single connection instance shared across the application
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // This connection is reused for all database operations
  });
```

**Express App (Singleton):**
```javascript
// server.js
const express = require('express');
const app = express(); // Single app instance

// All routes use the same app instance
app.use('/api/mood', require('./routes/mood'));
app.use('/api/user', require('./routes/user'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Mongoose Models (Singleton-like):**
```javascript
// Models are loaded once and reused
const Mood = require('../models/Mood'); // Single instance
const User = require('../models/User'); // Single instance
```

### Benefits

- **Resource Efficiency**: Single database connection instead of multiple
- **State Consistency**: Shared state across the application
- **Memory Efficiency**: Avoids creating multiple instances
- **Configuration**: Single point of configuration

---

## Facade Pattern

### Overview

The Facade pattern provides a simplified interface to a complex subsystem. The API utility functions act as a facade, hiding the complexity of HTTP requests, authentication, and error handling.

### Implementation

**API Facade (api.js):**
```javascript
// Facade: Simple interface hiding complexity
export const getTodayMoodFetcher = async (url) => {
  // Hides:
  // - API base URL construction
  // - Token retrieval from localStorage
  // - Authorization header setup
  // - Error handling
  // - Response parsing
  return fetcher(url);
};

// Complex implementation hidden behind facade
const fetcher = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };
  // ... complex logic
};
```

**Component Usage (Simple Interface):**
```javascript
// Components use simple facade, not complex implementation
const { data } = useSWR('/mood/today', getTodayMoodFetcher);
// Doesn't need to know about:
// - Token management
// - Header construction
// - Error handling
// - URL construction
```

### Benefits

- **Simplicity**: Easy-to-use interface for complex operations
- **Abstraction**: Hides implementation details
- **Maintainability**: Changes to implementation don't affect consumers
- **Testability**: Can mock facade for testing

### Diagram

```
┌──────────────┐
│  Components  │
└──────┬───────┘
       │ Simple Interface
       ↓
┌──────────────┐
│   Facade     │ ← api.js
│  (Fetchers)  │
└──────┬───────┘
       │ Complex Implementation
       ↓
┌──────────────┐
│   Subsystem  │
│ (fetch, auth,│
│  error handling)│
└──────────────┘
```

---

## Pattern Interactions

### Combined Pattern Usage

Many patterns work together in the application:

1. **MVC + Repository**: Controllers use Repository pattern for data access
2. **Provider + Observer**: Context Provider uses Observer pattern for state updates
3. **Factory + Facade**: Factory functions provide a Facade for API calls
4. **Middleware + Strategy**: Middleware can use Strategy pattern for different auth methods
5. **Custom Hooks + Observer**: SWR hooks implement Observer pattern for data updates

### Example: Complete Flow

```
User Action (Click "Log Mood")
  ↓
Component (Observer) → Triggers mutation
  ↓
Custom Hook (useSWRMutation) → Uses Factory Pattern
  ↓
Factory Function (addTodayMoodFetcher) → Facade Pattern
  ↓
HTTP Request → Middleware Pattern (Auth)
  ↓
Route Handler → MVC Pattern
  ↓
Controller → Repository Pattern
  ↓
Model (Mongoose) → Singleton Pattern (DB Connection)
  ↓
Response → Observer Pattern (Component Re-renders)
  ↓
Context Provider → Updates Global State
```

---

## Best Practices

1. **Choose Patterns Appropriately**: Not every problem needs a design pattern
2. **Keep It Simple**: Don't over-engineer with unnecessary patterns
3. **Consistency**: Use the same pattern for similar problems
4. **Documentation**: Document why patterns are used
5. **Testing**: Patterns should make testing easier, not harder

---

## Summary

The Mood Tracker application uses multiple design patterns to achieve:

- **Separation of Concerns**: MVC, Middleware, Repository
- **Code Reusability**: Factory, Custom Hooks, Provider
- **Flexibility**: Strategy, Observer
- **Simplicity**: Facade
- **Resource Management**: Singleton

These patterns work together to create a maintainable, scalable, and testable codebase.

---

For more information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SETUP.md](./SETUP.md) - Setup instructions
- [README.md](./README.md) - Project overview

