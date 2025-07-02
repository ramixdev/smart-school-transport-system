# Smart School Transport System

A full-stack mobile and web platform for safe, efficient, and transparent school transportation management. This system enables real-time bus tracking, automated attendance, and seamless communication between parents, drivers, and school administrators.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

- **Real-time Bus Tracking:** Parents and admins can monitor live bus locations.
- **Automated Attendance:** Digital attendance for students, with absence notifications.
- **Role-based Access:** Separate interfaces and permissions for parents, drivers, and admins.
- **Journey & Route Management:** Optimized routes, journey history, and analytics.
- **Push Notifications:** Instant alerts for arrivals, delays, and emergencies.
- **Secure Authentication:** Firebase-based login and data protection.
- **Parent-Driver Communication:** In-app messaging and feedback/rating system.

---

## Technologies Used

**Frontend:**
- React Native (Expo)
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Maps
- React Native Paper
- Formik & Yup

**Backend:**
- Node.js
- Express.js
- Firebase (Authentication, Firestore, Storage, Realtime Database)
- Firebase Admin SDK
- Google Maps API
- Multer (file uploads)
- Nodemailer (email notifications)

**DevOps & Testing:**
- Jest (UI snapshot testing)
- Expo CLI
- Git

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project (with Firestore, Realtime Database, and Authentication enabled)
- Google Maps API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-school-transport.git
   cd smart-school-transport
   ```

2. **Install dependencies:**
   - For the frontend:
     ```bash
     cd SmartSchoolTransport
     npm install
     ```
   - For the backend:
     ```bash
     cd ../backend
     npm install
     ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the backend folder and fill in your Firebase and Google Maps credentials.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Start the frontend app:**
   ```bash
   cd ../SmartSchoolTransport
   npx expo start
   ```

---

## Project Structure

```
SmartSchoolTransport/      # React Native frontend (Expo)
backend/                   # Node.js/Express backend API
```

- **Frontend:** Contains all mobile app screens, components, and assets.
- **Backend:** Contains API routes, controllers, models, and Firebase integration.

---

## API Overview

The backend exposes RESTful endpoints for:

- **Authentication:** Register, login, profile management
- **Parent:** Manage children, request drivers, view journeys, rate drivers
- **Driver:** Manage profile, vehicles, journeys, student lists
- **Admin:** Manage users, schools, drivers, students, and view analytics
- **Journey & Location:** Real-time updates, route optimization, attendance

See the `/backend/README.md` for detailed API documentation.

---

## Testing

- **Frontend:**  
  Snapshot tests for UI components using Jest and react-test-renderer.
  ```bash
  cd SmartSchoolTransport
  npm test
  ```

- **Backend:**  
  (Add backend test instructions here if implemented.)

---


## License

This project is licensed under the MIT License.



**Contributions, issues, and feature requests are welcome!**
