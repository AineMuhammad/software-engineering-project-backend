# Mood Tracker - Wellness Application

A comprehensive mood tracking and wellness application that helps users monitor their emotional well-being, get personalized recommendations, and track their mood patterns over time.

## Features

- **Mood Logging**: Track your mood throughout the day with support for multiple entries per hour
- **Weather Integration**: View current weather conditions that may affect your mood
- **Music Recommendations**: Get personalized Spotify playlists based on your current mood
- **Movie Suggestions**: Discover movies curated for your emotional state
- **AI-Powered Reflections**: Receive personalized well-being recommendations using Hugging Face AI
- **Mood Analytics**: Visualize your mood trends with interactive charts
- **User Authentication**: Secure sign-up and sign-in with JWT tokens and Firebase integration
- **Modern UI**: Beautiful, Apple-inspired design with smooth animations and glassmorphism effects

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **SWR** - Data fetching and caching
- **React Router** - Navigation
- **Firebase Auth** - Google authentication
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Axios** - HTTP client
- **OpenAI SDK** - Hugging Face AI integration

### External APIs
- **Spotify API** - Music recommendations
- **The Movie Database (TMDB)** - Movie suggestions
- **OpenWeatherMap** - Weather data
- **Hugging Face Router** - AI-powered reflection recommendations

## Project Structure

```
final-project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── MoodLogModal.jsx
│   │   │   ├── ReflectionModal.jsx
│   │   │   ├── SpotifyModal.jsx
│   │   │   └── MovieModal.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   ├── context/         # React context providers
│   │   │   └── MoodContext.jsx
│   │   ├── utils/           # Utility functions
│   │   │   └── api.js       # API client functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express backend API
│   ├── controllers/         # Route controllers
│   │   ├── moodController.js
│   │   ├── userController.js
│   │   ├── weatherController.js
│   │   ├── spotifyController.js
│   │   ├── movieController.js
│   │   └── reflectionController.js
│   ├── routes/              # API routes
│   │   ├── mood.js
│   │   ├── user.js
│   │   ├── weather.js
│   │   ├── spotify.js
│   │   ├── movie.js
│   │   └── reflection.js
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Mood.js
│   │   └── Weather.js
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication
│   ├── server.js            # Express app entry point
│   └── package.json
│
├── .devcontainer/           # Frontend devcontainer config
├── .devcontainer-backend/   # Backend devcontainer config
└── README.md                # This file
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Firebase** project (for authentication)
- API keys for:
  - Spotify API
  - The Movie Database (TMDB)
  - OpenWeatherMap
  - Hugging Face (HF_TOKEN)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd final-project
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Create .env file (see SETUP.md)
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env  # Create .env file (see SETUP.md)
   ```

4. **Configure environment variables** (see [SETUP.md](./SETUP.md) for details)

5. **Run the application**
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and configuration guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)** - Design patterns explanation and implementation

## Environment Variables

### Backend (.env)
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

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Development Containers

The project includes DevContainer configurations for both frontend and backend:

- **Frontend**: `.devcontainer/devcontainer.json`
- **Backend**: `.devcontainer-backend/devcontainer.json`

To use:
1. Open the project in VS Code/Cursor
2. Select "Reopen in Container" when prompted
3. Wait for dependencies to install
4. Start development servers

## 📡 API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/signin` - Login user

### User (Protected)
- `GET /api/user/me` - Get current user info

### Mood (Protected)
- `GET /api/mood/today` - Get today's mood
- `POST /api/mood/today` - Log a new mood
- `GET /api/mood/range` - Get moods for date range

### Weather (Protected)
- `GET /api/weather/current` - Get current weather

### Spotify (Protected)
- `GET /api/spotify/playlists` - Get mood-based playlists

### Movies (Protected)
- `GET /api/movie/recommendations` - Get mood-based movie recommendations

### Reflection (Protected)
- `POST /api/reflection/recommendation` - Get AI-powered reflection recommendation

## UI Features

- **Typewriter Animation**: Greeting text animates on dashboard load
- **Glassmorphism**: Modern glass-like UI effects
- **Smooth Animations**: CSS keyframe animations for interactions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme Support**: Material-UI theme system
- **Interactive Charts**: Mood trends visualization with Recharts

## Testing

The frontend includes end-to-end tests using Playwright for both local development and production deployment:

### Local Development Tests
```bash
cd frontend
npm run test:e2e          # Run all tests against local dev server
npm run test:e2e:ui      # Run tests in interactive UI mode
npm run test:e2e:headed  # Run tests with visible browser
npm run test:e2e:debug   # Run tests in debug mode
```

### Production Deployment Tests
```bash
cd frontend
npm run test:e2e:prod          # Test deployed app at https://personal-mood-tracker-800c5.web.app
npm run test:e2e:prod:ui       # Production tests in UI mode
npm run test:e2e:prod:headed  # Production tests with visible browser
```

### View Test Reports
```bash
npm run test:e2e:report  # View HTML test report
```

See [frontend/tests/README.md](./frontend/tests/README.md) for detailed testing documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Authors

- **Ain e Muhammad** - Initial work

## Acknowledgments

- Material-UI for the component library
- Spotify, TMDB, and OpenWeatherMap for their APIs
- Hugging Face for AI model access
- Firebase for authentication services

---

For more detailed information, please refer to:
- [SETUP.md](./SETUP.md) - Setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) - Design patterns explanation

