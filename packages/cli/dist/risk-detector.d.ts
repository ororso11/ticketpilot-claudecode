import type { RiskLevel } from './state-store.js';
export interface RiskDetectionResult {
    level: RiskLevel;
    matchedPaths: string[];
    matchedKeywords: string[];
    reason: string;
}
export declare function isHighRiskPath(filePath: string, highRiskPatterns?: string[]): boolean;
export declare function containsHighRiskKeywords(text: string, keywords?: string[]): string[];
export declare function detectRisk(filePaths: string[], contentKeywords: string[], options?: {
    highRiskPaths?: string[];
    highRiskKeywords?: string[];
}): RiskDetectionResult;
export declare function classifyPath(filePath: string, config?: {
    highRiskPaths?: string[];
}): RiskLevel;
//# sourceMappingURL=risk-detector.d.ts.map