import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AssignmentTable() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/assignments')
      .then(res => {
        setAssignments(res.data);
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
      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>Astronaut</th>
            <th style={{padding: '10px'}}>Mission</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{assignment.astronaut}</td>
              <td style={{padding: '8px'}}>{assignment.mission}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total assignments: {assignments.length}</p>
    </div>
  );
}

export default AssignmentTable;