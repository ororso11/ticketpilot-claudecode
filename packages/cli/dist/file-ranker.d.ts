export interface RankedFile {
    filePath: string;
    score: number;
    reasons: string[];
}
export declare function rankFiles(filePaths: string[], context: {
    summary: string;
    description: string;
    labels?: string[];
}): RankedFile[];
export declare function topFiles(ranked: RankedFile[], limit?: number): string[];
//# sourceMappingURL=file-ranker.d.ts.map