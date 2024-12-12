const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

class MigrationManager {
  constructor(config) {
    this.config = config;
  }

  async init() {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
    });

    // Create database if it doesn't exist
    await this.connection.query(
      `CREATE DATABASE IF NOT EXISTS ${this.config.database}`,
    );
    await this.connection.query(`USE ${this.config.database}`);

    // Create migrations table if it doesn't exist
    await this.connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
  }

  async getExecutedMigrations() {
    const [rows] = await this.connection.query("SELECT name FROM migrations");
    return rows.map((row) => row.name);
  }

  async run() {
    try {
      await this.init();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await fs.readdir(path.join(__dirname, "scripts"));

      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          console.log(`Executing migration: ${file}`);
          const migration = require(path.join(__dirname, "scripts", file));
          await migration.up(this.connection);
          await this.connection.query(
            "INSERT INTO migrations (name) VALUES (?)",
            [file],
          );
          console.log(`Migration ${file} executed successfully`);
        }
      }
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    } finally {
      if (this.connection) {
        await this.connection.end();
      }
    }
  }
}

module.exports = MigrationManager;
