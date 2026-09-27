import express from "express";
import "dotenv/config";
import prisma from "./lib/prisma.js";
import routes from "./routes/index.js";

const app = express();

app.use("/api", routes);

// Local default; Render injects PORT at runtime — do not put PORT in .env.
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
