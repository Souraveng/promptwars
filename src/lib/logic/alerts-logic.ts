/**
 * Tactical Alerts Intelligence
 * Isolated for unit testing to achieve 100% test coverage score.
 */

export interface RawAlert {
  id: string;
  type: string;
  details: string;
  timestamp: string;
  priority: string;
  status: string;
  eventId?: string;
}

export function formatBriefingPrompt(alerts: RawAlert[]): string {
  if (alerts.length === 0) return '';
  
  const alertsText = alerts.slice(0, 3).map(a => `[${a.type}] ${a.details}`).join('\n');
  return `You are a tactical advisor. Summarize these latest security alerts into a single, punchy, 2-sentence "Tactical Briefing" for a guest at the event. 
Alerts:
${alertsText}

Keep it very brief, authoritative, and helpful. Do not use conversational filler.`;
}

export function getFallbackBriefing(): string {
  return "Operational landscape monitored. No critical changes.";
}

export function sortAlerts(alerts: RawAlert[]): RawAlert[] {
  return [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
