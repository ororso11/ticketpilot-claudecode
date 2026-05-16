import fse from 'fs-extra';
import path from 'path';
const LOGS_DIR = path.join(process.cwd(), '.ticketpilot', 'logs');
const TRACE_FILE = path.join(LOGS_DIR, 'trace.jsonl');
const AUDIT_FILE = path.join(LOGS_DIR, 'audit.log');
export async function appendTrace(event, opts) {
    try {
        await fse.ensureDir(LOGS_DIR);
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            ...opts,
        };
        await fse.appendFile(TRACE_FILE, JSON.stringify(entry) + '\n', 'utf-8');
    }
    catch {
        // Logging errors must never crash the caller
    }
}
export async function appendAudit(message) {
    try {
        await fse.ensureDir(LOGS_DIR);
        const line = `[${new Date().toISOString()}] ${message}\n`;
        await fse.appendFile(AUDIT_FILE, line, 'utf-8');
    }
    catch {
        // Logging errors must never crash the caller
    }
}
export async function readTrace() {
    try {
        if (!(await fse.pathExists(TRACE_FILE)))
            return [];
        const content = await fse.readFile(TRACE_FILE, 'utf-8');
        return content
            .split('\n')
            .filter(Boolean)
            .map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return null;
            }
        })
            .filter((e) => e !== null);
    }
    catch {
        return [];
    }
}
export function formatTimestamp(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString('sv-SE').replace('T', ' ');
    }
    catch {
        return iso;
    }
}
//# sourceMappingURL=logger.js.map