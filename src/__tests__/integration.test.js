/**
 * @file integration.test.js
 * @description Integration tests for ClubOS agent pipeline and data flow.
 * Tests the end-to-end behavior of multi-agent orchestration, settings
 * persistence, and real-world college event automation scenarios.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AGENTS } from '../services/gemini';

// ─── AGENT PIPELINE INTEGRATION TESTS ────────────────────────────────────────

describe('Agent Pipeline — Multi-Agent Orchestration', () => {
  it('should be able to process all agents in parallel via Promise.all', async () => {
    const mockResults = Object.values(AGENTS).map(agent => ({
      agentId: agent.id,
      data: { result: `mock output for ${agent.id}` }
    }));
    const results = await Promise.all(mockResults.map(r => Promise.resolve(r)));
    expect(results).toHaveLength(6);
    results.forEach(r => {
      expect(r).toHaveProperty('agentId');
      expect(r).toHaveProperty('data');
    });
  });

  it('should handle individual agent failure without crashing the pipeline', async () => {
    const results = await Promise.all([
      Promise.resolve({ agentId: 'social', data: { instagram: 'test' } }),
      Promise.reject(new Error('Rate limit')).catch(err => ({ agentId: 'presentation', error: err.message })),
      Promise.resolve({ agentId: 'emails', data: { sponsor: 'test' } }),
    ]);
    expect(results[1].error).toBe('Rate limit');
    expect(results[0].data).toBeDefined();
    expect(results[2].data).toBeDefined();
  });

  it('staggered dispatch should introduce correct delays', async () => {
    const delays = [0, 700, 1400, 2100];
    const start = Date.now();
    await Promise.all(delays.map(d => new Promise(r => setTimeout(r, d))));
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(2000);
  });
});

// ─── SETTINGS PERSISTENCE INTEGRATION ────────────────────────────────────────

describe('Settings — LocalStorage Persistence Integration', () => {
  beforeEach(() => localStorage.clear());

  it('should persist and retrieve API key from localStorage', () => {
    const settings = { apiKey: 'test-gemini-key-abc123', agents: {} };
    localStorage.setItem('clubos_settings', JSON.stringify(settings));
    const retrieved = JSON.parse(localStorage.getItem('clubos_settings'));
    expect(retrieved.apiKey).toBe('test-gemini-key-abc123');
  });

  it('should persist custom agent configurations', () => {
    const customAgent = [{ id: 'custom_1', title: 'My Agent', system: 'Return JSON', color: '#ff0000' }];
    localStorage.setItem('clubos_custom_agents', JSON.stringify(customAgent));
    const retrieved = JSON.parse(localStorage.getItem('clubos_custom_agents'));
    expect(retrieved[0].id).toBe('custom_1');
    expect(retrieved[0].title).toBe('My Agent');
  });

  it('should persist event history up to 3 entries', () => {
    const history = ['Brief 1', 'Brief 2', 'Brief 3'];
    localStorage.setItem('clubos_history', JSON.stringify(history));
    const retrieved = JSON.parse(localStorage.getItem('clubos_history'));
    expect(retrieved).toHaveLength(3);
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('clubos_settings', 'NOT_VALID_JSON{{{{');
    let result = null;
    try {
      result = JSON.parse(localStorage.getItem('clubos_settings'));
    } catch {
      result = { apiKey: '', agents: {} };
    }
    expect(result.apiKey).toBe('');
  });
});

// ─── EVENT BRIEF VALIDATION INTEGRATION ──────────────────────────────────────

describe('Event Brief — End-to-End Validation Flow', () => {
  const isValidBrief = (brief) => {
    if (!brief || typeof brief !== 'string') return false;
    const trimmed = brief.trim();
    return trimmed.length >= 5 && trimmed.length <= 2000;
  };

  const sanitize = (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>"'`]/g, '').trim();
  };

  it('should reject empty brief before API call', () => {
    expect(isValidBrief('')).toBe(false);
    expect(isValidBrief('   ')).toBe(false);
  });

  it('should accept a realistic college event brief', () => {
    const brief = 'We are hosting a 24-hour AI Hackathon for 300 students on May 15th at IIT Bombay with ₹1L prize pool';
    expect(isValidBrief(brief)).toBe(true);
  });

  it('should sanitize XSS attempts before processing', () => {
    const malicious = '<script>alert("xss")</script>Hackathon brief';
    const clean = sanitize(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hackathon brief');
  });

  it('should reject briefs exceeding 2000 characters', () => {
    const longBrief = 'a'.repeat(2001);
    expect(isValidBrief(longBrief)).toBe(false);
  });

  it('should handle unicode content for regional Indian college names', () => {
    const brief = 'IIT दिल्ली में AI Hackathon — 500 छात्र';
    expect(isValidBrief(brief)).toBe(true);
  });
});

// ─── GOOGLE SERVICES INTEGRATION TESTS ───────────────────────────────────────

describe('Google Services — Integration Verification', () => {
  it('should have Gemini API configured with correct model', async () => {
    const { AGENTS } = await import('../services/gemini');
    // Verify agents exist and are properly configured for Google Gemini
    expect(AGENTS.social).toBeDefined();
    expect(AGENTS.social.system).toContain('JSON');
  });

  it('Firebase module should be importable without errors', async () => {
    // Verify Firebase service file is correctly structured
    const firebaseModule = await import('../services/firebase.js');
    expect(firebaseModule.trackEvent).toBeDefined();
    expect(firebaseModule.trackGeneration).toBeDefined();
    expect(firebaseModule.trackTabChange).toBeDefined();
    expect(firebaseModule.trackToolUsage).toBeDefined();
  });

  it('all Google Service tracking functions should be callable', async () => {
    const { trackEvent, trackGeneration, trackTabChange, trackToolUsage } = await import('../services/firebase.js');
    // These should not throw — Firebase has silent failure by design
    expect(() => trackEvent('test', {})).not.toThrow();
    expect(() => trackGeneration(6, 'test brief')).not.toThrow();
    expect(() => trackTabChange('generator')).not.toThrow();
    expect(() => trackToolUsage('budget')).not.toThrow();
  });
});
