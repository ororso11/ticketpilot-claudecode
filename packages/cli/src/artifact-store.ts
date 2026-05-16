import fse from 'fs-extra';
import path from 'path';

const ARTIFACTS_BASE = path.join(process.cwd(), '.ticketpilot', 'artifacts');

export type ArtifactName =
  | 'ticket-analysis'
  | 'implementation-plan'
  | 'impact-analysis'
  | 'test-report'
  | 'review-report'
  | 'jira-comment'
  | 'pr-description';

export function getArtifactPath(ticketKey: string, name: ArtifactName): string {
  return path.join(ARTIFACTS_BASE, ticketKey, `${name}.md`);
}

export async function saveArtifact(
  ticketKey: string,
  name: ArtifactName,
  content: string,
): Promise<string> {
  const artifactPath = getArtifactPath(ticketKey, name);
  const dir = path.dirname(artifactPath);

  await fse.ensureDir(dir);

  const exists = await fse.pathExists(artifactPath);
  if (exists) {
    console.log(`[ticketpilot] Overwriting existing artifact: ${artifactPath}`);
  }

  await fse.writeFile(artifactPath, content, 'utf-8');
  console.log(`[ticketpilot] Artifact saved: ${artifactPath}`);
  return artifactPath;
}

export async function readArtifact(ticketKey: string, name: ArtifactName): Promise<string | null> {
  const artifactPath = getArtifactPath(ticketKey, name);
  if (!(await fse.pathExists(artifactPath))) return null;
  return fse.readFile(artifactPath, 'utf-8');
}

export async function listArtifacts(ticketKey: string): Promise<string[]> {
  const dir = path.join(ARTIFACTS_BASE, ticketKey);
  if (!(await fse.pathExists(dir))) return [];
  const entries = await fse.readdir(dir);
  return entries.filter((f) => f.endsWith('.md'));
}

export async function ensureArtifactDir(ticketKey: string): Promise<string> {
  const dir = path.join(ARTIFACTS_BASE, ticketKey);
  await fse.ensureDir(dir);
  return dir;
}
