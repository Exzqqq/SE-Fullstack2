import express from "express";
import cors from "cors";
import routes from "./src/routes";
import pool from "./src/config/database";

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("Database connection established successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
    process.exit(1);
  }
}

console.log("Starting server...");
startServer();

export default app;
