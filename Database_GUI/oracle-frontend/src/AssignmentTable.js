import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AssignmentTable() {
  const [assignments, setAssignments] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/assignments')
      .then(res => {
        setColumns(res.data.columns);
        setSelectedCols(res.data.columns);
        setAssignments(res.data.rows);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>📋 Mission Assignments</h2>

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
          {selectedCols.includes('Astronaut') && <th style={{padding: '10px'}}>Astronaut</th>}
          {selectedCols.includes('Mission') && <th style={{padding: '10px'}}>Mission</th>}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, i) => (
            <tr key={i}>
              {selectedCols.includes('Astronaut') && <td style={{padding: '8px'}}>{assignment[0]}</td>}
              {selectedCols.includes('Mission') && <td style={{padding: '8px'}}>{assignment[1]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total assignments: {assignments.length}</p>
    </div>
  );
}

export default AssignmentTable;