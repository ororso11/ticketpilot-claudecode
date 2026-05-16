import path from 'path';

export interface RankedFile {
  filePath: string;
  score: number;
  reasons: string[];
}

const COMPONENT_KEYWORDS: Record<string, string[]> = {
  auth: ['auth', 'login', 'session', 'token', 'jwt', 'oauth', 'permission', 'role'],
  payment: ['payment', 'billing', 'invoice', 'checkout', 'stripe', 'order'],
  api: ['api', 'controller', 'route', 'endpoint', 'handler', 'service'],
  db: ['repository', 'dao', 'migration', 'schema', 'entity', 'model'],
  ui: ['component', 'page', 'view', 'template', 'widget', 'modal'],
  test: ['test', 'spec', '__tests__', 'e2e', 'integration'],
};

export function rankFiles(
  filePaths: string[],
  context: { summary: string; description: string; labels?: string[] },
): RankedFile[] {
  const contextText = `${context.summary} ${context.description} ${(context.labels ?? []).join(' ')}`.toLowerCase();

  const ranked: RankedFile[] = filePaths.map((fp) => {
    const normalized = fp.replace(/\\/g, '/').toLowerCase();
    const fileName = path.basename(normalized);
    let score = 0;
    const reasons: string[] = [];

    for (const [area, keywords] of Object.entries(COMPONENT_KEYWORDS)) {
      for (const kw of keywords) {
        if (normalized.includes(kw)) {
          if (contextText.includes(kw)) {
            score += 3;
            reasons.push(`context+path match: ${kw} (${area})`);
          } else {
            score += 1;
            reasons.push(`path match: ${kw} (${area})`);
          }
        }
      }
    }

    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) score += 1;
    if (fileName.endsWith('.test.ts') || fileName.endsWith('.spec.ts')) score -= 1;

    if (normalized.includes('index.')) {
      score += 1;
      reasons.push('index file');
    }

    return { filePath: fp, score, reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

export function topFiles(ranked: RankedFile[], limit = 10): string[] {
  return ranked.slice(0, limit).map((r) => r.filePath);
}
