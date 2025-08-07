import axios from 'axios';
import { useEffect, useState } from 'react';

function CelestialBodyTable() {
  const [bodies, setBodies] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/celestial-bodies')
      .then(res => {
        setColumns(res.data.columns);
        setSelectedCols(res.data.columns);
        setBodies(res.data.rows);
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
            {selectedCols.includes('Celestial Body ID') && <th style={{padding: '10px'}}>Celestial Body ID</th>}
            {selectedCols.includes('Name') && <th style={{padding: '10px'}}>Name</th>}
            {selectedCols.includes('Type') && <th style={{padding: '10px'}}>Type</th>}
            {selectedCols.includes('Has Atmosphere?') && <th style={{padding: '10px'}}>Has Atmosphere?</th>}
          </tr>
        </thead>
        <tbody>
          {bodies.map((body, i) => (
            <tr key={i}>
              {selectedCols.includes('Celestial Body ID') && <td style={{padding: '8px'}}>{body[0]}</td>}
              {selectedCols.includes('Name') && <td style={{padding: '8px'}}>{body[1]}</td>}
              {selectedCols.includes('Type') && <td style={{padding: '8px'}}>{body[2]}</td>}
              {selectedCols.includes('Has Atmosphere?') && <td style={{padding: '8px'}}>{body[3]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total celestial bodies: {bodies.length}</p>
    </div>
  );
}

export default CelestialBodyTable;
