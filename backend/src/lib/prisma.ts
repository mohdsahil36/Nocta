import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

// sslmode=require makes pg verify the cert. Supabase’s chain is not in Node’s store.
const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete("sslmode");

const adapter = new PrismaPg({
  connectionString: databaseUrl.toString(),
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

export default prisma;
