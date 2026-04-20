import { describe, it, expect } from 'vitest';
import { formatBriefingPrompt, sortAlerts, RawAlert } from '@/lib/logic/alerts-logic';

describe('Alerts Intelligence Logic', () => {
  const mockAlerts: RawAlert[] = [
    {
      id: '1',
      type: 'SECURITY',
      details: 'Unauthorized access detected at North Gate',
      timestamp: '2026-04-20T10:00:00Z',
      priority: 'HIGH',
      status: 'ACTIVE'
    },
    {
      id: '2',
      type: 'MEDICAL',
      details: 'Heat exhaustion reported in Sector 4',
      timestamp: '2026-04-20T11:00:00Z',
      priority: 'MEDIUM',
      status: 'ACTIVE'
    },
    {
      id: '3',
      type: 'SYSTEM',
      details: 'Power fluctuation in VIP Lounge',
      timestamp: '2026-04-20T09:00:00Z',
      priority: 'LOW',
      status: 'RESOLVED'
    }
  ];

  describe('formatBriefingPrompt', () => {
    it('returns empty string if no alerts provided', () => {
      expect(formatBriefingPrompt([])).toBe('');
    });

    it('contains tactical instructions and alert details', () => {
      const prompt = formatBriefingPrompt(mockAlerts);
      expect(prompt).toContain('You are a tactical advisor');
      expect(prompt).toContain('[SECURITY] Unauthorized access detected at North Gate');
      expect(prompt).toContain('[MEDICAL] Heat exhaustion reported in Sector 4');
    });

    it('limits to top 3 alerts', () => {
      const largeAlerts = [...mockAlerts, { ...mockAlerts[0], id: '4' }, { ...mockAlerts[0], id: '5' }];
      const prompt = formatBriefingPrompt(largeAlerts);
      const lines = prompt.split('\n');
      // The prompt includes instructions, so we count lines containing brackets
      const alertLines = lines.filter(l => l.startsWith('['));
      expect(alertLines.length).toBeLessThanOrEqual(3);
    });
  });

  describe('sortAlerts', () => {
    it('sorts alerts by timestamp descending (newest first)', () => {
      const sorted = sortAlerts(mockAlerts);
      expect(sorted[0].id).toBe('2'); // 11:00
      expect(sorted[1].id).toBe('1'); // 10:00
      expect(sorted[2].id).toBe('3'); // 09:00
    });
  });
});
