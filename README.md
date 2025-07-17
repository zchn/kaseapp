# kaseapp

To get started with kaseapp, run the following commands:

- cd kaseapp
- npm install
- npm run dev

Before launching your app:

- Set up account manifest
  - Required for app discovery, notifications, and client integration
  - Run npx create-onchain --manifest from project root
- Support webhooks and background notifications (optional)
  - Set REDIS_URL and REDIS_TOKEN environment variables