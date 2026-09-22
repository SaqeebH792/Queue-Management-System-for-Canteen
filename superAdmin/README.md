# UniBite Super Admin Frontend

Dark, responsive Super Admin console for UniBite, built with React, Vite, Tailwind CSS, Redux Toolkit, Axios, React Router and Socket.IO.

## Backend integration

The frontend expects the UniBite backend at:

`http://localhost:8080/api/users`

Socket.IO is expected at:

`http://localhost:8080`

Copy `.env.example` to `.env` if you need to change these URLs.

## Supported Super Admin flows

- Super Admin login
- Dashboard statistics
- Activation request listing, search, filtering and pagination
- Approve/reject activation requests
- University Admin listing, search, filtering and pagination
- Deactivate University Admin
- Notification listing
- Real-time Socket.IO notifications

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
