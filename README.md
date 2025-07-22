# FONO Frontend 🏗️

> A family comms platform that you control. Built with React and TypeScript.
> 
> **Work in progress** - actively developing new features and improvements!

**FONO** means "meeting" in Niuean. It's a chat app for families who want to own their data instead of handing it over to tech companies.

## What it does ✨

- **🔐 Private messaging** - Your conversations are encrypted and stored on your own server
- **⚡ Real-time chat** - Messages appear instantly with typing indicators  
- **🔔 Desktop notifications** - Get notified when someone messages you (only when you're not already using the app)
- **👤 Family-friendly** - Use whatever names make sense for your family (Mum, Dad, Nana, etc.)
- **🏠 Self-hosted** - Run it on your own hardware
- **📱 Works everywhere** - Phone, tablet, computer etc.

## Currently working on 🚧

- **Activity feed** - Persistent notification history 
- **Better display name handling** - Improving how user names are fetched and displayed
- **File sharing** - Secure photo and document sharing (planned)
- **Mobile app** - Native iOS/Android apps (future goal)

## Getting it running 🚀

You'll need:
- Node.js 18+ 
- Docker (for the full setup)
- Auth0 account (free tier is fine)
- Pusher account (free tier works for families)

### Just the frontend 💻

```bash
git clone <your-repo-url>
cd fono-frontend
npm install
cp .env.example .env
# Fill in your Auth0 and Pusher details in .env
npm run dev
```

Then go to http://localhost:5173

### Full system 🐳

From the main FONO folder:
```bash
docker-compose up
```

This gets you everything:
- Frontend on localhost:5173
- Backend API on localhost:3000
- PostgreSQL database

## Environment setup ⚙️

Make a `.env` file with your API keys:

```bash
# Auth0 stuff
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience

# Pusher for real-time chat
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=your-pusher-cluster

# Backend API
VITE_API_URL=http://localhost:3000/v1
```

### Setting up Auth0 🔐

1. Create a "Single Page Application" in Auth0
2. Add `http://localhost:5173` to allowed callback/logout URLs
3. Create an API in Auth0 for the backend
4. Copy the domain, client ID, and audience to your .env

### Setting up Pusher 📡

1. Make a new Pusher Channels app
2. Grab the app key and cluster from the dashboard
3. Put them in your .env file

## How it's built 🏗️

### Tech stack 🛠️

- **React 18** with TypeScript
- **Vite** for development
- **Tailwind CSS** for styling
- **Auth0** for authentication
- **Pusher** for real-time messaging
- **Docker** for easy deployment

### Code organisation 📁

```
src/
├── components/          # React components
│   ├── settings/       # Settings page broken into smaller pieces
│   ├── ChatMessages.tsx
│   ├── MessageInput.tsx
│   └── TypingIndicator.tsx
├── hooks/              # Custom hooks for logic
│   ├── useChatApi.ts   # Main chat functionality
│   ├── useUsers.ts     # User profiles
│   └── useNotifications.ts # Browser notifications
├── pages/
│   ├── Home.tsx        # Main chat interface
│   └── SettingsPage.tsx
└── main.tsx           # App entry point
```

### How I organised the components 🧩

I broke everything into small components that do one thing each. Makes it way easier to debug and add features:

- **ChatMessages** - just displays messages
- **MessageInput** - handles typing and sending  
- **TypingIndicator** - shows the "..." when someone's typing
- **Settings components** - each settings section is separate (this was a big refactor!)

The main logic lives in custom hooks (`useChatApi`, `useNotifications`, etc.) so it's reusable and testable.

## Development 💻

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code style
npm run type-check   # TypeScript checking
```

## How the security works 🔒

**Authentication:**
- Auth0 handles all the login stuff (Google, GitHub, etc.)
- Gets you JWT tokens for API access
- No passwords stored in FONO

**Real-time messaging:**
- Each user gets their own private Pusher channel
- You need a valid JWT to subscribe to your channel
- Messages are encrypted before hitting the database
- Pusher only sees metadata, not actual message content

**Browser notifications:**
- Only shows notifications when you're not actively using FONO
- Uses browser's notification API
- No notification content stored anywhere

## Deployment 🚀

**Development:**
```bash
docker-compose up
```

**Production:**
```bash
npm run build
# Serve the dist/ folder with any static file server
```

The whole thing is containerised, so it runs the same everywhere.

## Why I built this 💭

After learning about data sovereignty in bootcamp, I realised families shouldn't have to give their private conversations to tech companies. FONO lets families run their own chat server.

It's inspired by the Niuean concept of "FONO" - family meetings where important decisions get made. Those conversations deserve privacy and family control.

This is my first major project after finishing web development bootcamp, and I wanted to build something that actually matters to people.

## The design 🎨

- Clean, modern interface that works on all devices
- Glassmorphism effects
- Designed for all ages - works for grandparents and kids
- Responsive layout that adapts to screen size

## Contributing 🤝

This is still a work-in-progress project! If you want to help out:

1. Fork the repo
2. Make your changes
3. Test that existing stuff still works
4. Submit a pull request

Keep it family-friendly and privacy-focused. The goal is strengthening family communication, not replacing it with tech.

**Current priorities:**
- Improving the activity feed functionality
- Better error handling and user feedback
- Mobile responsiveness improvements
- More comprehensive testing

## Other parts of FONO 🔗

- **Backend** - Node.js API with PostgreSQL
- **Infrastructure** - Docker setup and deployment configs
- **Documentation** - Technical docs and setup guides

## License 📄

MIT License - families and communities can adapt this for their own needs.

## Status & Roadmap 🗺️

**Currently working:**
- ✅ Real-time messaging
- ✅ Desktop notifications
- ✅ User authentication  
- ✅ Custom display names
- ✅ Docker deployment

**In development:**
- 🚧 Activity feed with read/unread states
- 🚧 Better display name resolution
- 🚧 Improved error handling

**Future plans:**
- 📋 File and image sharing
- 📋 Voice messages
- 📋 Mobile apps
- 📋 Group chat improvements

---

FONO is built for families who want control over their digital communication. Every feature is designed to help families stay connected while keeping their conversations private.

*Still learning and improving - feedback welcome!* 😊
