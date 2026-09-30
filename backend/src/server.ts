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
const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  process.env.CLIENT_URL ??
  "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, health checks) send no Origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
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
