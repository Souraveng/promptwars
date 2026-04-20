import { describe, it, expect } from 'vitest';
import { formatTriagePrompt, parseAiAdvice, getFallbackAdvice } from './medical-logic';

describe('Medical Triage Logic', () => {
  it('should format a correct prompt for symptoms', () => {
    const symptoms = ['Cardiac', 'Bleeding'];
    const prompt = formatTriagePrompt(symptoms);
    expect(prompt).toContain('Cardiac, Bleeding');
    expect(prompt).toContain('tactical medical assistant');
  });

  it('should return empty string for no symptoms', () => {
    expect(formatTriagePrompt([])).toBe('');
  });

  it('should parse AI advice correctly', () => {
    const aiText = "1. Keep patient calm\n- Apply pressure\n3. Wait for medic";
    const parsed = parseAiAdvice(aiText);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toBe('Keep patient calm');
    expect(parsed[1]).toBe('Apply pressure');
    expect(parsed[2]).toBe('Wait for medic');
  });

  it('should use fallback advice for empty input', () => {
    const advice = parseAiAdvice(null);
    expect(advice[0]).toBe(getFallbackAdvice());
  });
});
