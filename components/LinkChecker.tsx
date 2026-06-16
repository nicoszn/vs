/**
 * components/LinkChecker.tsx
 * Standalone React component that uses the linkChecker library.
 * Provides an input for a URL, runs the check, and displays a detailed report.
 */

import React, { useState } from 'react';
import { crawlLinks, checkLinks, type LinkResult } from '../lib/linkChecker';

const LinkChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LinkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [linksFound, setLinksFound] = useState<number>(0);

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setLinksFound(0);

    try {
      const links = await crawlLinks(url);
      setLinksFound(links.length);
      if (links.length === 0) {
        setError('No links found on the page.');
        setLoading(false);
        return;
      }
      const checked = await checkLinks(links, 10, 8000);
      setResults(checked);
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const aliveCount = results.filter((r) => r.ok).length;
  const deadCount = results.filter((r) => !r.ok).length;
  const totalChecked = results.length;

  return (
    <div className="lc-container">
      <style>
        {`
          .lc-container {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            color: #1e293b;
          }
          .lc-input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }
          .lc-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            min-width: 200px;
          }
          .lc-button {
            padding: 12px 24px;
            background: #0ea5e9;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
          }
          .lc-button:hover:not(:disabled) {
            background: #0284c7;
          }
          .lc-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .lc-error {
            color: #b91c1c;
            background: #fee2e2;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
          }
          .lc-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
          }
          .lc-stat {
            background: #fff;
            padding: 16px;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            text-align: center;
          }
          .lc-stat-value {
            font-size: 28px;
            font-weight: 700;
          }
          .lc-stat-label {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .lc-stat-value.green { color: #16a34a; }
          .lc-stat-value.red { color: #dc2626; }
          .lc-stat-value.blue { color: #2563eb; }

          .lc-table-wrap {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }
          .lc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .lc-table th {
            text-align: left;
            padding: 12px 16px;
            background: #f1f5f9;
            font-weight: 600;
            color: #334155;
          }
          .lc-table td {
            padding: 10px 16px;
            border-bottom: 1px solid #e9edf2;
            word-break: break-all;
          }
          .lc-table tr:last-child td {
            border-bottom: none;
          }
          .lc-status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .lc-status-badge.alive {
            background: #dcfce7;
            color: #166534;
          }
          .lc-status-badge.dead {
            background: #fee2e2;
            color: #991b1b;
          }
          .lc-status-badge.unknown {
            background: #e5e7eb;
            color: #4b5563;
          }
          .lc-loading {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            color: #475569;
          }
          .lc-spinner {
            border: 3px solid #e2e8f0;
            border-top-color: #0ea5e9;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: lc-spin 0.8s linear infinite;
          }
          @keyframes lc-spin {
            to { transform: rotate(360deg); }
          }
          .lc-footer {
            margin-top: 24px;
            font-size: 13px;
            color: #64748b;
            text-align: center;
          }
          .lc-footer a {
            color: #0ea5e9;
            text-decoration: none;
          }
          .lc-footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            .lc-input-group { flex-direction: column; }
            .lc-button { width: 100%; }
          }
        `}
      </style>

      <div className="lc-input-group">
        <input
          type="url"
          className="lc-input"
          placeholder="Enter page URL (e.g. https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button
          className="lc-button"
          onClick={handleCheck}
          disabled={loading || !url}
        >
          {loading ? 'Checking…' : 'Check Links'}
        </button>
      </div>

      {error && <div className="lc-error">⚠️ {error}</div>}

      {loading && (
        <div className="lc-loading">
          <div className="lc-spinner" />
          <span>Crawling and checking links…</span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="lc-stats">
            <div className="lc-stat">
              <div className="lc-stat-value blue">{totalChecked}</div>
              <div className="lc-stat-label">Checked</div>
            </div>
            <div className="lc-stat">
              <div className="lc-stat-value green">{aliveCount}</div>
              <div className="lc-stat-label">✅ Alive</div>
            </div>
            <div className="lc-stat">
              <div className="lc-stat-value red">{deadCount}</div>
              <div className="lc-stat-label">💀 Dead</div>
            </div>
            <div className="lc-stat">
              <div className="lc-stat-value">{linksFound}</div>
              <div className="lc-stat-label">Total links found</div>
            </div>
          </div>

          <div className="lc-table-wrap">
            <table className="lc-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '80px' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const statusText =
                    r.status === 'ERR' ? (r.reason || 'Error') : r.status;
                  const isAlive = r.ok;
                  return (
                    <tr key={r.url}>
                      <td>
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          {r.url}
                        </a>
                      </td>
                      <td>{statusText}</td>
                      <td>
                        <span
                          className={`lc-status-badge ${
                            isAlive ? 'alive' : 'dead'
                          }`}
                        >
                          {isAlive ? '✅ Alive' : '💀 Dead'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {deadCount > 0 && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fff1f0', borderRadius: '8px' }}>
              <strong style={{ color: '#b91c1c' }}>💀 Dead links:</strong>
              <ul style={{ margin: '8px 0 0 20px', color: '#991b1b' }}>
                {results.filter(r => !r.ok).map(r => (
                  <li key={r.url}>
                    <code style={{ fontSize: '13px' }}>{r.url}</code>
                    {' '}
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      ({r.status === 'ERR' ? r.reason : `HTTP ${r.status}`})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="lc-footer">
        Powered by <a href="#">LinkChecker</a> – checks HEAD requests with timeout.
      </div>
    </div>
  );
};

export default LinkChecker;
