# Shree Ram Furniture 🪑

A full-stack furniture business website built with **React**, **Node.js**, **Express**, and **MongoDB**.

## Features

### 🌐 Public Website
- Beautiful hero slider with animated content
- Product catalog with category filtering & search
- Product cards with ratings, discounts, and hover effects
- About Us section with company story
- Contact form with Google Maps
- Testimonials section
- Fully responsive design

### 🔐 Admin Panel (`/admin`)
- Secure JWT authentication
- Dashboard with product/category stats
- **Products**: Add, Edit, Delete with image upload
- **Categories**: Create & Delete categories
- **Hero Slides**: Upload & manage banner slides
- Drag-and-drop image upload
- Real-time image preview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Images | Multer (local storage) |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/PipaliyaMihir/shreeramfurniture.git
cd shreeramfurniture
```

2. **Setup server .env** — create `server/.env`:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
ADMIN_EMAIL=admin@shreeramfurniture.com
ADMIN_PASSWORD=Admin@123
```

3. **Install server dependencies**
```bash
cd server
npm install
```

4. **Seed the database**
```bash
npm run seed
```

5. **Install client dependencies**
```bash
cd ../client
npm install
```

6. **Run both server & client**
```bash
# From root directory
cd ..
npx concurrently "cd server && node index.js" "cd client && npm run dev"
```

Or run separately:
```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend  
cd client && npm run dev
```

### Access

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public Website |
| http://localhost:3000/admin | Admin Panel |
| http://localhost:3000/admin/login | Admin Login |
| http://localhost:5000/api | API Base URL |

### Admin Credentials
```
Email: admin@shreeramfurniture.com
Password: Admin@123
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/products | Get all products |
| POST | /api/products | Create product (auth) |
| PUT | /api/products/:id | Update product (auth) |
| DELETE | /api/products/:id | Delete product (auth) |
| GET | /api/categories | Get categories |
| POST | /api/categories | Create category (auth) |
| DELETE | /api/categories/:id | Delete category (auth) |
| GET | /api/hero | Get active hero slides |
| POST | /api/hero | Create hero slide (auth) |
| DELETE | /api/hero/:id | Delete hero slide (auth) |
| POST | /api/upload | Upload images (auth) |

## License

MIT © 2024 Shree Ram Furniture
