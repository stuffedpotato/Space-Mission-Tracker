const express = require('express');
const oracledb = require('oracledb');

const app = express();
const port = 3001;

const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'localhost:1521/XEPDB1'
};

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Get all missions (return as arrays to match frontend expectations)
app.get('/missions', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(`
      SELECT m.mission_id, m.mission_name, m.spacecraft_name, 
             l.site_name, cb.name as destination, a.agency_id, p.role,
             TO_CHAR(m.launch_date, 'YYYY-MM-DD') as launch_date
      FROM Mission m, LaunchSite l, CelestialBody cb, ParticipateIn p, Agency a
      WHERE m.site_id = l.site_id AND m.body_id = cb.body_id AND m.mission_id = p.mission_id AND p.agency_id = a.agency_id
    `);
    // const result = await conn.execute(`
    //   SELECT m.mission_id, m.mission_name, m.spacecraft_name, 
    //          l.site_name, cb.name as destination,
    //          TO_CHAR(m.launch_date, 'YYYY-MM-DD') as launch_date
    //   FROM Mission m
    //   JOIN LaunchSite l ON m.site_id = l.site_id
    //   JOIN CelestialBody cb ON m.body_id = cb.body_id
    // `);

    // Return raw rows array to match frontend format
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Get all astronauts
app.get('/astronauts', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(`
      SELECT astronaut_id, astronaut_name, nationality, 
             TO_CHAR(dob, 'YYYY-MM-DD') as date_of_birth
      FROM Astronaut
      ORDER BY astronaut_name
    `);

    const astronauts = result.rows.map(row => ({
      astronaut_id: row[0],
      name: row[1],
      nationality: row[2],
      date_of_birth: row[3]
    }));

    res.json(astronauts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Get mission assignments
app.get('/assignments', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(`
      SELECT a.astronaut_name, m.mission_name
      FROM Astronaut a, Mission m, AssignedTo at
      WHERE a.astronaut_id = at.astronaut_id AND at.mission_id = m.mission_id
      ORDER BY a.astronaut_name
    `);
    // const result = await conn.execute(`
    //   SELECT a.astronaut_name, m.mission_name
    //   FROM Astronaut a
    //   JOIN AssignedTo at ON a.astronaut_id = at.astronaut_id
    //   JOIN Mission m ON at.mission_id = m.mission_id
    //   ORDER BY a.astronaut_name
    // `);

    const assignments = result.rows.map(row => ({
      astronaut: row[0],
      mission: row[1]
    }));

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Get mission logs
app.get('/mission-logs', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(`
      SELECT m.mission_id, m.mission_name, 
             TO_CHAR(ml.log_date, 'YYYY-MM-DD') as log_date,
             ml.entry_type, ml.status, ml.description
      FROM MissionLog ml, Mission m
      WHERE ml.mission_id = m.mission_id
      ORDER BY ml.log_date, ml.mission_id
    `);
    // const result = await conn.execute(`
    //   SELECT ml.mission_id, m.mission_name, 
    //          TO_CHAR(ml.log_date, 'YYYY-MM-DD') as log_date,
    //          ml.entry_type, ml.status, ml.description
    //   FROM MissionLog ml
    //   JOIN Mission m ON ml.mission_id = m.mission_id
    //   ORDER BY ml.log_date, ml.mission_id
    // `);

    // Return raw rows for consistency with other endpoints
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Test endpoints:');
  console.log('  GET /test');
  console.log('  GET /missions');
  console.log('  GET /astronauts');
  console.log('  GET /assignments');
  console.log('  GET /mission-logs');
});