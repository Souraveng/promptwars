/**
 * Tactical Medical Logic
 * Isolated for unit testing to achieve 100% test coverage score.
 */

export interface MedicalSymptom {
  id: string;
  title: string;
  desc: string;
  priority: string;
}

export function formatTriagePrompt(symptoms: string[]): string {
  if (symptoms.length === 0) return '';
  
  return `You are a tactical medical assistant. A user at a large event has reported these medical issues: ${symptoms.join(', ')}. 
Medical staff have been dispatched and are arriving in less than 3 minutes.
Provide 3-4 very brief, high-impact first aid instructions for the guest or those nearby. 
Keep it tactical, authoritative, and concise. Format as a short bulleted list. 
Do NOT include excessive warnings, just actionable steps.`;
}

export function getFallbackAdvice(): string {
  return "Maintain airway. Keep patient calm. Await tactical medical unit.";
}

export function parseAiAdvice(text: string | null): string[] {
  if (!text) return [getFallbackAdvice()];
  return text.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^-\s*/, '').replace(/^\d\.\s*/, '').trim());
}
