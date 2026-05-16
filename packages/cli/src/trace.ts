import pc from 'picocolors';
import { readTrace, formatTimestamp } from './logger.js';
import { readState } from './state-store.js';

export async function runTrace(limit = 50): Promise<void> {
  console.log(pc.bold('\nTicketPilot Trace\n'));

  const [events, state] = await Promise.all([readTrace(), readState()]);

  if (state) {
    console.log(`Current ticket: ${pc.cyan(state.ticketKey)}`);
    console.log(`Phase: ${pc.bold(state.phase)} | Risk: ${state.riskLevel}`);
    console.log('');
  }

  if (events.length === 0) {
    console.log(pc.dim('No trace events recorded yet.'));
    console.log(pc.dim('Events are recorded as you run TicketPilot commands.'));
    console.log('');
    return;
  }

  const recent = events.slice(-limit);

  for (const ev of recent) {
    const ts = pc.dim(`[${formatTimestamp(ev.timestamp)}]`);
    const ticket = ev.ticketKey ? pc.cyan(` ${ev.ticketKey}`) : '';
    const event = pc.bold(ev.event.replace(/_/g, ' '));
    console.log(`${ts}${ticket} ${event}`);
    if (ev.message && ev.message !== ev.event) {
      console.log(`  ${pc.dim(ev.message)}`);
    }
  }

  if (events.length > limit) {
    console.log(pc.dim(`\n  ... ${events.length - limit} earlier event(s) not shown`));
  }
  console.log('');
}
