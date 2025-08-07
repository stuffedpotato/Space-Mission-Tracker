import { useState } from 'react';
import AssignmentTable from './AssignmentTable';
import AstronautTable from './AstronautTable';
import CelestialBodyTable from './CelestialBodyTable';
import MissionLogTable from './MissionLogTable';
import MissionTable from './MissionTable';
console.log('AstronautTable:', AstronautTable);
console.log('CelestialBodyTable:', CelestialBodyTable);

function App() {
  const [activeTable, setActiveTable] = useState('missions');

  const tableOptions = [
    { value: 'missions', label: 'Missions', component: <MissionTable /> },
    { value: 'logs', label: 'Mission Logs', component: <MissionLogTable /> },
    { value: 'astronauts', label: 'Astronauts', component: <AstronautTable /> },
    { value: 'assignments', label: 'Assignments', component: <AssignmentTable /> },
    { value: 'celestialBodies', label: 'Celestial Body', component: <CelestialBodyTable /> },
  ];

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const dropdownStyle = {
    fontSize: '16px',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '200px',
    marginBottom: '20px'
  };

  const contentStyle = {
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  };

  const currentTable = tableOptions.find(option => option.value === activeTable);

  return (
    <div style={containerStyle}>
      <h1 style={{textAlign: 'center', color: '#333', marginBottom: '30px'}}>
        Space Mission Dashboard
      </h1>
      
      {/* Dropdown Selection */}
      <div style={{marginBottom: '10px'}}>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>
          Select Table:
        </label>
        <select 
          style={dropdownStyle}
          value={activeTable}
          onChange={(e) => setActiveTable(e.target.value)}
        >
          {tableOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table Content */}
      <div style={contentStyle}>
        {currentTable && currentTable.component}
      </div>
    </div>
  );
}

export default App;