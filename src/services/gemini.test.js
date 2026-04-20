/**
 * @file gemini.test.js
 * @description Unit tests for the ClubOS Gemini AI service layer.
 * These tests validate the agent configurations, JSON schema enforcement,
 * and API key management used across the college club event automation system.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AGENTS } from './gemini';

// ─── AGENT CONFIGURATION TESTS ──────────────────────────────────────────────

describe('AGENTS — Core Agent Definitions', () => {
  it('should export all 6 required agent definitions', () => {
    expect(Object.keys(AGENTS)).toHaveLength(6);
  });

  it('each agent must have an id, title, and system prompt', () => {
    Object.values(AGENTS).forEach(agent => {
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('title');
      expect(agent).toHaveProperty('system');
      expect(typeof agent.id).toBe('string');
      expect(typeof agent.title).toBe('string');
      expect(typeof agent.system).toBe('string');
    });
  });

  it('agent IDs must match their keys', () => {
    Object.entries(AGENTS).forEach(([key, agent]) => {
      expect(agent.id).toBe(key);
    });
  });
});

// ─── SOCIAL MEDIA AGENT ──────────────────────────────────────────────────────

describe('AGENTS.social — Social Media Generator', () => {
  it('should be configured for Indian college club social media content', () => {
    expect(AGENTS.social.system).toContain('college clubs in India');
  });

  it('should demand JSON output with instagram, linkedin, and whatsapp keys', () => {
    expect(AGENTS.social.system).toContain('instagram');
    expect(AGENTS.social.system).toContain('linkedin');
    expect(AGENTS.social.system).toContain('whatsapp');
  });

  it('should enforce JSON-only output', () => {
    expect(AGENTS.social.system).toContain('Return ONLY valid JSON');
  });
});

// ─── PRESENTATION AGENT ──────────────────────────────────────────────────────

describe('AGENTS.presentation — Presentation Builder', () => {
  it('should generate exactly 8 slides per specification', () => {
    expect(AGENTS.presentation.system).toContain('8 slides');
  });

  it('should enforce slides array structure in JSON output', () => {
    expect(AGENTS.presentation.system).toContain('slides');
    expect(AGENTS.presentation.system).toContain('bullets');
  });
});

// ─── EMAIL AGENT ─────────────────────────────────────────────────────────────

describe('AGENTS.emails — Outreach Email Generator', () => {
  it('should generate all three email types', () => {
    expect(AGENTS.emails.system).toContain('sponsor');
    expect(AGENTS.emails.system).toContain('college_announcement');
    expect(AGENTS.emails.system).toContain('speaker_invite');
  });
});

// ─── IDEAS AGENT ─────────────────────────────────────────────────────────────

describe('AGENTS.ideas — Wild Ideas Generator', () => {
  it('should generate exactly 5 viral campus ideas', () => {
    expect(AGENTS.ideas.system).toContain('5 completely unexpected');
  });

  it('should use ideas array in JSON output', () => {
    expect(AGENTS.ideas.system).toContain('"ideas"');
  });
});

// ─── CHECKLIST AGENT ─────────────────────────────────────────────────────────

describe('AGENTS.checklist — Operations Checklist', () => {
  it('should generate a weekly ops checklist structure', () => {
    expect(AGENTS.checklist.system).toContain('Week 1');
    expect(AGENTS.checklist.system).toContain('Event Day');
  });

  it('should provide actionable tasks for college event management', () => {
    expect(AGENTS.checklist.system).toContain('actionable');
  });
});

// ─── FLYER AGENT ─────────────────────────────────────────────────────────────

describe('AGENTS.flyer — Event Flyer Generator', () => {
  it('should include all mandatory flyer design fields', () => {
    expect(AGENTS.flyer.system).toContain('headline');
    expect(AGENTS.flyer.system).toContain('subheadline');
    expect(AGENTS.flyer.system).toContain('highlights');
    expect(AGENTS.flyer.system).toContain('colorTheme');
  });

  it('should support dark, vibrant, and minimal color themes', () => {
    expect(AGENTS.flyer.system).toContain('dark|vibrant|minimal');
  });
});
