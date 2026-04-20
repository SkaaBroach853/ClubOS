import { describe, it, expect } from 'vitest';
import { AGENTS } from './gemini';

describe('Gemini Service Constants', () => {
  it('should have standard agents defined', () => {
    expect(AGENTS).toHaveProperty('social');
    expect(AGENTS).toHaveProperty('presentation');
    expect(AGENTS).toHaveProperty('emails');
    expect(AGENTS).toHaveProperty('ideas');
    expect(AGENTS).toHaveProperty('checklist');
    expect(AGENTS).toHaveProperty('flyer');
  });

  it('agets should have proper system instructions', () => {
    // Problem Alignment: Checking that the instructions explicitly mention college clubs and hackathons
    expect(AGENTS.social.system).toContain('expert for college clubs');
    expect(AGENTS.ideas.system).toContain('viral campus events');
  });
});
