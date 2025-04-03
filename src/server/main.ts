import { testDatabaseConnection } from './database.js'; // Note the .js extension

async function initializeServer() {
  console.log('Initializing server...');

  try {
    // Test the database connection on startup
    await testDatabaseConnection();
    console.log('Database connection verified successfully.');

    // --- Add other server initialization logic here ---
    // For example, loading game data, setting up game loops, etc.
    console.log('Server initialization complete.');

  } catch (error) {
    console.error('Server initialization failed:', error);
    // Decide how to handle initialization errors (e.g., exit the process)
    process.exit(1); // Exit if database connection fails
  }
}

// Start the server initialization process
initializeServer();

// --- Placeholder for HYTOPIA integration ---
// The actual HYTOPIA server logic might need to be integrated here
// or this script might be called from the main Hytopia entry point (index.ts).
// For now, this file focuses on database initialization.

// Keep the process running if needed (e.g., for background tasks or if integrated into a larger server)
// setInterval(() => {}, 1 << 30); // Example: Keep alive indefinitely