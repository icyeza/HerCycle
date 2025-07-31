
# HerCycle

HerCycle is a full-stack menstrual cycle tracking and prediction app. It provides personalized cycle predictions, learning-based insights, and notifications. The project consists of a Node.js/Express backend and a modern frontend (Vite + React).

---

## Features

- User authentication & profiles
- Cycle prediction with learning algorithms
- Cycle day confirmation & learning updates
- Notifications for important cycle events
- RESTful API
- Modern frontend (see `frontend/`)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [MongoDB](https://www.mongodb.com/) (local or cloud, e.g. MongoDB Atlas)
- [Git](https://git-scm.com/)

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/icyeza/HerCycle.git
cd HerCycle
```

---

### 2. Backend Setup

#### a. Install Dependencies

```sh
cd backend
pnpm install
# or: npm install
```

#### b. Configure Environment Variables

- Copy `.env.example` (if present) to `.env` and fill in the required values.
- At minimum, set:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```
- Example for local MongoDB:
  ```
  MONGO_URI=mongodb://localhost:27017/hercycle
  ```

#### c. Seed the Database (Optional)

If you want demo data, run:

```sh
node seeder.js
```

#### d. Start the Backend Server

```sh
pnpm start
# or: npm start
```

The backend API will run on `http://localhost:5000` (or your configured port).

---

### 3. Frontend Setup

#### a. Install Dependencies

```sh
cd ../frontend
pnpm install
# or: npm install
```

#### b. Configure Environment Variables

- Copy `.env.example` (if present) to `.env` and set the backend API URL:
  ```
  VITE_API_URL=http://localhost:5000/api
  ```

#### c. Start the Frontend Dev Server

```sh
pnpm dev
# or: npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port).

---

## 4. Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Register a new user and start tracking your cycle!

---

## 5. API Reference

See routes for available endpoints.

---

## 6. Deployment

- Backend: Can be deployed to [Vercel](https://vercel.com/) or any Node.js host.
- Frontend: Can be deployed to [Netlify](https://www.netlify.com/) or Vercel.

---

## 7. Project Structure

```
HerCycle/
  backend/    # Express API, models, controllers, services
  frontend/   # Vite + React app
```

---

## 8. Troubleshooting

- Ensure MongoDB is running and accessible.
- Check `.env` files for correct configuration.
- For CORS/API issues, verify frontend `VITE_API_URL` matches backend URL.

---

**Maintained by Lorita Sesame Icyeza(https://github.com/icyeza)**

---
