import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MissionLogTable() {
  const [missionLogs, setMissionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/mission-logs')
      .then(res => {
        setMissionLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading mission logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>📝 Mission Logs</h2>
      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>Mission ID</th>
            <th style={{padding: '10px'}}>Mission Name</th>
            <th style={{padding: '10px'}}>Log Date</th>
            <th style={{padding: '10px'}}>Entry Type</th>
            <th style={{padding: '10px'}}>Status</th>
            <th style={{padding: '10px'}}>Description</th>
          </tr>
        </thead>
        <tbody>
          {missionLogs.map((row, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{row[0]}</td>
              <td style={{padding: '8px'}}>{row[1]}</td>
              <td style={{padding: '8px'}}>{row[2]}</td>
              <td style={{padding: '8px'}}>{row[3]}</td>
              <td style={{padding: '8px'}}>{row[4]}</td>
              <td style={{padding: '8px'}}>{row[5]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total log entries: {missionLogs.length}</p>
    </div>
  );
}

export default MissionLogTable;