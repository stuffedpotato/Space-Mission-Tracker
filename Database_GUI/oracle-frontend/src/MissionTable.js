import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MissionTable() {
  const [missions, setMissions] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [queryMode, setQueryMode] = useState('normal');
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
  const [submitting, setSubmitting] = useState(false);

  const emptyFormData = {
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
  };

  const queryOptions = [
    { value: 'normal', label: 'All Missions' },
    { value: 'group-by', label: 'Mission Count by Agency' },
    { value: 'nested', label: 'Mars Missions Only' }
  ];

  const handleShowAddForm = () => {
    setFormData(emptyFormData);
    setEditMode(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleShowEditForm = (row) => {
    setFormData({
      mission_id: row[0],
      mission_name: row[1],
      spacecraft_name: row[2],
      spacecraft_id: '',
      site_id: '',
      body_id: '',
      launch_date: row[7],
    });
    setEditMode(true);
    setEditingId(row[0]);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const loadData = async (mode = 'normal') => {
    setLoading(true);
    try {
      let endpoint = '/missions';
      if (mode === 'group-by') {
        endpoint = '/missions/group-by';
      } else if (mode === 'nested') {
        endpoint = '/missions/nested';
      }
      
      const res = await axios.get(endpoint);
      setColumns(res.data.columns);
      setSelectedCols(res.data.columns);
      setMissions(res.data.rows);
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
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editMode) {
        await axios.put(`/missions/${editingId}`, formData);
      } else {
        await axios.post('/missions', formData);
      }
      
      await loadData(queryMode);
      
      handleCancelForm();
    } catch (err) {
      console.error('Submit error:', err);
    
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError({ error: err.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (missionId) => {
    try {
      await axios.delete(`/missions/${missionId}`);
      await loadData(queryMode.rows);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) 
    return <div>Loading missions...</div>;
  if (error) {
    return (
      <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(error, null, 2)}
      </pre>
    );
  }

  const getTitle = () => {
    const option = queryOptions.find(opt => opt.value === queryMode);
    return `🚀 ${option ? option.label : 'Space Missions'}`;
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
        <button onClick={handleShowAddForm} style={{marginBottom: '10px'}}>
          + Add Mission
        </button>
      )}

      {showForm && isNormalMode && (
        <form onSubmit={handleSubmit}>
          {editMode ? (
            <input
              type="text"
              value={formData.mission_id}
              disabled
              style={{ backgroundColor: '#f0f0f0' }}
            />
          ): 
          (<input
            type="text"
            name="mission_id"
            placeholder="Mission ID"
            value={formData.mission_id}
            onChange={handleInputChange}
            required
          />)}
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
          {editMode ? (
            <input
              type="date"
              value={formData.start_date}
              disabled
              style={{ backgroundColor: '#f0f0f0' }}
            />
          ): 
          (<input
            type="date"
            name="start_date"
            placeholder="Start Date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />)}
          {editMode ? (
            <input
              type="date"
              value={formData.end_date}
              disabled
              style={{ backgroundColor: '#f0f0f0' }}
            />
          ): 
          (<input
            type="date"
            name="end_date"
            placeholder="End Date"
            value={formData.end_date}
            onChange={handleInputChange}
            required
          />)}
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
          <button type="submit" disabled={submitting}>
            {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update' : 'Add')}
          </button>
          <button type="button" onClick={handleCancelForm}>
            Cancel
          </button>
        </form>
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
            {selectedCols.map(col => (
              <th key={col} style={{padding: '10px'}}>{col}</th>
            ))}
            {isNormalMode && <th style={{padding: '10px'}}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {missions.map((row, i) => (
            <tr key={i}>
              {selectedCols.map((col, colIndex) => {
                const columnIndex = columns.indexOf(col);
                return (
                  <td key={colIndex} style={{padding: '8px'}}>
                    {row[columnIndex]}
                  </td>
                );
              })}
              {isNormalMode && (
                <td style={{padding: '8px'}}>
                  <button onClick={() => handleShowEditForm(row)} style={{marginRight: '5px'}}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(row[0])}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total missions: {missions.length}</p>
    </div>
  );
}

export default MissionTable;