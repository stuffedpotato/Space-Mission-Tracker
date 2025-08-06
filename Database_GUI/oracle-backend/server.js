const express = require('express');
const oracledb = require('oracledb');

const app = express();
const port = 3001;

app.use(express.json());

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

    // Query modified to include missions where agency is NULL.
    const result = await conn.execute(`
      SELECT m.mission_id, m.mission_name, m.spacecraft_name, 
       l.site_name, cb.name AS destination,
       a.agency_name, p.role,
       TO_CHAR(m.launch_date, 'YYYY-MM-DD') AS launch_date
       FROM Mission m
       JOIN LaunchSite l ON m.site_id = l.site_id
       JOIN CelestialBody cb ON m.body_id = cb.body_id
       LEFT JOIN ParticipateIn p ON m.mission_id = p.mission_id
       LEFT JOIN Agency a ON p.agency_id = a.agency_id
       ORDER BY m.mission_id
    `);

    const columns = [
      'Mission ID', 'Mission Name', 'Spacecraft', 'Launch Site', 'Destination', 'Agency Name', 'Agency\'s Role', 'Launch Date'
    ];

    // Return raw rows array to match frontend format
    res.json({columns, rows: result.rows});
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
      ORDER BY astronaut_id
    `);

    const columns = [
      'ID', 'Name', 'Nationality', 'Date of Birth'
    ];

    res.json({columns, rows: result.rows});
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
      ORDER BY m.mission_id
    `);

    const columns = [
      'Astronaut', 'Mission'
    ];

    res.json({columns, rows: result.rows});
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Filter entries of MissionLog by mission_id per user specification, else gets all mission log entries
app.get('/mission-logs', async (req, res) => {
  const { mission_id } = req.query;
  let conn;
  let whereClause = 'WHERE ml.mission_id = m.mission_id';
  let binds = {};

  // If mission_id is chosen, filter, else, all mission log entries are displayed
  if (mission_id) {
    whereClause = whereClause + ' AND ml.mission_id = :mission_id';
    binds.mission_id = mission_id;
  }

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(`
      SELECT ml.mission_id, m.mission_name,
        TO_CHAR(ml.log_date, 'YYYY-MM-DD') as log_date,
        ml.entry_type, ml.status, ml.description
      FROM MissionLog ml, Mission m
      ${whereClause}
      ORDER BY ml.log_date
    `, 
      binds
    );

    const columns = [
      'Mission ID', 'Mission Name', 'Log Date', 'Entry Type', 'Status', 'Description'
    ];

    res.json({columns, rows: result.rows});
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Insert a mission
app.post('/missions', async (req, res) => {
  let conn;
  try {
    const { mission_id, mission_name, site_id, body_id, spacecraft_name, spacecraft_id, start_date, end_date, launch_date, agency_id, role } = req.body;
    conn = await oracledb.getConnection(dbConfig);
    
    await conn.execute(`
      INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, spacecraft_name, mission_name, start_date, end_date, launch_date)
      VALUES (:mission_id, :site_id, :body_id, :spacecraft_id, :spacecraft_name, :mission_name, TO_DATE(:start_date, 'YYYY-MM-DD'), TO_DATE(:end_date, 'YYYY-MM-DD'), TO_DATE(:launch_date, 'YYYY-MM-DD'))
    `, {
      mission_id,
      site_id,
      body_id,
      spacecraft_id,
      spacecraft_name,
      mission_name,
      start_date: start_date || NULL,
      end_date: end_date || NULL,
      launch_date
    }, { autoCommit: true });

    // Also must insert into ParticipateIn if agency_id and role is provided

    if (agency_id && role) {
      await conn.execute(`
        INSERT INTO ParticipateIn (agency_id, mission_id, role)
        VALUES (:agency_id, :mission_id, :role)
        `, {
          agency_id,
          mission_id,
          role
        }, { autoCommit: true });
    }

    res.json({ message: 'Success' });
  } catch (err) {
    if (err.errorNum === 2291) { 
      const errors = await errorCheck(conn, req.body);
      res.status(400).json({
        error: 'FAILURE: Invalid foreign key references.',
        details: errors
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    if (conn) await conn.close();
  }
});

// Delete a mission
app.delete('/missions/:mission_id', async (req, res) => {
  let conn;
  try {
    const { mission_id } = req.params;
    conn = await oracledb.getConnection(dbConfig);
    
    await conn.execute(`
      DELETE FROM Mission 
      WHERE mission_id = :mission_id
    `, { 
      mission_id 
    }, { autoCommit: true });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Update a mission
app.put('/missions/:mission_id', async (req, res) => {
  let conn;
  try {
    const { mission_id } = req.params;
    const { mission_name, site_id, body_id, spacecraft_name, spacecraft_id, launch_date, agency_id, role } = req.body;
    conn = await oracledb.getConnection(dbConfig);

    // Update Mission table
    await conn.execute(`
      UPDATE Mission
      SET site_id = :site_id,
        body_id = :body_id,
        spacecraft_id = :spacecraft_id,
        spacecraft_name = :spacecraft_name,
        mission_name = :mission_name,
        launch_date = TO_DATE(:launch_date, 'YYYY-MM-DD')
      WHERE mission_id = :mission_id
    `, {
      site_id, 
      body_id, 
      spacecraft_id, 
      spacecraft_name,
      mission_name,
      launch_date,
      mission_id
    });    

    // Update ParticipateIn

    if (agency_id && role) {

      // Check if a record exists already in ParticipateIn for this mission
      const result = await conn.execute(`
        SELECT COUNT(*) AS count 
        FROM ParticipateIn 
        WHERE mission_id = :mission_id
      `, { 
        mission_id 
      });
    
      const exists = result.rows[0][0] > 0;
    
      if (exists) {
        // Update existing
        await conn.execute(`
          UPDATE ParticipateIn
          SET agency_id = :agency_id,
              role = :role
          WHERE mission_id = :mission_id
          AND role = :role
        `, {
          agency_id,
          role,
          mission_id
        });
      } else {
        // Insert new if does not exist already
        await conn.execute(`
          INSERT INTO ParticipateIn (agency_id, mission_id, role)
          VALUES (:agency_id, :mission_id, :role)
        `, {
          agency_id,
          mission_id,
          role
        });
      }
    } else {
      // Delete if a tuple already exists in ParticipateIn but now user is removing the attached agency
      await conn.execute(`
        DELETE FROM ParticipateIn
        WHERE mission_id = :mission_id
      `, { 
        mission_id,
      });
    }

    await conn.commit();
    res.json({ message: 'Mission updated successfully' });

  } catch (err) {
    if (err.errorNum === 2291) { 
      const errors = await errorCheck(conn, req.body);
      res.status(400).json({
        error: 'FAILURE: Invalid foreign key references.',
        details: errors
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    if (conn) await conn.close();
  }
});

// Error handling - finding out which foreign key reference is giving the error.
async function errorCheck(conn, data) {
  const errors = [];

  // Check Launch Site ID
  let result = await conn.execute(`
    SELECT COUNT(*) 
    FROM LaunchSite 
    WHERE site_id = :site_id
    `, { 
      site_id: data.site_id 
    }
  );
  if (result.rows[0][0] === 0) {
    errors.push(`Launch Site ID "${data.site_id}" does not exist`);
  }

  // Check Spacecraft ID
  result = await conn.execute(`
    SELECT COUNT(*) 
    FROM Spacecraft 
    WHERE spacecraft_id = :spacecraft_id
    `, { 
      spacecraft_id: data.spacecraft_id
    }
  );
  if (result.rows[0][0] === 0) {
    errors.push(`Spacecraft ID "${data.spacecraft_id}" does not exist`);
  }

  // Check Celestial Body ID
  result = await conn.execute(`
    SELECT COUNT(*) 
    FROM CelestialBody 
    WHERE body_id = :body_id
    `, { 
      body_id: data.body_id
    }
  );
  if (result.rows[0][0] === 0) {
    errors.push(`Celestial Body ID "${data.body_id}" does not exist`);
  }

  // Check Agency ID if user entered it
  if (data.agency_id) {
    result = await conn.execute(`
      SELECT COUNT(*) 
      FROM Agency 
      WHERE agency_id = :agency_id
      `, { 
        agency_id: data.agency_id
      }
    );
    if (result.rows[0][0] === 0) {
      errors.push(`Agency ID "${data.agency_id}" does not exist`);
    }
  }

  return errors;
}

// Insert an entry into mission log
app.post('/mission-logs', async (req, res) => {
  let conn;
  try {
    const { mission_id, log_date, entry_type, status, description } = req.body;
    conn = await oracledb.getConnection(dbConfig);
    
    await conn.execute(`
      INSERT INTO MissionLog (mission_id, log_date, entry_type, status, description)
      VALUES (:mission_id, TO_DATE(:log_date, 'YYYY-MM-DD'), :entry_type, :status, :description)
    `, {
      mission_id: mission_id,
      log_date,
      entry_type,
      status,
      description
    }, { autoCommit: true });

    res.json({ message: 'Success' });
  } catch (err) {
    if (err.errorNum === 2291) { 
      res.status(400).json({
        error: 'Mission ID does not exist. Please create this Mission first.'
      })
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    if (conn) await conn.close();
  }
});

// Delete an entry of mission log
app.delete('/mission-logs/:mission_id/:log_date', async (req, res) => {
  let conn;
  try {
    const { mission_id, log_date } = req.params;
    conn = await oracledb.getConnection(dbConfig);
    
    await conn.execute(`
      DELETE FROM MissionLog 
      WHERE mission_id = :mission_id AND TO_CHAR(log_date, 'YYYY-MM-DD') = :log_date
    `, { mission_id, log_date }, { autoCommit: true });

    res.json({ message: 'Deleted' });
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
  console.log('  POST /mission-logs');
  console.log('  DELETE /mission-logs/:mission_id/:log_date');
});