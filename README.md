# Ceylon AutoCar Frontend

Vite + React frontend for the Ceylon AutoCar rental platform.

## What changed

- JWT-based login flow
- backend-controlled roles for `ADMIN` and `CUSTOMER`
- admin-only user management and approval flow
- secure customer registration with backend approval status
- interactive showroom, fleet browsing, rental requests, and live support chat UI

## Frontend setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

3. Update `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_javascript_api_key_here
VITE_SUPPORT_CHAT_WS_URL=ws://localhost:8081/ws/support-chat
```

4. Start the frontend:

```bash
npm run dev
```

## Backend

The JWT backend now lives in:

`..\Ceylon-Autocar-Car-Rental-website--backend`

See that folder for:

- admin bootstrap env variables
- JWT configuration
- user management API
- car upload API
- rental request API
- websocket support chat server

## Quality checks

```bash
npm run lint
npm run build
```
