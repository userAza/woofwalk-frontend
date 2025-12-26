# WoofWalk Frontend

Frontend application for the WoofWalk dog walking platform.

## Technologies Used

- **Vue 3** - JavaScript framework
- **Vue Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive maps for vet finder

## Prerequisites

- Node.js installed
- Backend API running on http://localhost:3000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Application will run on http://localhost:5173

3. Build for production:
```bash
npm run build
```

## Project Structure
```
src/
├── pages/           # Vue page components
│   ├── home.vue
│   ├── login.vue
│   ├── register.vue
│   ├── profile.vue
│   ├── browseWalkers.vue
│   ├── walkerProfile.vue
│   ├── myBookings.vue
│   ├── vetFinder.vue
│   ├── accountSettings.vue
│   ├── forgotPassword.vue
│   └── resetPassword.vue
├── router/          # Vue Router configuration
├── services/        # API service layer
├── App.vue          # Root component
└── main.js          # Application entry point
```

## Features

### User Features
- User registration and login
- Password reset via email
- Profile management
- Add/remove dogs
- Search and browse dog walkers
- Filter walkers by location, date, time
- View walker profiles with reviews and ratings
- Book walks with multiple dogs
- Select optional add-ons (bathing, feeding, etc.)
- View booking history
- Cancel bookings
- Leave reviews after completed walks
- Automatic 20% discount after 10 completed walks
- Find veterinary clinics on interactive map
- Change password

### Admin Features
- Admin login
- View all users and walkers
- Ban/unban users and walkers
- User management dashboard

## Main Pages

- **Home** (`/`) - Landing page with app description
- **Login** (`/login`) - User login
- **Register** (`/register`) - Create new account
- **Profile** (`/profile`) - User profile and dog management
- **Browse Walkers** (`/walkers`) - Search for dog walkers
- **Walker Profile** (`/walkers/:id`) - View walker details and book
- **My Bookings** (`/bookings`) - View and manage bookings
- **Find a Vet** (`/vets`) - Interactive map of veterinary clinics
- **Account Settings** (`/account-settings`) - Change password
- **Admin** (`/admin`) - Admin dashboard

## Authentication

The app uses JWT tokens stored in localStorage for authentication. Protected routes require a valid token.

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`

All API calls are handled through the `services/api.js` module which includes:
- Automatic token attachment to requests
- Error handling
- JSON parsing

## Styling

The app uses a custom pink and white color scheme with:
- Pink accent color: `#d946a6`
- Responsive design
- Card-based layout
- Clean, modern UI