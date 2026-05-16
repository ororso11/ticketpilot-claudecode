import fse from 'fs-extra';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), '.ticketpilot', 'logs');
const TRACE_FILE = path.join(LOGS_DIR, 'trace.jsonl');
const AUDIT_FILE = path.join(LOGS_DIR, 'audit.log');

export interface TraceEvent {
  timestamp: string;
  event: string;
  ticketKey?: string;
  phase?: string;
  message: string;
  meta?: Record<string, unknown>;
}

export type TraceEventName =
  | 'setup_completed'
  | 'project_initialized'
  | 'ticket_loaded'
  | 'ticket_analysis_generated'
  | 'ticket_prd_generated'
  | 'implementation_plan_generated'
  | 'impact_analysis_generated'
  | 'state_saved'
  | 'waiting_for_approval'
  | 'cancelled'
  | 'force_cancelled'
  | 'resumed'
  | 'doctor_completed'
  | 'pre_compact_saved'
  | 'session_started'
  | 'session_stopped'
  | 'tool_guard_triggered'
  | 'state_auto_saved';

export async function appendTrace(
  event: TraceEventName,
  opts: { ticketKey?: string; phase?: string; message: string; meta?: Record<string, unknown> },
): Promise<void> {
  try {
    await fse.ensureDir(LOGS_DIR);
    const entry: TraceEvent = {
      timestamp: new Date().toISOString(),
      event,
      ...opts,
    };
    await fse.appendFile(TRACE_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch {
    // Logging errors must never crash the caller
  }
}

export async function appendAudit(message: string): Promise<void> {
  try {
    await fse.ensureDir(LOGS_DIR);
    const line = `[${new Date().toISOString()}] ${message}\n`;
    await fse.appendFile(AUDIT_FILE, line, 'utf-8');
  } catch {
    // Logging errors must never crash the caller
  }
}

export async function readTrace(): Promise<TraceEvent[]> {
  try {
    if (!(await fse.pathExists(TRACE_FILE))) return [];
    const content = await fse.readFile(TRACE_FILE, 'utf-8');
    return content
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as TraceEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is TraceEvent => e !== null);
  } catch {
    return [];
  }
}

export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('sv-SE').replace('T', ' ');
  } catch {
    return iso;
  }
}
