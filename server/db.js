import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "ai_tool_bazaar",
  waitForConnections: true,
  connectionLimit: 10
})

export default pool
