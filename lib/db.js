// lib/db.js
// MySQL connection using mysql2
import mysql from 'mysql2/promise';

let pool;

/**
 * @function getDb
 * Database connection pool that can be used for reading and writing information to the database.
 * @returns pool - a promise object for the database connection, ensuring that the connection can be accessed asynchronously
 */
export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQL_HOST     || 'localhost',
      port:     process.env.MYSQL_PORT     || 3306,
      user:     process.env.MYSQL_USER     || 'root',
      password: process.env.MYSQL_PASSWORD || 'rootpassword',
      database: process.env.MYSQL_DATABASE || 'teamup',
      waitForConnections: true,
      connectionLimit:    10,
    });
  }
  return pool;
}
