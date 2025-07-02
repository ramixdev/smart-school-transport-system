# School Transport Backend

This is the backend service for the School Transport application, handling real-time location tracking, route optimization, and notifications.

## Prerequisites

- Node.js (v14 or higher)
- Firebase project with Firestore and Realtime Database
- Google Maps API key
- Firebase Cloud Messaging (FCM) setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Cache Configuration
CACHE_TTL=300000
MAX_CACHE_SIZE=1000

# Notification Configuration
FCM_SERVER_KEY=your_fcm_server_key
NOTIFICATION_BATCH_SIZE=500
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a new Firebase project
   - Enable Firestore and Realtime Database
   - Download service account key and save as `config/serviceAccountKey.json`
   - Enable Firebase Cloud Messaging

3. Set up Google Maps API:
   - Create a new project in Google Cloud Console
   - Enable Maps JavaScript API, Directions API, and Distance Matrix API
   - Create API key with appropriate restrictions

4. Start the server:
```bash
npm start
```

## Features

### Location Tracking
- Real-time location updates using Firebase Realtime Database
- Location history with automatic cleanup
- Geofencing support for stops and schools

### Route Optimization
- Multiple optimization algorithms:
  - Nearest Neighbor
  - Genetic Algorithm
  - Simulated Annealing
- Google Maps API integration with fallback
- Route caching for performance
- Traffic consideration

### Notifications
- Firebase Cloud Messaging (FCM) integration
- Token management and refresh
- Batch notifications
- Support for different notification types:
  - Journey updates
  - Absence notifications
  - System notifications

### Journey Management
- Journey creation and tracking
- Status updates
- Route optimization
- Stop management
- ETA calculation

## API Endpoints

### Location
- `POST /api/location/update` - Update driver location
- `GET /api/location/:driverId` - Get driver's current location
- `GET /api/location/:driverId/history` - Get location history

### Journey
- `POST /api/journey` - Create new journey
- `GET /api/journey/:id` - Get journey details
- `PUT /api/journey/:id/status` - Update journey status
- `POST /api/journey/:id/optimize` - Optimize journey route

### Notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Error Handling

The application uses a centralized error handling system with custom error codes:

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_API_ERROR` - External API call failed

## Logging

Logs are written to both console and file with different levels:
- `error` - Application errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Debug information

## Security

- JWT authentication
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers

## Performance

- Route caching
- Batch notifications
- Location history cleanup
- Optimized database queries

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 