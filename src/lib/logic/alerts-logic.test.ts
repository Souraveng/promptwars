import { describe, it, expect } from 'vitest';
import { formatBriefingPrompt, getFallbackBriefing, sortAlerts } from './alerts-logic';

describe('Alerts Intelligence Logic', () => {
  it('should format a briefing prompt correctly', () => {
    const alerts = [
      { type: 'MEDICAL', details: 'Patient at Gate 3', timestamp: '2026-04-20T12:00:00Z', priority: 'HIGH' }
    ];
    const prompt = formatBriefingPrompt(alerts as any);
    expect(prompt).toContain('MEDICAL');
    expect(prompt).toContain('tactical advisor');
  });

  it('should return empty string for no alerts', () => {
    expect(formatBriefingPrompt([])).toBe('');
  });

  it('should sort alerts by timestamp descending', () => {
    const alerts = [
      { id: '1', timestamp: '2026-04-20T10:00:00Z', type: 'INFO', details: 'A', priority: 'LOW', status: 'PENDING' },
      { id: '2', timestamp: '2026-04-20T11:00:00Z', type: 'INFO', details: 'B', priority: 'LOW', status: 'PENDING' }
    ];
    const sorted = sortAlerts(alerts as any);
    expect(sorted[0].id).toBe('2');
  });

  it('should provide fallback briefing', () => {
    expect(getFallbackBriefing()).toContain('Operational landscape');
  });
});
