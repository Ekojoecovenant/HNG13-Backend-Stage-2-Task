import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const migrate = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });

    console.log("Connected to MySQL server");

    // Crete the db
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log(
      `✅ Database "${process.env.DB_NAME}" created or already exists`
    );

    // use the db
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create contries table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS countries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            capital VARCHAR(255),
            region VARCHAR(100),
            population BIGINT NOT NULL,
            currency_code VARCHAR(10),
            exchange_rate DECIMAL(20, 6),
            estimated_gdp DECIMAL(30, 2),
            flag_url TEXT,
            last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_region (region),
            INDEX idx_currency_code (currency_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log(`✅ Table "countries" created or already exists`);

    // create metadata table for global refresh timestamp
    const createMetadataQuery = `
        CREATE TABLE IF NOT EXISTS metadata (
            id INT AUTO_INCREMENT PRIMARY KEY,
            key_name VARCHAR(100) NOT NULL UNIQUE,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createMetadataQuery);
    console.log(`✅ Table "metadata" created or already exists`);

    // Insert default metadata
    await connection.query(`
        INSERT INTO metadata (key_name, value)
        VALUES ('last_refreshed_at', NULL)
        ON DUPLICATE KEY UPDATE key_name=key_name
    `);

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

migrate();
