const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

const DB_PATH = path.join(__dirname, 'dumpit.db');

let db = null;

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      // Create files table
      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          original_name TEXT NOT NULL,
          filename TEXT NOT NULL UNIQUE,
          path TEXT NOT NULL,
          size INTEGER NOT NULL,
          mimetype TEXT,
          upload_date TEXT NOT NULL,
          pin TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          console.log('Database initialized');
          resolve();
        }
      });
    });
  });
}

function saveFile(fileData) {
  return new Promise((resolve, reject) => {
    const { originalName, filename, path: filePath, size, mimetype, uploadDate, pin } = fileData;
    
    db.run(
      `INSERT INTO files (original_name, filename, path, size, mimetype, upload_date, pin)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [originalName, filename, filePath, size, mimetype, uploadDate, pin],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            originalName,
            filename,
            size,
            mimetype,
            uploadDate,
            pin
          });
        }
      }
    );
  });
}

function getFilesByPin(pin, sortBy = 'date', order = 'desc') {
  return new Promise((resolve, reject) => {
    let orderBy = 'upload_date';
    
    if (sortBy === 'type') {
      orderBy = 'mimetype';
    } else if (sortBy === 'name') {
      orderBy = 'original_name';
    } else if (sortBy === 'size') {
      orderBy = 'size';
    }
    
    const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    db.all(
      `SELECT id, original_name, filename, size, mimetype, upload_date, pin
       FROM files
       WHERE pin = ?
       ORDER BY ${orderBy} ${orderDirection}`,
      [pin],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Add download URL to each file
          const files = rows.map(row => ({
            id: row.id,
            originalName: row.original_name,
            filename: row.filename,
            size: row.size,
            mimetype: row.mimetype,
            uploadDate: row.upload_date,
            pin: row.pin,
            downloadUrl: `/uploads/${row.filename}`
          }));
          resolve(files);
        }
      }
    );
  });
}

function getAllFiles(pin = null) {
  return new Promise((resolve, reject) => {
    let query = `SELECT id, original_name, filename, size, mimetype, upload_date, pin
                 FROM files`;
    let params = [];
    
    if (pin === null) {
      query += ` WHERE pin IS NULL`;
    } else {
      query += ` WHERE pin = ?`;
      params.push(pin);
    }
    
    query += ` ORDER BY upload_date DESC`;
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const files = rows.map(row => ({
          id: row.id,
          originalName: row.original_name,
          filename: row.filename,
          size: row.size,
          mimetype: row.mimetype,
          uploadDate: row.upload_date,
          pin: row.pin,
          downloadUrl: `/uploads/${row.filename}`
        }));
        resolve(files);
      }
    });
  });
}

function assignPinToFiles(pin, fileIds) {
  return new Promise((resolve, reject) => {
    const placeholders = fileIds.map(() => '?').join(',');
    
    db.run(
      `UPDATE files SET pin = ? WHERE id IN (${placeholders})`,
      [pin, ...fileIds],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Get updated files
          const placeholders2 = fileIds.map(() => '?').join(',');
          db.all(
            `SELECT id, original_name, filename, size, mimetype, upload_date, pin
             FROM files
             WHERE id IN (${placeholders2})`,
            fileIds,
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                const files = rows.map(row => ({
                  id: row.id,
                  originalName: row.original_name,
                  filename: row.filename,
                  size: row.size,
                  mimetype: row.mimetype,
                  uploadDate: row.upload_date,
                  pin: row.pin,
                  downloadUrl: `/uploads/${row.filename}`
                }));
                resolve({ count: this.changes, files });
              }
            }
          );
        }
      }
    );
  });
}

module.exports = {
  initDatabase,
  saveFile,
  getFilesByPin,
  getAllFiles,
  assignPinToFiles
};

