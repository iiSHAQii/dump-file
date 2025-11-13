import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [pin, setPin] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [anonymousFiles, setAnonymousFiles] = useState([]);
  const [assignPinValue, setAssignPinValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Check if PIN is stored in localStorage
    const storedPin = localStorage.getItem('dumpit_pin');
    if (storedPin) {
      setPin(storedPin);
      loadFiles(storedPin);
    }
  }, []);

  useEffect(() => {
    if (pin) {
      loadFiles(pin);
    } else {
      setFiles([]);
    }
  }, [pin, sortBy, sortOrder]);

  const loadFiles = async (pinCode) => {
    try {
      const response = await axios.get(`${API_URL}/files/${pinCode}`, {
        params: { sortBy, order: sortOrder }
      });
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setMessage({ text: 'Failed to load files', type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const fileList = Array.from(e.target.files);
    setSelectedFiles(fileList);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setMessage({ text: 'Please select files to upload', type: 'error' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    if (pin) {
      formData.append('pin', pin);
    }

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage({ text: response.data.message, type: 'success' });
      setSelectedFiles([]);
      document.getElementById('file-input').value = '';
      
      if (pin) {
        loadFiles(pin);
      } else {
        loadAnonymousFiles();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ text: 'Failed to upload files', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin) {
      localStorage.setItem('dumpit_pin', pin);
      loadFiles(pin);
    }
  };

  const loadAnonymousFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/anonymous-files`);
      setAnonymousFiles(response.data.files || []);
      setShowAnonymous(true);
    } catch (error) {
      console.error('Error loading anonymous files:', error);
    }
  };

  const handleAssignPin = async () => {
    if (!assignPinValue) {
      setMessage({ text: 'Please enter a PIN', type: 'error' });
      return;
    }

    const selectedIds = anonymousFiles
      .filter(f => f.selected)
      .map(f => f.id);

    if (selectedIds.length === 0) {
      setMessage({ text: 'Please select files to assign PIN', type: 'error' });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/assign-pin`, {
        pin: assignPinValue,
        fileIds: selectedIds
      });
      
      setMessage({ text: response.data.message, type: 'success' });
      setShowAnonymous(false);
      setAnonymousFiles([]);
      setAssignPinValue('');
      
      if (assignPinValue === pin) {
        loadFiles(pin);
      }
    } catch (error) {
      console.error('Assign PIN error:', error);
      setMessage({ text: 'Failed to assign PIN', type: 'error' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileType = (mimetype) => {
    if (!mimetype) return 'Unknown';
    const parts = mimetype.split('/');
    return parts[parts.length - 1].toUpperCase();
  };

  const handleDownload = (file) => {
    window.open(`${API_URL.replace('/api', '')}${file.downloadUrl}`, '_blank');
  };

  const toggleAnonymousFileSelection = (fileId) => {
    setAnonymousFiles(files =>
      files.map(f => f.id === fileId ? { ...f, selected: !f.selected } : f)
    );
  };

  return (
    <div className="App">
      <div className="container">
        <header>
          <h1>🗑️ Dump It</h1>
          <p className="subtitle">Simple file dumping service</p>
        </header>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ text: '', type: '' })}>×</button>
          </div>
        )}

        <div className="pin-section">
          <form onSubmit={handlePinSubmit} className="pin-form">
            <input
              type="text"
              placeholder="Enter your PIN code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="pin-input"
            />
            <button type="submit" className="btn btn-primary">Load Files</button>
          </form>
          {pin && (
            <button onClick={loadAnonymousFiles} className="btn btn-secondary">
              Show Anonymous Files
            </button>
          )}
        </div>

        <div className="upload-section">
          <h2>Upload Files</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : 'Choose files or drag and drop'}
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-preview">
                    📄 {file.name} ({formatFileSize(file.size)})
                  </div>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="btn btn-upload"
            >
              {uploading ? 'Uploading...' : 'Dump Files'}
            </button>
          </form>
        </div>

        {showAnonymous && anonymousFiles.length > 0 && (
          <div className="anonymous-section">
            <h2>Anonymous Files - Assign PIN</h2>
            <div className="assign-pin-form">
              <input
                type="text"
                placeholder="Enter PIN to assign"
                value={assignPinValue}
                onChange={(e) => setAssignPinValue(e.target.value)}
                className="pin-input"
              />
              <button onClick={handleAssignPin} className="btn btn-primary">
                Assign PIN to Selected
              </button>
            </div>
            <div className="files-list">
              {anonymousFiles.map(file => (
                <div
                  key={file.id}
                  className={`file-item ${file.selected ? 'selected' : ''}`}
                  onClick={() => toggleAnonymousFileSelection(file.id)}
                >
                  <input
                    type="checkbox"
                    checked={file.selected || false}
                    onChange={() => toggleAnonymousFileSelection(file.id)}
                  />
                  <div className="file-info">
                    <div className="file-name">{file.originalName}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {getFileType(file.mimetype)} • {formatDate(file.uploadDate)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="btn btn-small"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="files-section">
            <div className="files-header">
              <h2>Your Files ({files.length})</h2>
              <div className="sort-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date">Sort by Date</option>
                  <option value="type">Sort by Type</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-small"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            <div className="files-list">
              {files.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-name">{file.originalName}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {getFileType(file.mimetype)} • {formatDate(file.uploadDate)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="btn btn-small"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && pin && !showAnonymous && (
          <div className="empty-state">
            <p>No files found for this PIN. Upload some files to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

