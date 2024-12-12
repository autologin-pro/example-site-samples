const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const MigrationManager = require("./migrations/migrationManager");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_db",
  port: process.env.DB_PORT || 3306, // Added DB_PORT
};

// Run migrations before starting the server
async function startServer() {
  try {
    // Run migrations
    const migrationManager = new MigrationManager(dbConfig);
    await migrationManager.run();
    console.log("Migrations completed successfully");

    // Create database pool
    const pool = mysql.createPool(dbConfig).promise();

    app.get("/up", async (req, res) => {
      try {
        // Optional: You can also check database connection here
        const [result] = await pool.query("SELECT 1");
        res.json({
          status: "OK",
          message: "Server is up and running",
          timestamp: new Date().toISOString(),
          dbConnection: "Connected",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          status: "ERROR",
          message: "Server is running but database connection failed",
          timestamp: new Date().toISOString(),
          dbConnection: "Failed",
        });
      }
    });
    // Routes

    // GET all todos
    app.get("/todos", async (req, res) => {
      try {
        const [rows] = await pool.query("SELECT * FROM todos");
        res.json(rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // GET single todo
    app.get("/todos/:id", async (req, res) => {
      try {
        const [rows] = await pool.query("SELECT * FROM todos WHERE id = ?", [
          req.params.id,
        ]);
        if (rows.length === 0) {
          return res.status(404).json({ message: "Todo not found" });
        }
        res.json(rows[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // CREATE todo
    app.post("/todos", async (req, res) => {
      const { title, description } = req.body;
      try {
        const [result] = await pool.query(
          "INSERT INTO todos (title, description) VALUES (?, ?)",
          [title, description],
        );
        const [newTodo] = await pool.query("SELECT * FROM todos WHERE id = ?", [
          result.insertId,
        ]);
        res.status(201).json(newTodo[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // UPDATE todo
    app.put("/todos/:id", async (req, res) => {
      const { title, description, completed } = req.body;
      try {
        const [result] = await pool.query(
          "UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?",
          [title, description, completed, req.params.id],
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Todo not found" });
        }
        const [updatedTodo] = await pool.query(
          "SELECT * FROM todos WHERE id = ?",
          [req.params.id],
        );
        res.json(updatedTodo[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // DELETE todo
    app.delete("/todos/:id", async (req, res) => {
      try {
        const [result] = await pool.query("DELETE FROM todos WHERE id = ?", [
          req.params.id,
        ]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Todo not found" });
        }
        res.json({ message: "Todo deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
