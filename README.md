# SG Food Reviews

A comprehensive food review platform for restaurants in Singapore.

## Features

- Browse restaurants by category and location
- View top-rated restaurants in different cuisines
- Admin dashboard for managing content
- Real-time statistics
- Restaurant management system

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- Deployment: Render

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/hwhw0780/foodreviewsg.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=your_mongodb_uri_here
```

4. Run the development server:
```bash
npm run dev
```

## Admin Access

- URL: `/admin/login`
- Default credentials:
  - Username: admin
  - Password: admin123

## License

MIT License 