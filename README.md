# Premium Gym Management System

A comprehensive multi-tenant SaaS platform for gym management.

## Project Structure

```
GYM Project/
├── docs/                    # Technical documentation
├── admin-dashboard/         # React + TypeScript admin panel
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── lib/           # Firebase config
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── payments.ts    # Razorpay integration
│       ├── qrCheckIn.ts   # QR validation
│       ├── aiTrainer.ts   # GPT integration
│       ├── scheduled.ts   # Cron jobs
│       └── triggers.ts    # Firestore triggers
├── firebase.json          # Firebase config
├── firestore.rules        # Security rules
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
# Admin Dashboard
cd admin-dashboard
npm install

# Cloud Functions
cd ../functions
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable services: Firestore, Auth, Storage, Functions
3. Copy `.env.example` to `.env` and fill in your config

### 3. Run Locally

```bash
# Start Firebase Emulators
firebase emulators:start

# Start Admin Dashboard (in another terminal)
cd admin-dashboard
npm run dev
```

### 4. Deploy

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Cloud Firestore
- **Auth**: Firebase Auth (Phone OTP + Google)
- **Payments**: Razorpay
- **AI**: OpenAI GPT-4o-mini

## Features

- ✅ Premium gold-themed UI
- ✅ Role-based access (Member/Trainer/Admin/SuperAdmin)
- ✅ Member & Trainer management
- ✅ Workout & Diet plan assignment
- ✅ QR code check-in system
- ✅ AI-powered fitness trainer
- ✅ Razorpay payment integration
- ✅ Class scheduling & booking
- ✅ Automated notifications
- ✅ Multi-branch support

## Documentation

See `/docs` folder for detailed technical specifications.
