# Smart School Transport - Backend API

This is the backend server for the Smart School Transport application. It provides APIs for parents, drivers, and admins to manage school transportation services.

## Technologies Used

- Node.js and Express
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. Clone the repository
2. Navigate to the backend folder
```bash
cd backend
```

3. Install dependencies
```bash
npm install
```

4. Create a `.env` file in the backend folder with the following variables:
```
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_DATABASE_URL=your-database-url
```

5. Start the server
```bash
npm run dev
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user (parent, driver)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password
- `DELETE /api/auth/delete-account` - Delete user account

### Parent Routes

- `GET /api/parent/profile` - Get parent profile with children
- `POST /api/parent/child` - Add a new child
- `PUT /api/parent/child/:childId` - Update child details
- `POST /api/parent/child/:childId/image` - Upload child profile image
- `DELETE /api/parent/child/:childId` - Delete a child
- `POST /api/parent/child/:childId/attendance` - Mark child as absent
- `POST /api/parent/enrollment` - Request driver enrollment
- `GET /api/parent/enrollments` - Get enrollment requests

### Driver Routes

- `GET /api/driver/profile` - Get driver profile
- `POST /api/driver/profile` - Create driver profile
- `PUT /api/driver/profile` - Update driver profile
- `POST /api/driver/profile/image` - Upload driver profile image
- `POST /api/driver/vehicle` - Update vehicle details
- `POST /api/driver/vehicle/images` - Upload vehicle images
- `POST /api/driver/school` - Add school to driver
- `DELETE /api/driver/school/:schoolId` - Remove school from driver
- `GET /api/driver/enrollments` - Get pending enrollments
- `PUT /api/driver/enrollment/:enrollmentId` - Respond to enrollment request
- `GET /api/driver/children` - Get enrolled children
- `DELETE /api/driver/child/:childId` - Remove child from driver
- `POST /api/driver/journey` - Create journey
- `GET /api/driver/journeys` - Get journeys by date
- `POST /api/driver/journey/:journeyId/start` - Start journey
- `POST /api/driver/journey/:journeyId/end` - End journey
- `PUT /api/driver/journey/:journeyId/location` - Update journey location
- `POST /api/driver/journey/:journeyId/stop` - Add stop to journey

### Admin Routes

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userType` - Get users by type
- `DELETE /api/admin/user/:userId` - Delete user
- `GET /api/admin/drivers` - Get all drivers with details
- `DELETE /api/admin/driver/:driverId` - Delete driver
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/school/:schoolId` - Get students by school
- `DELETE /api/admin/student/:childId` - Delete student
- `GET /api/admin/schools` - Get all schools
- `POST /api/admin/school` - Add school
- `PUT /api/admin/school/:schoolId` - Update school
- `DELETE /api/admin/school/:schoolId` - Delete school

### School Routes (Available to all authenticated users)

- `GET /api/schools` - Get all schools
- `GET /api/schools/:schoolId` - Get school by ID
- `GET /api/schools/:schoolId/drivers` - Get drivers by school

## Project Structure

- `server.js` - Entry point for the application
- `config/` - Configuration files
- `controllers/` - API controllers
- `middleware/` - Custom middleware functions
- `models/` - Data models
- `routes/` - API routes
- `utils/` - Utility functions

## Authentication

The API uses Firebase Authentication. All protected routes require an Authorization header with a valid Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

## Error Handling

All API responses follow a standard format:

Success:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error:
```json
{
  "message": "Error message",
  "error": "Detailed error message"
}
```

## License

[MIT](LICENSE) 