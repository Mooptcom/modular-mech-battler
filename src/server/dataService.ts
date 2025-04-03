import pool from './database.js';

// --- Interfaces based on RDS Table Structure ---

export interface Player {
  player_id: string;
  username: string;
  xp: number;
  level: number;
  currency: number;
  // Assuming equipped_modules_json stores an array of module IDs or simple objects
  equipped_modules_json: string; // Raw JSON string from DB
  equippedModules?: any[]; // Optional parsed version
  // Assuming owned_modules_json stores an array of module IDs or simple objects
  owned_modules_json: string; // Raw JSON string from DB
  ownedModules?: any[]; // Optional parsed version
}

export interface Module {
  module_id: string;
  name: string;
  type: string; // e.g., 'weapon', 'armor', 'utility'
  // Assuming stats_json stores key-value pairs for module stats
  stats_json: string; // Raw JSON string from DB
  stats?: Record<string, any>; // Optional parsed version
  description: string;
  cost: number;
}

// --- Data Access Functions ---

/**
 * Fetches a player's data from the database.
 * @param playerId The ID of the player to fetch.
 * @returns A Player object or null if not found.
 */
export async function getPlayer(playerId: string): Promise<Player | null> {
  const query = 'SELECT * FROM players WHERE player_id = $1';
  try {
    const result = await pool.query(query, [playerId]);
    if (result.rows.length > 0) {
      const player = result.rows[0] as Player;
      // Optionally parse JSON fields here
      try {
        player.equippedModules = JSON.parse(player.equipped_modules_json || '[]');
        player.ownedModules = JSON.parse(player.owned_modules_json || '[]');
      } catch (parseError) {
        console.error(`Error parsing JSON for player ${playerId}:`, parseError);
        // Decide how to handle parse errors (e.g., return default values, log, etc.)
        player.equippedModules = [];
        player.ownedModules = [];
      }
      return player;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error);
    throw error; // Re-throw or handle as appropriate
  }
}

/**
 * Saves (inserts or updates) a player's data in the database.
 * Note: This is a simplified example. A real implementation would use INSERT ... ON CONFLICT UPDATE.
 * @param playerData The player data to save.
 */
export async function savePlayer(playerData: Player): Promise<void> {
  // Prepare JSON strings before saving
  const equippedJson = JSON.stringify(playerData.equippedModules || []);
  const ownedJson = JSON.stringify(playerData.ownedModules || []);

  // Simple UPSERT logic (consider more robust methods for production)
  const upsertQuery = `
    INSERT INTO players (player_id, username, xp, level, currency, equipped_modules_json, owned_modules_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (player_id) DO UPDATE SET
      username = EXCLUDED.username,
      xp = EXCLUDED.xp,
      level = EXCLUDED.level,
      currency = EXCLUDED.currency,
      equipped_modules_json = EXCLUDED.equipped_modules_json,
      owned_modules_json = EXCLUDED.owned_modules_json;
  `;
  try {
    await pool.query(upsertQuery, [
      playerData.player_id,
      playerData.username,
      playerData.xp,
      playerData.level,
      playerData.currency,
      equippedJson,
      ownedJson,
    ]);
    console.log(`Player ${playerData.player_id} saved successfully.`);
  } catch (error) {
    console.error(`Error saving player ${playerData.player_id}:`, error);
    throw error; // Re-throw or handle as appropriate
  }
}

/**
 * Loads all available modules from the database.
 * @returns An array of Module objects.
 */
export async function loadModules(): Promise<Module[]> {
  const query = 'SELECT * FROM modules';
  try {
    const result = await pool.query(query);
    return result.rows.map((row: any) => {
      const module = row as Module;
      // Optionally parse JSON fields here
      try {
        module.stats = JSON.parse(module.stats_json || '{}');
      } catch (parseError) {
        console.error(`Error parsing JSON for module ${module.module_id}:`, parseError);
        module.stats = {}; // Default to empty object on error
      }
      return module;
    });
  } catch (error) {
    console.error('Error loading modules:', error);
    throw error; // Re-throw or handle as appropriate
  }
}