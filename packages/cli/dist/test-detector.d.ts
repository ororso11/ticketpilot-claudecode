export interface TestFrameworkInfo {
    name: string;
    command: string;
    configFile: string;
}
export declare function detectTestCommand(projectRoot: string): Promise<string | null>;
export declare function detectTestFiles(filePaths: string[]): string[];
export declare function sourceToTestFile(sourceFile: string): string[];
//# sourceMappingURL=test-detector.d.ts.map