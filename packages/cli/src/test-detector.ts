import fse from 'fs-extra';
import path from 'path';

export interface TestFrameworkInfo {
  name: string;
  command: string;
  configFile: string;
}

const KNOWN_FRAMEWORKS: TestFrameworkInfo[] = [
  { name: 'vitest', command: 'npx vitest run', configFile: 'vitest.config.ts' },
  { name: 'jest', command: 'npx jest', configFile: 'jest.config.ts' },
  { name: 'jest-js', command: 'npx jest', configFile: 'jest.config.js' },
  { name: 'mocha', command: 'npx mocha', configFile: '.mocharc.yml' },
  { name: 'pytest', command: 'pytest', configFile: 'pytest.ini' },
  { name: 'gradle', command: './gradlew test', configFile: 'build.gradle' },
  { name: 'maven', command: 'mvn test', configFile: 'pom.xml' },
];

export async function detectTestCommand(projectRoot: string): Promise<string | null> {
  for (const fw of KNOWN_FRAMEWORKS) {
    const configPath = path.join(projectRoot, fw.configFile);
    if (await fse.pathExists(configPath)) {
      return fw.command;
    }
  }

  const pkgPath = path.join(projectRoot, 'package.json');
  if (await fse.pathExists(pkgPath)) {
    try {
      const pkg = await fse.readJson(pkgPath);
      if (pkg.scripts?.test && typeof pkg.scripts.test === 'string') {
        if (!pkg.scripts.test.includes('no test specified')) {
          return 'npm test';
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function detectTestFiles(filePaths: string[]): string[] {
  return filePaths.filter((fp) => {
    const normalized = fp.replace(/\\/g, '/');
    return (
      normalized.includes('.test.') ||
      normalized.includes('.spec.') ||
      normalized.includes('/__tests__/') ||
      normalized.includes('/test/') ||
      normalized.includes('/tests/')
    );
  });
}

export function sourceToTestFile(sourceFile: string): string[] {
  const ext = path.extname(sourceFile);
  const base = sourceFile.slice(0, -ext.length);
  return [`${base}.test${ext}`, `${base}.spec${ext}`];
}
