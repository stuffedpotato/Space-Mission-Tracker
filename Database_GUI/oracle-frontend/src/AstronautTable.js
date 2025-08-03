import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AstronautTable() {
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/astronauts')
      .then(res => {
        setAstronauts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading astronauts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>👨‍🚀 Astronauts</h2>
      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>ID</th>
            <th style={{padding: '10px'}}>Name</th>
            <th style={{padding: '10px'}}>Nationality</th>
            <th style={{padding: '10px'}}>Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {astronauts.map((a, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{a.astronaut_id}</td>
              <td style={{padding: '8px'}}>{a.name}</td>
              <td style={{padding: '8px'}}>{a.nationality}</td>
              <td style={{padding: '8px'}}>{a.date_of_birth}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total astronauts: {astronauts.length}</p>
    </div>
  );
}

export default AstronautTable;