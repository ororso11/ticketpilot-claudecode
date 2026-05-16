import { minimatch } from 'minimatch';
import type { RiskLevel } from './state-store.js';

const DEFAULT_HIGH_RISK_PATHS = [
  '.env',
  '*.pem',
  '*.key',
  'application-prod.yml',
  'application-prod.properties',
  'src/**/security/**',
  'src/**/auth/**',
  'src/**/payment/**',
  'db/migration/**',
  'migrations/**',
];

const DEFAULT_HIGH_RISK_KEYWORDS = [
  'password',
  'secret',
  'token',
  'privateKey',
  'payment',
  'auth',
  'permission',
  'personalInfo',
  'privacy',
];

export interface RiskDetectionResult {
  level: RiskLevel;
  matchedPaths: string[];
  matchedKeywords: string[];
  reason: string;
}

export function isHighRiskPath(
  filePath: string,
  highRiskPatterns: string[] = DEFAULT_HIGH_RISK_PATHS,
): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return highRiskPatterns.some((pattern) =>
    minimatch(normalized, pattern, { matchBase: true, dot: true }),
  );
}

export function containsHighRiskKeywords(
  text: string,
  keywords: string[] = DEFAULT_HIGH_RISK_KEYWORDS,
): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

export function detectRisk(
  filePaths: string[],
  contentKeywords: string[],
  options: {
    highRiskPaths?: string[];
    highRiskKeywords?: string[];
  } = {},
): RiskDetectionResult {
  const patterns = options.highRiskPaths ?? DEFAULT_HIGH_RISK_PATHS;
  const keywords = options.highRiskKeywords ?? DEFAULT_HIGH_RISK_KEYWORDS;

  const matchedPaths = filePaths.filter((p) => isHighRiskPath(p, patterns));
  const matchedKeywords = contentKeywords.filter((kw) =>
    keywords.some((hk) => kw.toLowerCase().includes(hk.toLowerCase())),
  );

  if (matchedPaths.length > 0) {
    return {
      level: 'high',
      matchedPaths,
      matchedKeywords,
      reason: `High-risk paths detected: ${matchedPaths.join(', ')}`,
    };
  }

  if (matchedKeywords.length > 0) {
    return {
      level: 'high',
      matchedPaths,
      matchedKeywords,
      reason: `High-risk keywords detected: ${matchedKeywords.join(', ')}`,
    };
  }

  if (filePaths.length > 10) {
    return {
      level: 'medium',
      matchedPaths: [],
      matchedKeywords: [],
      reason: 'Large number of files affected',
    };
  }

  return {
    level: 'low',
    matchedPaths: [],
    matchedKeywords: [],
    reason: 'No high-risk indicators detected',
  };
}

export function classifyPath(filePath: string, config?: { highRiskPaths?: string[] }): RiskLevel {
  if (isHighRiskPath(filePath, config?.highRiskPaths)) return 'high';
  return 'low';
}
