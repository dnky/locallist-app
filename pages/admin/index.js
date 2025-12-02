// pages/admin/index.js

import { useState } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  
  const handleSync = async (action) => {
    // Basic Client-side security (Not foolproof, but stops casual access)
    // In production, you would wrap this page in NextAuth or similar.
    const secret = prompt("Enter Admin Secret:");
    if (!secret) return;

    setLoading(true);
    addToLog(`Starting ${action.toUpperCase()}...`);

    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': secret // Send secret in header
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      addToLog(`SUCCESS: ${data.message}`);

    } catch (error) {
      console.error(error);
      addToLog(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addToLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Head>
        <title>LocalList Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1>Directory Admin Sync</h1>
      <p>Manage synchronization between the Database and Google Sheets.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '30px 0' }}>
        
        {/* PUSH CARD */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Push to Sheet</h2>
          <p><strong>DB &rarr; Google Sheet</strong></p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Overwrites the entire Google Sheet with the current data from the database.
            <br /><br />
            <em>Warning: Any manual changes in the sheet not previously pulled will be lost.</em>
          </p>
          <button 
            onClick={() => handleSync('push')}
            disabled={loading}
            style={{ 
              backgroundColor: '#d32323', color: 'white', padding: '10px 20px', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            {loading ? 'Processing...' : 'Push Data'}
          </button>
        </div>

        {/* PULL CARD */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Pull from Sheet</h2>
          <p><strong>Google Sheet &rarr; DB</strong></p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Reads the sheet and updates the database.
            <br />
            - If <code>ID</code> exists: Updates the ad.
            <br />
            - If <code>ID</code> is empty: Creates a new ad.
          </p>
          <button 
            onClick={() => handleSync('pull')}
            disabled={loading}
            style={{ 
              backgroundColor: '#2d2e2f', color: 'white', padding: '10px 20px', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            {loading ? 'Processing...' : 'Pull Data'}
          </button>
        </div>

      </div>

      <h3>Activity Log</h3>
      <div style={{ 
        backgroundColor: '#111', color: '#0f0', padding: '15px', 
        borderRadius: '5px', height: '200px', overflowY: 'auto', fontFamily: 'monospace' 
      }}>
        {log.length === 0 && <span style={{ opacity: 0.5 }}>Waiting for actions...</span>}
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}