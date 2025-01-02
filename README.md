# Webflow App Starter

A starter project for creating a Webflow Data Client that demonstrates OAuth authentication and basic API interactions. This project provides a simple example of how to:

- Set up a Webflow Data Client server
- Implement OAuth 2.0 authentication
- Make authenticated API calls
- Display site data in a clean interface

## 🚀 Quick Start

1. Register your app in [Webflow's Developer Portal](https://developers.webflow.com/v2.0.0/data/docs/register-an-app)
2. Clone this repository
3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Copy `.env.example` to `.env` and add your credentials:

   ```env
   WEBFLOW_CLIENT_ID=your_client_id
   WEBFLOW_SECRET=your_client_secret
   PORT=3000
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🔒 Setting Up OAuth

1. Create a tunnel to your local server:

   ```bash
   ngrok http 3000
   ```

2. Copy the HTTPS URL from ngrok (e.g., `https://your-tunnel.ngrok.io`)
3. In the Workspace Settings -> Apps & Integrations -> Your App:
   - Set your OAuth Redirect URI to: `https://your-tunnel.ngrok.io/auth`
   - Add required scopes (this example uses `sites:read`)

## 🛠️ Tech Stack

- **[Webflow SDK](https://github.com/webflow/js-webflow-api)** - Official Webflow API client
- **[Fastify](https://www.fastify.io/)** - Fast and low overhead web framework
- **[Level](https://github.com/Level/level)** - Lightweight key-value storage
- **[Nodemon](https://nodemon.io/)** - Development auto-reload

## 📝 Important Notes

- This is a **development-only** example and should not be used in production
- The database is cleared when the server stops (see `cleanup` function)
- Access tokens are stored unencrypted - in production, you should:
  - Encrypt sensitive data
  - Use a proper database
  - Implement token refresh
  - Add error handling
  - Add user sessions

## 🔍 Project Structure

```
.
├── app/
│ ├── server.js # Main server file with OAuth and API endpoints
│ └── static/ # Frontend assets
│ ├── index.html # Main UI
│ └── main.js # Frontend JavaScript
├── .env.example # Environment variables template
└── package.json
```

## 📚 Additional Resources

- [Webflow Data Client Documentation](https://developers.webflow.com/v2.0.0/data/docs/getting-started-data-clients)
- [OAuth 2.0 Implementation Guide](https://developers.webflow.com/v2.0.0/data/docs/oauth)
- [Available API Scopes](https://developers.webflow.com/v2.0.0/data/reference/scopes)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is MIT licensed.
