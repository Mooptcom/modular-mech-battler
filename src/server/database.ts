import { Pool } from 'pg';

// Ensure environment variables are loaded (e.g., using dotenv if not running in a managed environment)
// For simplicity, we assume they are set directly in the environment here.
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'password';
const dbName = process.env.DB_NAME || 'modular_mech_battler';

console.log(`Attempting to connect to database: ${dbName} on ${dbHost}:${dbPort} as user ${dbUser}`);

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  // Recommended settings for connection pooling
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection attempt to succeed
});

pool.on('connect', () => {
  console.log('Database connection pool connected.');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Optionally, you might want to terminate the application or attempt to reconnect
  // process.exit(-1);
});

// Function to test the connection
export async function testDatabaseConnection(): Promise<void> {
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully acquired client from pool and connected to the database.');
    await client.query('SELECT NOW()'); // Simple query to test connection
    console.log('Database query successful.');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    // Depending on the application's needs, you might want to throw the error
    // or handle it differently (e.g., retry logic, graceful shutdown).
    throw error; // Re-throw the error to indicate failure
  } finally {
    if (client) {
      client.release(); // Always release the client back to the pool
      console.log('Database client released.');
    }
  }
}

// Export the pool for use in other modules
export default pool;