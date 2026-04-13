// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); 
const { Pool } = pkg;

export const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true"
    ? { require: true, rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

db.connect()
  .then(() => console.log("✅ Connected to Neon database"))
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  });
