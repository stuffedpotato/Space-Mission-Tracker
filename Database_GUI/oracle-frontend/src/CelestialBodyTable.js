import axios from 'axios';
import { useEffect, useState } from 'react';

function CelestialBodyTable() {
  const [bodies, setBodies] = useState([]);
  const [columns, setColumns] = useState(['ID', 'Name', 'Type', 'Atmosphere']);
  const [selectedCols, setSelectedCols] = useState(['ID', 'Name', 'Type', 'Atmosphere']);
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

      <div style={{ marginBottom: '10px' }}>
        {columns.map(col => (
          <label key={col} style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={selectedCols.includes(col)}
              onChange={() => {
                if (selectedCols.includes(col)) {
                  setSelectedCols(prev => prev.filter(c => c !== col));
                } else {
                  setSelectedCols(prev => [...prev, col]);
                }
              }}
            />
            {col}
          </label>
        ))}
      </div>

      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            {selectedCols.includes('ID') && <th style={{padding: '10px'}}>ID</th>}
            {selectedCols.includes('Name') && <th style={{padding: '10px'}}>Name</th>}
            {selectedCols.includes('Type') && <th style={{padding: '10px'}}>Type</th>}
            {selectedCols.includes('Atmosphere') && <th style={{padding: '10px'}}>Atmosphere</th>}
          </tr>
        </thead>
        <tbody>
          {bodies.map((body, i) => (
            <tr key={i}>
              {selectedCols.includes('ID') && <td style={{padding: '8px'}}>{body.body_id}</td>}
              {selectedCols.includes('Name') && <td style={{padding: '8px'}}>{body.name}</td>}
              {selectedCols.includes('Type') && <td style={{padding: '8px'}}>{body.cb_type}</td>}
              {selectedCols.includes('Atmosphere') && <td style={{padding: '8px'}}>{body.has_atmosphere}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total celestial bodies: {bodies.length}</p>
    </div>
  );
}

export default CelestialBodyTable;
