const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const schema = require("./schema");

// Create the connection
const client = postgres(process.env.DATABASE_URL);

// Create the database instance
const db = drizzle(client, { schema });

module.exports = { db };
