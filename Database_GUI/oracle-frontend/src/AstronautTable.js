import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AstronautTable() {
  const [astronauts, setAstronauts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/astronauts')
      .then(res => {
        setColumns(res.data.columns);
        setSelectedCols(res.data.columns);
        setAstronauts(res.data.rows);
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
          {selectedCols.includes('Nationality') && <th style={{padding: '10px'}}>Nationality</th>}
          {selectedCols.includes('Date of Birth') && <th style={{padding: '10px'}}>Date of Birth</th>}
          </tr>
        </thead>
        <tbody>
          {astronauts.map((a, i) => (
            <tr key={i}>
              {selectedCols.includes('ID') && <td style={{padding: '8px'}}>{a[0]}</td>}
              {selectedCols.includes('Name') && <td style={{padding: '8px'}}>{a[1]}</td>}
              {selectedCols.includes('Nationality') && <td style={{padding: '8px'}}>{a[2]}</td>}
              {selectedCols.includes('Date of Birth') && <td style={{padding: '8px'}}>{a[3]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total astronauts: {astronauts.length}</p>
    </div>
  );
}

export default AstronautTable;