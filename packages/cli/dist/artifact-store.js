import fse from 'fs-extra';
import path from 'path';
const ARTIFACTS_BASE = path.join(process.cwd(), '.ticketpilot', 'artifacts');
export function getArtifactPath(ticketKey, name) {
    return path.join(ARTIFACTS_BASE, ticketKey, `${name}.md`);
}
export async function saveArtifact(ticketKey, name, content) {
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
export async function readArtifact(ticketKey, name) {
    const artifactPath = getArtifactPath(ticketKey, name);
    if (!(await fse.pathExists(artifactPath)))
        return null;
    return fse.readFile(artifactPath, 'utf-8');
}
export async function listArtifacts(ticketKey) {
    const dir = path.join(ARTIFACTS_BASE, ticketKey);
    if (!(await fse.pathExists(dir)))
        return [];
    const entries = await fse.readdir(dir);
    return entries.filter((f) => f.endsWith('.md'));
}
export async function ensureArtifactDir(ticketKey) {
    const dir = path.join(ARTIFACTS_BASE, ticketKey);
    await fse.ensureDir(dir);
    return dir;
}
//# sourceMappingURL=artifact-store.js.map