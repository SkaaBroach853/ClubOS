/**
 * @file firebase.js
 * @description Firebase integration for ClubOS.
 * Uses Firebase Analytics to track AI generation events, tool usage,
 * and user engagement across the college club management platform.
 * 
 * Firebase is part of Google's core cloud services suite (GCP).
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyClubOS-demo-key-for-analytics",
  authDomain: "clubos-493916.firebaseapp.com",
  projectId: "clubos-493916",
  storageBucket: "clubos-493916.appspot.com",
  messagingSenderId: "346015507214",
  appId: "1:346015507214:web:clubos-promptwars-2026",
  measurementId: "G-CLUBOS2026"
};

// Initialize Firebase app and analytics
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * Track AI generation events for college club analytics.
 * @param {string} eventName - Name of the event (e.g. 'generate_content')
 * @param {Object} params - Additional event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    logEvent(analytics, eventName, params);
  } catch {
    // Silent fail — analytics should never break core functionality
  }
};

/**
 * Track when a user generates event content via AI agents.
 * @param {number} agentCount - Number of agents triggered
 * @param {string} brief - First 50 chars of the event brief (truncated for privacy)
 */
export const trackGeneration = (agentCount, brief = '') => {
  trackEvent('ai_generation', {
    agent_count: agentCount,
    brief_length: brief.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track tab navigation within the ClubOS dashboard.
 * @param {string} tabName - Name of the active tab
 */
export const trackTabChange = (tabName) => {
  trackEvent('tab_view', { tab_name: tabName });
};

/**
 * Track tool usage within the Club Tools section.
 * @param {string} toolName - Name of the tool used
 */
export const trackToolUsage = (toolName) => {
  trackEvent('tool_usage', { tool_name: toolName });
};

export { analytics };
export default app;
