import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MissionTable() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mission_id: '',
    mission_name: '',
    spacecraft_name: '',
    spacecraft_id: '',
    site_id: '',
    body_id: '',
    start_date: '',
    end_date: '',
    launch_date: '',
    agency_id: '',
    role: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [inserting, setInserting] = useState(false);

  const startEdit = (row) => {
    setFormData({
      mission_id: row[0],
      mission_name: row[1],
      spacecraft_name: row[2],
      site_id: '',
      body_id: '',
      spacecraft_id: '',
      start_date: '',
      end_date: '',
      launch_date: row[7],
      agency_id: '',
      role: row[6]
    });
    setEditingId(row[0]);
    setShowForm(true);
  };

  useEffect(() => {
    axios.get('/missions')
      .then(res => {
        setMissions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    setInserting(true);
    try {
      await axios.post('/missions', formData);
      // Refresh the data
      const res = await axios.get('/missions');
      setMissions(res.data);
      // Reset form
      setFormData({
        mission_id: '',
        mission_name: '',
        spacecraft_name: '',
        spacecraft_id: '',
        site_id: '',
        body_id: '',
        start_date: '',
        end_date: '',
        launch_date: '',
        agency_id: '',
        role: ''
      });
      setShowForm(false);
    } catch (err) {
      console.error('Insert error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setInserting(false);
    }
  };

  const handleDelete = async (missionId) => {
    try {
      await axios.delete(`/missions/${missionId}`);
      const res = await axios.get('/missions');
      setMissions(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/missions/${editingId}`, formData);
      const res = await axios.get('/missions');
      setMissions(res.data);
      setFormData({
        mission_id: '',
        mission_name: '',
        spacecraft_name: '',
        spacecraft_id: '',
        site_id: '',
        body_id: '',
        start_date: '',
        end_date: '',
        launch_date: '',
        agency_id: '',
        role: ''
      });
      setEditingId(null);
      setShowForm(false);

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };
  

  if (loading) return <div>Loading missions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>🚀 Space Missions</h2>

      <button onClick={() => setShowForm(!showForm)} style={{marginBottom: '10px'}}>
        {showForm ? 'Cancel' : '+ Add Mission'}
      </button>

      {showForm && (
        <form onSubmit={editingId ? handleUpdate : handleInsert} style={{margin: '10px 0', padding: '10px', border: '1px solid #ccc'}}>
          <input
            type="text"
            name="mission_id"
            placeholder="Mission ID"
            value={formData.mission_id}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="mission_name"
            placeholder="Mission Name"
            value={formData.mission_name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="site_id"
            placeholder="Launch Site ID"
            value={formData.site_id}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="body_id"
            placeholder="Celestial Body ID"
            value={formData.body_id}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="spacecraft_id"
            placeholder="Spacecraft ID"
            value={formData.spacecraft_id}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="spacecraft_name"
            placeholder="Spacecraft Name"
            value={formData.spacecraft_name}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="start_date"
            placeholder="Start Date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="end_date"
            placeholder="End Date"
            value={formData.end_date}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="launch_date"
            placeholder="Launch Date"
            value={formData.launch_date}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="agency_id"
            placeholder="Agency ID (Optional)"
            value={formData.agency_id}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="role"
            placeholder="Agency's Role (Optional)"
            value={formData.role}
            onChange={handleInputChange}
          />
          <button type="submit" disabled={inserting}>
            {inserting ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr style={{backgroundColor: '#f0f0f0'}}>
            <th style={{padding: '10px'}}>Mission ID</th>
            <th style={{padding: '10px'}}>Mission Name</th>
            <th style={{padding: '10px'}}>Spacecraft</th>
            <th style={{padding: '10px'}}>Launch Site</th>
            <th style={{padding: '10px'}}>Destination</th>
            <th style={{padding: '10px'}}>Agency Name</th>
            <th style={{padding: '10px'}}>Agency's Role</th>
            <th style={{padding: '10px'}}>Launch Date</th>
            <th style={{padding: '10px'}}>Delete Action</th>
            <th style={{padding: '10px'}}>Edit Action</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((row, i) => (
            <tr key={i}>
              <td style={{padding: '8px'}}>{row[0]}</td>
              <td style={{padding: '8px'}}>{row[1]}</td>
              <td style={{padding: '8px'}}>{row[2]}</td>
              <td style={{padding: '8px'}}>{row[3]}</td>
              <td style={{padding: '8px'}}>{row[4]}</td>
              <td style={{padding: '8px'}}>{row[5]}</td>
              <td style={{padding: '8px'}}>{row[6]}</td>
              <td style={{padding: '8px'}}>{row[7]}</td>
              <td style={{padding: '8px'}}>
                <button onClick={() => handleDelete(row[0])}>
                  Delete
                </button>
              </td>
              <td style={{padding: '8px'}}>
                <button onClick={() => startEdit(row)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total missions: {missions.length}</p>
    </div>
  );
}

export default MissionTable;