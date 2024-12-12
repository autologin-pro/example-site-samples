module.exports = {
  async up(connection) {
    await connection.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
  },

  async down(connection) {
    await connection.query("DROP TABLE IF EXISTS todos");
  },
};
