export interface TraceEvent {
    timestamp: string;
    event: string;
    ticketKey?: string;
    phase?: string;
    message: string;
    meta?: Record<string, unknown>;
}
export type TraceEventName = 'setup_completed' | 'project_initialized' | 'ticket_loaded' | 'ticket_analysis_generated' | 'ticket_prd_generated' | 'implementation_plan_generated' | 'impact_analysis_generated' | 'state_saved' | 'waiting_for_approval' | 'cancelled' | 'force_cancelled' | 'resumed' | 'doctor_completed' | 'pre_compact_saved' | 'session_started' | 'session_stopped' | 'tool_guard_triggered' | 'state_auto_saved';
export declare function appendTrace(event: TraceEventName, opts: {
    ticketKey?: string;
    phase?: string;
    message: string;
    meta?: Record<string, unknown>;
}): Promise<void>;
export declare function appendAudit(message: string): Promise<void>;
export declare function readTrace(): Promise<TraceEvent[]>;
export declare function formatTimestamp(iso: string): string;
//# sourceMappingURL=logger.d.ts.map