import express from "express";
import "dotenv/config";
import prisma from "./lib/prisma.js";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

/**
 * Browser origins allowed to call this API.
 * Prefer CORS_ORIGINS (comma-separated); else CLIENT_URL; else local Next.
 * Example on Render: CORS_ORIGINS=https://nocta-two-theta.vercel.app
 * or CLIENT_URL=https://nocta-two-theta.vercel.app
 */
const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ??
    process.env.CLIENT_URL ??
    "http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

// Local Next often flips between localhost / 127.0.0.1 — allow both in dev.
for (const origin of [...allowedOrigins]) {
  if (origin.includes("localhost")) {
    allowedOrigins.add(origin.replace("localhost", "127.0.0.1"));
  } else if (origin.includes("127.0.0.1")) {
    allowedOrigins.add(origin.replace("127.0.0.1", "localhost"));
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, health checks) send no Origin.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api", routes);

// Render injects PORT (often 10000). Local default 3001 — do not set PORT in Render env.
const PORT = Number(process.env.PORT) || 3001;

app.get("/health", async (req, res) => {
  try {
    // Execute the raw SQL query "SELECT 1" to ask the database to return the value 1.
    const response = await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "Supabase Connected!",
      response,
    });
  } catch (error) {
    console.error("Error :", error);

    res.status(500).json({
      status: "error",
      database: "Supabase Disconnected!",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running at port ${PORT}`);
});
