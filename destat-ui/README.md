# DESTAT UI

## Wallet connection

- Run `npm ci` and `npm run dev`, then open `/profile/survey`.
- Click **Connect**, select **MetaMask**, and approve the connection in the extension.
- The button displays the connected address; **Disconnect** clears the connection.
- Hardhat (chain ID 31337, `http://127.0.0.1:8545`) and Sepolia are configured.
- Copy `.env.example` to `.env` for optional configuration. MetaMask extension
  connections need no WalletConnect key. To enable mobile WalletConnect, set
  `VITE_WALLETCONNECT_PROJECT_ID` to your own project ID and restart the dev server.
- Supabase settings are optional for the initial dashboard and My Survey screen.
- Validate with `npm run typecheck` and `npm run build`.

The Connect button calls `rabbykit.open()` through a browser-only module to
keep server rendering safe. Setup follows the [official RabbyKit documentation](https://rabbykit.rabby.io/docs/install/).

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
