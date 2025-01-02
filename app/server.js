import { WebflowClient } from "webflow-api";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import url from "url";
import { Level } from "level";
import fs from "fs/promises";

// Load environment variables from .env file
const {
  WEBFLOW_CLIENT_ID,
  WEBFLOW_SECRET,
  PORT = 3000,
  NODE_ENV = "development",
} = process.env;

// Validate required environment variables
if (!WEBFLOW_CLIENT_ID || !WEBFLOW_SECRET) {
  console.error(
    "Missing required environment variables. Please check your .env file:"
  );
  console.error("WEBFLOW_CLIENT_ID and WEBFLOW_SECRET are required");
  process.exit(1);
}

// Initialize our server with basic security headers
const server = Fastify({
  logger: true,
  trustProxy: true, // Required for secure cookies behind a proxy
});

// Add security headers
server.addHook("onSend", async (request, reply) => {
  reply.headers({
    "X-Content-Type-Options": "nosniff", // Prevent MIME type sniffing
    "X-Frame-Options": "DENY", // Prevent clickjacking
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains", // Enforce HTTPS
  });
});

// Initialize the database (Note: Use a proper database in production)
const db = new Level("data", { valueEncoding: "json" });
await db.open();

// OAuth 2.0 authentication endpoint
server.get("/auth", async (req, reply) => {
  const { code, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error("OAuth Error:", error, error_description);
    return reply.code(400).send({
      error,
      message: error_description,
    });
  }

  // If no code is provided, redirect to the authorization URL
  if (!code) {
    const installUrl = WebflowClient.authorizeURL({
      scope: scopes,
      clientId: WEBFLOW_CLIENT_ID,
      // Optional: Add state parameter for CSRF protection
      state: Math.random().toString(36).substring(7),
    });
    return reply.redirect(installUrl);
  }

  try {
    // Exchange the code for an access token
    const token = await WebflowClient.getAccessToken({
      clientId: WEBFLOW_CLIENT_ID,
      clientSecret: WEBFLOW_SECRET,
      code: code,
    });

    // Store the token in the database
    await db.put("token", token);

    if (NODE_ENV === "development") {
      console.log("\nAccess Token Received:", token, "\n");
    }

    return reply.redirect("/?authorized=true");
  } catch (error) {
    console.error("Auth Error:", error);
    return reply.code(500).send({
      error: "Authentication failed",
      message: error.message,
    });
  }
});

// Define the permissions your app needs
// See https://developers.webflow.com/v2.0.0/data/reference/scopes for all available scopes
const scopes = [
  "sites:read",
  // Uncomment scopes as needed:
  // "pages:read",
  // "pages:write",
  // "collections:read",
  // "collections:write",
];

// Example API endpoint
server.get("/sites", async (req, reply) => {
  try {
    const accessToken = await db.get("token");

    const webflow = new WebflowClient({
      accessToken,
      // Add rate limiting and timeout options
      timeOurInSeconds: 10000, // 10 second timeout
      maxRetries: 3, // Retry up to 3 times
    });

    const sites = await webflow.sites.list();
    return sites;
  } catch (error) {
    console.error("API Error:", error);

    // Handle different types of errors
    if (error.code === "LEVEL_NOT_FOUND") {
      return reply.code(401).send({
        error: "Not authenticated",
        message: "Please authenticate first",
      });
    }

    if (error.response?.status === 401) {
      return reply.code(401).send({
        error: "Invalid token",
        message: "Please authenticate again",
      });
    }

    return reply.code(500).send({
      error: "Server error",
      message: "Failed to fetch sites",
    });
  }
});

// --- Helper Functions and Setup Below --- //

// Set up static file serving for our frontend
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
server.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
});

// Home page - serves static/index.html
server.get("/", async (req, reply) => {
  await reply.sendFile("index.html");
});

// Handle cleanup on server shutdown
const cleanup = async () => {
  try {
    await db.close();
    await fs.rm("data", { recursive: true, force: true });
    console.log("Database cleaned up successfully");
  } catch (error) {
    console.error("Error cleaning up database:", error);
  }
  process.exit(0);
};

// Listen for shutdown signals
process.on("SIGINT", cleanup); // Ctrl+C
process.on("SIGTERM", cleanup); // Kill command
process.on("SIGUSR2", cleanup); // Nodemon restart

// Start the server
server.listen({ port: PORT, host: "localhost" }, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("To use with ngrok: ngrok http " + PORT);
});
