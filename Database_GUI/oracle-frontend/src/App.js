import React, { useState } from 'react';
import MissionTable from './MissionTable';
import AstronautTable from './AstronautTable';
import AssignmentTable from './AssignmentTable';
//test

function App() {
  const [activeTab, setActiveTab] = useState('missions');

  const tabStyle = {
    padding: '10px 20px',
    margin: '0 5px',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    borderRadius: '5px 5px 0 0'
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#007acc',
    color: 'white'
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const tabContentStyle = {
    border: '1px solid #ccc',
    padding: '20px',
    marginTop: '-1px',
    borderRadius: '0 5px 5px 5px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{textAlign: 'center', color: '#333', marginBottom: '30px'}}>
        🚀 Space Mission Dashboard
      </h1>
      
      {/* Tab Navigation */}
      <div style={{marginBottom: '0'}}>
        <button 
          style={activeTab === 'missions' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('missions')}
        >
          🚀 Missions
        </button>
        <button 
          style={activeTab === 'astronauts' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('astronauts')}
        >
          👨‍🚀 Astronauts
        </button>
        <button 
          style={activeTab === 'assignments' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('assignments')}
        >
          📋 Assignments
        </button>
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>
        {activeTab === 'missions' && <MissionTable />}
        {activeTab === 'astronauts' && <AstronautTable />}
        {activeTab === 'assignments' && <AssignmentTable />}
      </div>
    </div>
  );
}

export default App;