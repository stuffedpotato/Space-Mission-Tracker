import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AssignmentTable() {
  const [assignments, setAssignments] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queryMode, setQueryMode] = useState('normal');
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState('');

  const queryOptions = [
    { value: 'normal', label: 'All Assignments' },
    { value: 'aggregation-having', label: 'Astronauts with 3+ Assignments' }
  ];

  const loadData = async (mode = 'normal') => {
    setLoading(true);
    try {
      let endpoint = '/assignments';
      if (mode === 'aggregation-having') {
        endpoint = '/assignments/aggregation-having';
      }
      
      const res = await axios.get(endpoint);
      setColumns(res.data.columns);
      setSelectedCols(res.data.columns);
      setAssignments(res.data.rows);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(queryMode);
  }, [queryMode]);

  useEffect(() => {
    axios.get('/agencies')
      .then(res => 
        setAgencies(res.data.rows)
      )
      .catch(err => 
        console.error('Error fetching agencies:', err)
      );
  }, []);

  const filterByAgency = async () => {
    if (!selectedAgency) return;
    
    try {
      const response = await axios.get(`/assignments/by-agency/${selectedAgency}`);

      setAssignments(response.data.rows);
      setColumns(['Astronaut', 'Mission']);
      setSelectedCols(['Astronaut', 'Mission']);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  const getTitle = () => {
    const option = queryOptions.find(opt => opt.value === queryMode);
    return `📋 ${option ? option.label : 'Mission Assignments'}`;
  };

  const isNormalMode = queryMode === 'normal';

  return (
    <div>
      <h2>{getTitle()}</h2>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
          View Mode:
        </label>
        <select 
          value={queryMode} 
          onChange={(e) => setQueryMode(e.target.value)}
          style={{ marginBottom: '10px' }}
        >
          {queryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isNormalMode && (
        <div style={{ marginBottom: '15px' }}>
          <select
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
          >
            <option value="">Select Agency ID</option>
            {agencies.map(agency => (
              <option key={agency[0]} value={agency[0]}>
                {agency[0]} - {agency[1]}
              </option>
            ))}
          </select>
          <button onClick={filterByAgency} style={{ marginLeft: '10px' }}>
            Filter by Agency
          </button>
        </div>
      )}

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
          {selectedCols.includes('Astronaut Name') && <th style={{padding: '10px'}}>Astronaut Name</th>}
          {selectedCols.includes('Total Assignments') && <th style={{padding: '10px'}}>Total Assignments</th>}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, i) => (
            <tr key={i}>
              {selectedCols.includes('Astronaut') && <td style={{padding: '8px'}}>{assignment[0]}</td>}
              {selectedCols.includes('Mission') && <td style={{padding: '8px'}}>{assignment[1]}</td>}
              {selectedCols.includes('Astronaut Name') && <td style={{padding: '8px'}}>{assignment[0]}</td>}
              {selectedCols.includes('Total Assignments') && <td style={{padding: '8px'}}>{assignment[1]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total assignments: {assignments.length}</p>
    </div>
  );
}

export default AssignmentTable;