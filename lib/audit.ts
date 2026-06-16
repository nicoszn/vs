/**
 * lib/audit.ts
 * Core types and utilities for CodeAudit reports.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  severity: Severity;
  category: 'security' | 'performance' | 'quality' | 'dependency';
  title: string;
  message: string;
  file: string;
  line: number;
  snippet: string;
  fix: string;
}

export interface FileMetrics {
  path: string;
  lines: number;
  functions: number;
  complexity: number;
  issues: number;
}

export interface DependencyRisk {
  name: string;
  version: string;
  risk: 'vulnerable' | 'outdated' | 'ok';
  detail: string;
}

export interface AuditReport {
  projectPath: string;
  generatedAt: string;
  summary: {
    filesScanned: number;
    totalLines: number;
    totalFindings: number;
    bySeverity: Record<Severity, number>;
    score: number;
    grade: string;
  };
  findings: Finding[];
  fileMetrics: FileMetrics[];
  dependencies: DependencyRisk[];
}

/** Convert a numeric score (0–100) to a letter grade. */
export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/** Calculate a health score based on findings and vulnerable dependencies. */
export function calculateScore(findings: Finding[], dependencies: DependencyRisk[]): number {
  const weights: Record<Severity, number> = {
    critical: 25,
    high: 10,
    medium: 4,
    low: 1,
    info: 0,
  };
  let deductions = 0;
  for (const f of findings) deductions += weights[f.severity];
  for (const d of dependencies) if (d.risk === 'vulnerable') deductions += 15;
  return Math.max(0, 100 - deductions);
}

/** Severity ordering for sorting and thresholds. */
export const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

/** Colour mapping for severity badges. */
export const severityColors: Record<Severity, string> = {
  critical: '#ff3333',
  high: '#ff7b00',
  medium: '#ffd700',
  low: '#7ecfff',
  info: '#aaa',
};

/** Category icon mapping. */
export const categoryIcon: Record<Finding['category'], string> = {
  security: '🔴',
  performance: '🟠',
  quality: '🟡',
  dependency: '🔵',
};
