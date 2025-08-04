const oracledb = require('oracledb');
const fs = require('fs');

const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'localhost:1521/XEPDB1'
};

// Tables in dependency order (reverse order for dropping)
const tableNames = [
  'TrainedIn', 'AssignedTo', 'Researcher', 'Engineer', 'Pilot',
  'ParticipateIn', 'Carries', 'MissionLog', 'Mission', 'Spacecraft',
  'TrainingProgram', 'Astronaut', 'Agency', 'SpacecraftModel', 
  'CelestialBody', 'LaunchSite', 'Equipment'
];

async function dropTables(conn) {
  console.log("Dropping existing tables...");
  
  for (const tableName of tableNames) {
    try {
      await conn.execute(`DROP TABLE ${tableName} CASCADE CONSTRAINTS`);
      console.log(`Dropped ${tableName}`);
    } catch (err) {
      if (err.errorNum === 942) { // Table doesn't exist
        console.log(` ${tableName} (doesn't exist)`);
      } else {
        console.log(`Error dropping ${tableName}: ${err.message}`);
      }
    }
  }
}

async function setupDB() {
  const sql = fs.readFileSync('init_db.sql', 'utf8');
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);
    console.log("Connected to database");

    // Drop existing tables first
    await dropTables(conn);

    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`\nExecuting ${statements.length} SQL statements...`);

    for (const stmt of statements) {
      await conn.execute(stmt);
      console.log("check");
    }

    await conn.commit();
    console.log("Database initialized successfully!");
    
  } catch (err) {
    console.error("Setup failed:", err.message);
  } finally {
    if (conn) await conn.close();
  }
}

setupDB();