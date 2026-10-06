import express from "express";
import "dotenv/config";
import prisma from "./lib/prisma.js";
import routes from "./routes/index.js";
import cors from "cors";
import { HttpError } from "./lib/http-error.js";
import { asyncHandler } from "./lib/async-handler.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
app.use(express.json());

/** Origins always allowed (local + known production web). Env can add more. */
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://nocta-two-theta.vercel.app",
];

const allowedOrigins = new Set(
  [
    ...DEFAULT_CORS_ORIGINS,
    ...(process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ],
);

// Local Next often flips between localhost / 127.0.0.1 — allow both in dev.
for (const origin of [...allowedOrigins]) {
  if (origin.includes("localhost")) {
    allowedOrigins.add(origin.replace("localhost", "127.0.0.1"));
  } else if (origin.includes("127.0.0.1")) {
    allowedOrigins.add(origin.replace("127.0.0.1", "localhost"));
  }
}

/** Vercel prod + preview hosts for this app (goals, users, activity share this). */
function isNoctaVercelOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:") return false;
    // nocta-two-theta.vercel.app · nocta-*-*.vercel.app previews
    return (
      hostname === "nocta-two-theta.vercel.app" ||
      (hostname.endsWith(".vercel.app") && hostname.startsWith("nocta"))
    );
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string | undefined): boolean {
  // Non-browser clients (curl, health checks) send no Origin.
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (isNoctaVercelOrigin(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

app.use("/api", routes);

// Render injects PORT (often 10000). Local default 3001 — do not set PORT in Render env.
const PORT = Number(process.env.PORT) || 3001;

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    try {
      // Execute the raw SQL query "SELECT 1" to ask the database to return the value 1.
      const response = await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: "ok",
        database: "Supabase Connected!",
        response,
      });
    } catch (error) {
      throw HttpError.internal(
        "DATABASE_UNAVAILABLE",
        "Database health check failed",
        {
          hint: "Check DATABASE_URL and that Supabase is reachable from this host.",
          cause: error,
        },
      );
    }
  }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server is running at port ${PORT}`);
});
