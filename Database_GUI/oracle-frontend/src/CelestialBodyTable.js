import axios from 'axios';
import { useEffect, useState } from 'react';

function CelestialBodyTable() {
  const [bodies, setBodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/celestial-bodies')
      .then(res => {
        setBodies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading celestial bodies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>🪐 Celestial Bodies</h2>
      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>ID</th>
            <th style={{padding: '10px'}}>Name</th>
            <th style={{padding: '10px'}}>Type</th>
            <th style={{padding: '10px'}}>Atmosphere</th>
          </tr>
        </thead>
        <tbody>
          {bodies.map((body, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{body.body_id}</td>
              <td style={{padding: '8px'}}>{body.name}</td>
              <td style={{padding: '8px'}}>{body.cb_type}</td>
              <td style={{padding: '8px'}}>{body.has_atmosphere}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total celestial bodies: {bodies.length}</p>
    </div>
  );
}

export default CelestialBodyTable;
