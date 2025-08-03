const oracledb = require('oracledb');

const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'localhost:1521/XEPDB1'
};

async function testDatabase() {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);
    console.log("✅ Connected to database\n");

    // Test 1: Check if all tables exist
    console.log("📋 Checking tables...");
    const tablesResult = await conn.execute(`
      SELECT table_name FROM user_tables 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`  - ${row[0]}`));

    // Test 2: Count records in each table
    console.log("\n📊 Record counts:");
    const tables = ['EQUIPMENT', 'LAUNCHSITE', 'CELESTIALBODY', 'SPACECRAFTMODEL', 
                   'AGENCY', 'ASTRONAUT', 'TRAININGPROGRAM', 'SPACECRAFT', 
                   'MISSION', 'MISSIONLOG', 'CARRIES', 'PARTICIPATEIN', 
                   'PILOT', 'ASSIGNEDTO', 'TRAINEDIN'];

    for (const table of tables) {
      try {
        const result = await conn.execute(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${result.rows[0][0]} records`);
      } catch (err) {
        console.log(`  ${table}: ❌ Error - ${err.message}`);
      }
    }

    // Test 3: Sample data query
    console.log("\n🚀 Sample Mission Data:");
    const missionResult = await conn.execute(`
      SELECT m.mission_name, m.spacecraft_name, l.site_name, cb.name as destination
      FROM Mission m
      JOIN LaunchSite l ON m.site_id = l.site_id
      JOIN CelestialBody cb ON m.body_id = cb.body_id
    `);

    if (missionResult.rows.length > 0) {
      missionResult.rows.forEach(row => {
        console.log(`  Mission: ${row[0]}`);
        console.log(`  Spacecraft: ${row[1]}`);
        console.log(`  Launch Site: ${row[2]}`);
        console.log(`  Destination: ${row[3]}\n`);
      });
    }

    // Test 4: Astronaut assignments
    console.log("👨‍🚀 Astronaut Assignments:");
    const astronautResult = await conn.execute(`
      SELECT a.astronaut_name, m.mission_name
      FROM Astronaut a
      JOIN AssignedTo at ON a.astronaut_id = at.astronaut_id
      JOIN Mission m ON at.mission_id = m.mission_id
      ORDER BY a.astronaut_name
    `);

    astronautResult.rows.forEach(row => {
      console.log(`  ${row[0]} → ${row[1]}`);
    });

    console.log("\n🎉 Database test completed successfully!");

  } catch (err) {
    console.error("❌ Database test failed:", err.message);
  } finally {
    if (conn) await conn.close();
  }
}

testDatabase();