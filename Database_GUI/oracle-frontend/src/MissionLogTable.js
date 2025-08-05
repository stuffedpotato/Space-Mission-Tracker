import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MissionLogTable() {
  const [missionLogs, setMissionLogs] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mission_id: '',
    log_date: '',
    entry_type: '',
    status: '',
    description: ''
  });
  const [inserting, setInserting] = useState(false);

  useEffect(() => {
    axios.get('/mission-logs', {
      params: selectedMissionId ? { mission_id: selectedMissionId } : {}
    })
      .then(res => {
        setMissionLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedMissionId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (missionId, logDate) => {
    try {
      await axios.delete(`/mission-logs/${missionId}/${logDate}`);
      const res = await axios.get('/mission-logs');
      setMissionLogs(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    setInserting(true);
    
    try {
      await axios.post('/mission-logs', formData);
      // Refresh the data
      const res = await axios.get('/mission-logs');
      setMissionLogs(res.data);
      // Reset form
      setFormData({
        mission_id: '',
        log_date: '',
        entry_type: '',
        status: '',
        description: ''
      });
      setShowForm(false);
    } catch (err) {
      console.error('Insert error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setInserting(false);
    }
  };

  if (loading) return <div>Loading mission logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>📝 Mission Logs</h2>
      
      <button onClick={() => setShowForm(!showForm)} style={{marginBottom: '10px'}}>
        {showForm ? 'Cancel' : '+ Add Log'}
      </button>

      {showForm && (
        <form onSubmit={handleInsert} style={{margin: '10px 0', padding: '10px', border: '1px solid #ccc'}}>
          <input
            type="text"
            name="mission_id"
            placeholder="Mission ID"
            value={formData.mission_id}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="log_date"
            value={formData.log_date}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="entry_type"
            placeholder="Entry Type"
            value={formData.entry_type}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="status"
            placeholder="Status"
            value={formData.status}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <button type="submit" disabled={inserting}>
            {inserting ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Filter by Mission ID"
          value={selectedMissionId}
          onChange={(e) => setSelectedMissionId(e.target.value)}
        />
      </div>

      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>Mission ID</th>
            <th style={{padding: '10px'}}>Mission Name</th>
            <th style={{padding: '10px'}}>Log Date</th>
            <th style={{padding: '10px'}}>Entry Type</th>
            <th style={{padding: '10px'}}>Status</th>
            <th style={{padding: '10px'}}>Description</th>
            <th style={{padding: '10px'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {missionLogs.map((row, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{row[0]}</td>
              <td style={{padding: '8px'}}>{row[1]}</td>
              <td style={{padding: '8px'}}>{row[2]}</td>
              <td style={{padding: '8px'}}>{row[3]}</td>
              <td style={{padding: '8px'}}>{row[4]}</td>
              <td style={{padding: '8px'}}>{row[5]}</td>
              <td style={{padding: '8px'}}>
                <button onClick={() => handleDelete(row[0], row[2])}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total log entries: {missionLogs.length}</p>
    </div>
  );
}

export default MissionLogTable;