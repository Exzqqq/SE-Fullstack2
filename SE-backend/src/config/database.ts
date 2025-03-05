import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Main database connection (hosted on your server)
const mainDb = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

// Secondary database for drugs and stocks (hosted remotely)
const drugDb = new Pool({
  user: process.env.DRUG_DB_USER,
  password: process.env.DRUG_DB_PASSWORD,
  database: process.env.DRUG_DB_NAME,
  host: process.env.DRUG_DB_HOST,
  port: parseInt(process.env.DRUG_DB_PORT || "5432"),
});

export { mainDb, drugDb };

// Function to check and create the main database
const ensureDatabaseExists = async () => {
  const rootClient = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres", // Connect to the default postgres database first
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
  });

  const client = await rootClient.connect();
  try {
    const dbName = process.env.POSTGRES_DB;
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await client.query(checkDbQuery, [dbName]);

    if (dbExists.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    } else {
      console.log(`✅ Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error("❌ Error ensuring database exists:", error);
  } finally {
    client.release();
    await rootClient.end(); // Ensure the pool is closed properly
  }
};

// Ensure tables exist in the main database
const createTables = async () => {
  const client = await mainDb.connect();
  try {
    await client.query("BEGIN");

    // Create the bills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        bill_id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NULL,
        discount DECIMAL(5,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the bill_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        bill_item_id SERIAL PRIMARY KEY,
        bill_id INTEGER REFERENCES bills(bill_id),
        stock_id INTEGER,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        service VARCHAR(255) DEFAULT NULL, 
        status VARCHAR(50) DEFAULT 'pending', 
        custom_price DECIMAL(10,2) DEFAULT 0,  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the expense table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expense (
        id SERIAL PRIMARY KEY,
        datetime TIMESTAMP NOT NULL,
        orderid INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        totalprice NUMERIC NOT NULL
      );
    `);

    await client.query("COMMIT");
    console.log("✅ Tables created successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

// Initialize database setup
(async () => {
  await ensureDatabaseExists();
  await createTables();
})();