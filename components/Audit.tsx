/**
 * components/Audit.tsx
 * Standalone React component that renders a CodeAudit report.
 */

import React, { useState, useMemo } from 'react';
import type { AuditReport, Finding, Severity, severityColors, categoryIcon } from '@/lib/audit';

export interface AuditProps {
  report: AuditReport;
}

const Audit: React.FC<AuditProps> = ({ report }) => {
  const { summary, findings, fileMetrics, dependencies } = report;

  // ── State ────────────────────────────────────────────────
  const [filter, setFilter] = useState<'all' | Severity | Finding['category']>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleFinding = (id: string) => {
    const newSet = new Set(openIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOpenIds(newSet);
  };

  // ── Filtered findings ────────────────────────────────────
  const filteredFindings = useMemo(() => {
    if (filter === 'all') return findings;
    return findings.filter(
      (f) => f.severity === filter || f.category === filter
    );
  }, [findings, filter]);

  // ── Helpers ──────────────────────────────────────────────
  const gradeColor: Record<string, string> = {
    A: '#00ff87',
    B: '#7fff7f',
    C: '#ffd700',
    D: '#ff8c00',
    F: '#ff3333',
  };
  const gc = gradeColor[summary.grade] || '#fff';

  const sev = summary.bySeverity;
  const totalVulnerableDeps = dependencies.filter((d) => d.risk === 'vulnerable').length;

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="audit-container">
      <style>
        {`
          /* ── Scoped styles ───────────────────────────────────── */
          .audit-container {
            --bg: #0a0b0e;
            --surface: #111318;
            --border: #1e2130;
            --text: #c8cdd8;
            --dim: #5a6070;
            --accent: #00e5ff;
            --mono: 'JetBrains Mono', monospace;
            --sans: 'Syne', sans-serif;
            background: var(--bg);
            color: var(--text);
            font-family: var(--sans);
            min-height: 100vh;
            overflow-x: hidden;
            padding: 0 24px;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }
          .audit-container::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
            z-index: 0;
          }
          .audit-container * { box-sizing: border-box; margin: 0; padding: 0; }
          .audit-container > * { position: relative; z-index: 1; }

          /* ── Header ── */
          .audit-header {
            padding: 60px 0 40px;
            border-bottom: 1px solid var(--border);
            position: relative;
          }
          .audit-eyebrow {
            font-family: var(--mono);
            font-size: 11px;
            letter-spacing: 0.2em;
            color: var(--accent);
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .audit-title {
            font-size: clamp(32px, 5vw, 52px);
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #fff;
          }
          .audit-title span { color: var(--accent); }
          .audit-meta {
            margin-top: 8px;
            font-family: var(--mono);
            font-size: 12px;
            color: var(--dim);
          }

          /* ── Grade circle ── */
          .audit-grade-block {
            position: absolute;
            right: 0;
            top: 50px;
            text-align: center;
          }
          .audit-grade-ring {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid ${gc};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px ${gc}40;
            margin: 0 auto 8px;
          }
          .audit-grade-letter {
            font-size: 42px;
            font-weight: 800;
            color: ${gc};
            line-height: 1;
          }
          .audit-grade-score {
            font-family: var(--mono);
            font-size: 11px;
            color: var(--dim);
          }
          .audit-grade-label {
            font-size: 11px;
            letter-spacing: 0.1em;
            color: var(--dim);
            text-transform: uppercase;
          }

          /* ── Score cards ── */
          .audit-score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            padding: 40px 0;
          }
          .audit-score-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            transition: border-color 0.2s, transform 0.2s;
          }
          .audit-score-card:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
          }
          .audit-card-value {
            font-size: 36px;
            font-weight: 800;
            color: #fff;
            line-height: 1;
          }
          .audit-card-value.red    { color: #ff3333; }
          .audit-card-value.orange { color: #ff7b00; }
          .audit-card-value.yellow { color: #ffd700; }
          .audit-card-value.cyan   { color: var(--accent); }
          .audit-card-label {
            font-size: 12px;
            color: var(--dim);
            margin-top: 6px;
            font-family: var(--mono);
          }

          /* ── Section headers ── */
          .audit-section { padding: 0 0 48px; }
          .audit-section-title {
            font-size: 13px;
            font-family: var(--mono);
            letter-spacing: 0.15em;
            color: var(--accent);
            text-transform: uppercase;
            border-left: 2px solid var(--accent);
            padding-left: 12px;
            margin-bottom: 20px;
          }

          /* ── Filters ── */
          .audit-filter-bar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .audit-filter-btn {
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--mono);
            font-size: 12px;
            transition: all 0.15s;
          }
          .audit-filter-btn:hover,
          .audit-filter-btn.active {
            border-color: var(--accent);
            color: var(--accent);
            background: rgba(0,229,255,0.06);
          }

          /* ── Finding cards ── */
          .audit-finding-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            margin-bottom: 8px;
            overflow: hidden;
            transition: border-color 0.2s;
          }
          .audit-finding-card:hover { border-color: #2a3050; }
          .audit-finding-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 16px;
            cursor: pointer;
            user-select: none;
          }
          .audit-finding-icon   { font-size: 14px; flex-shrink: 0; }
          .audit-finding-id     { font-family: var(--mono); font-size: 11px; color: var(--dim); flex-shrink: 0; width: 58px; }
          .audit-badge {
            font-family: var(--mono);
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            flex-shrink: 0;
          }
          .audit-finding-title { font-size: 14px; font-weight: 700; color: #fff; flex: 1; }
          .audit-finding-loc   { font-family: var(--mono); font-size: 11px; color: var(--dim); flex-shrink: 0; }
          .audit-chevron       { color: var(--dim); font-size: 18px; transition: transform 0.2s; flex-shrink: 0; }
          .audit-finding-card.open .audit-chevron { transform: rotate(90deg); }

          .audit-finding-body {
            display: none;
            padding: 0 16px 16px;
            border-top: 1px solid var(--border);
            padding-top: 16px;
          }
          .audit-finding-card.open .audit-finding-body { display: block; }
          .audit-finding-message { font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
          .audit-code-block {
            background: #0d0e13;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 10px 14px;
            font-family: var(--mono);
            font-size: 12px;
            margin-bottom: 12px;
            display: flex;
            gap: 12px;
            overflow-x: auto;
          }
          .audit-line-num { color: var(--dim); flex-shrink: 0; }
          .audit-code-block code { color: #e2c08d; white-space: pre; }
          .audit-fix-block {
            background: rgba(0,255,135,0.04);
            border: 1px solid rgba(0,255,135,0.15);
            border-radius: 6px;
            padding: 10px 14px;
          }
          .audit-fix-label { font-family: var(--mono); font-size: 11px; color: #00ff87; margin-bottom: 6px; display: block; }
          .audit-fix-block pre { font-family: var(--mono); font-size: 12px; color: #8fffbf; white-space: pre-wrap; line-height: 1.5; }

          /* ── Tables ── */
          .audit-table-wrap {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            overflow: hidden;
          }
          .audit-table-wrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .audit-table-wrap th {
            text-align: left;
            font-family: var(--mono);
            font-size: 11px;
            letter-spacing: 0.1em;
            color: var(--dim);
            text-transform: uppercase;
            padding: 10px 14px;
            border-bottom: 1px solid var(--border);
          }
          .audit-table-wrap td {
            padding: 10px 14px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }
          .audit-table-wrap tr:last-child td { border-bottom: none; }
          .audit-table-wrap tr:hover td { background: rgba(255,255,255,0.02); }
          .audit-dep-name    { font-weight: 700; color: #fff; }
          .audit-dep-version { font-family: var(--mono); font-size: 12px; color: var(--dim); }
          .audit-dep-detail  { font-size: 12px; color: var(--dim); }
          .audit-dep-vulnerable td { background: rgba(255,51,51,0.04); }
          .audit-file-path   { font-family: var(--mono); font-size: 12px; }

          /* ── Footer ── */
          .audit-footer {
            padding: 40px 0;
            border-top: 1px solid var(--border);
            text-align: center;
            font-family: var(--mono);
            font-size: 12px;
            color: var(--dim);
          }
          .audit-footer span { color: var(--accent); }

          /* ── Responsive ── */
          @media (max-width: 640px) {
            .audit-grade-block { display: none; }
            .audit-finding-loc { display: none; }
          }
        `}
      </style>

      {/* ── Header ── */}
      <header className="audit-header">
        <div className="audit-eyebrow">CodeAudit · Static Analysis Report</div>
        <h1 className="audit-title"><span>{report.projectPath.split('/').pop()}</span></h1>
        <p className="audit-meta">
          Generated {report.generatedAt} · {summary.filesScanned} files ·{' '}
          {summary.totalLines.toLocaleString()} lines
        </p>
        <div className="audit-grade-block">
          <div className="audit-grade-ring">
            <div className="audit-grade-letter">{summary.grade}</div>
          </div>
          <div className="audit-grade-score">{summary.score}/100</div>
          <div className="audit-grade-label">Health Score</div>
        </div>
      </header>

      {/* ── Score cards ── */}
      <div className="audit-score-grid">
        <div className="audit-score-card">
          <div className="audit-card-value red">{sev.critical}</div>
          <div className="audit-card-label">Critical Issues</div>
        </div>
        <div className="audit-score-card">
          <div className="audit-card-value orange">{sev.high}</div>
          <div className="audit-card-label">High Severity</div>
        </div>
        <div className="audit-score-card">
          <div className="audit-card-value yellow">{sev.medium}</div>
          <div className="audit-card-label">Medium</div>
        </div>
        <div className="audit-score-card">
          <div className="audit-card-value cyan">{sev.low + sev.info}</div>
          <div className="audit-card-label">Low / Info</div>
        </div>
        <div className="audit-score-card">
          <div className="audit-card-value">{summary.filesScanned}</div>
          <div className="audit-card-label">Files Scanned</div>
        </div>
        <div className="audit-score-card">
          <div
            className="audit-card-value"
            style={{ color: totalVulnerableDeps > 0 ? '#ff3333' : '#00ff87' }}
          >
            {totalVulnerableDeps}
          </div>
          <div className="audit-card-label">Vulnerable Deps</div>
        </div>
      </div>

      {/* ── Findings ── */}
      <section className="audit-section">
        <div className="audit-section-title">// Findings ({findings.length} total)</div>
        <div className="audit-filter-bar">
          <button
            className={`audit-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`audit-filter-btn ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            🔴 Critical
          </button>
          <button
            className={`audit-filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            🟠 High
          </button>
          <button
            className={`audit-filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            🟡 Medium
          </button>
          <button
            className={`audit-filter-btn ${filter === 'security' ? 'active' : ''}`}
            onClick={() => setFilter('security')}
          >
            Security
          </button>
          <button
            className={`audit-filter-btn ${filter === 'performance' ? 'active' : ''}`}
            onClick={() => setFilter('performance')}
          >
            Performance
          </button>
          <button
            className={`audit-filter-btn ${filter === 'quality' ? 'active' : ''}`}
            onClick={() => setFilter('quality')}
          >
            Quality
          </button>
        </div>
        <div>
          {filteredFindings.length === 0 ? (
            <p style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: '13px', padding: '20px 0' }}>
              ✓ No issues match the current filter.
            </p>
          ) : (
            filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id + finding.file + finding.line}
                finding={finding}
                isOpen={openIds.has(finding.id + finding.file + finding.line)}
                onToggle={() => toggleFinding(finding.id + finding.file + finding.line)}
              />
            ))
          )}
        </div>
      </section>

      {/* ── Dependencies ── */}
      <section className="audit-section">
        <div className="audit-section-title">// Dependencies ({dependencies.length} packages)</div>
        <div className="audit-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Version</th>
                <th>Risk</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep) => (
                <tr key={dep.name} className={dep.risk === 'vulnerable' ? 'audit-dep-vulnerable' : ''}>
                  <td className="audit-dep-name">{dep.name}</td>
                  <td className="audit-dep-version">{dep.version}</td>
                  <td style={{ color: dep.risk === 'vulnerable' ? '#ff3333' : '#00ff87' }}>
                    {dep.risk === 'vulnerable' ? '⚠️ vulnerable' : '✓ ok'}
                  </td>
                  <td className="audit-dep-detail">{dep.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── File metrics ── */}
      <section className="audit-section">
        <div className="audit-section-title">// File Complexity</div>
        <div className="audit-table-wrap">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Lines</th>
                <th>Functions</th>
                <th>Complexity</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {[...fileMetrics]
                .sort((a, b) => b.complexity - a.complexity)
                .map((m) => {
                  const complexColor =
                    m.complexity > 30 ? '#ff3333' : m.complexity > 15 ? '#ffd700' : '#00ff87';
                  return (
                    <tr key={m.path}>
                      <td className="audit-file-path">{m.path}</td>
                      <td>{m.lines}</td>
                      <td>{m.functions}</td>
                      <td style={{ color: complexColor, fontWeight: 'bold' }}>{m.complexity}</td>
                      <td>{m.issues}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="audit-footer">
        Generated by <span>CodeAudit</span> · The code health tool that pays for itself.
      </footer>
    </div>
  );
};

// ── Sub-component for a single finding ──
const FindingCard: React.FC<{
  finding: Finding;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ finding, isOpen, onToggle }) => {
  const { id, severity, category, title, file, line, message, snippet, fix } = finding;

  const colorMap: Record<Severity, string> = {
    critical: '#ff3333',
    high: '#ff7b00',
    medium: '#ffd700',
    low: '#7ecfff',
    info: '#aaa',
  };
  const iconMap: Record<Finding['category'], string> = {
    security: '🔴',
    performance: '🟠',
    quality: '🟡',
    dependency: '🔵',
  };

  return (
    <div className={`audit-finding-card ${isOpen ? 'open' : ''}`}>
      <div className="audit-finding-header" onClick={onToggle}>
        <span className="audit-finding-icon">{iconMap[category]}</span>
        <span className="audit-finding-id">{id}</span>
        <span
          className="audit-badge"
          style={{
            background: `${colorMap[severity]}20`,
            color: colorMap[severity],
            border: `1px solid ${colorMap[severity]}40`,
          }}
        >
          {severity}
        </span>
        <span className="audit-finding-title">{title}</span>
        <span className="audit-finding-loc">
          {file}:{line}
        </span>
        <span className="audit-chevron">›</span>
      </div>
      <div className="audit-finding-body">
        <p className="audit-finding-message">{message}</p>
        <div className="audit-code-block">
          <span className="audit-line-num">{line}</span>
          <code>{snippet}</code>
        </div>
        <div className="audit-fix-block">
          <span className="audit-fix-label">💡 FIX</span>
          <pre>{fix}</pre>
        </div>
      </div>
    </div>
  );
};

export default Audit;
