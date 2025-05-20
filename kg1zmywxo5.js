// agent-lee-memory-core.js

/**
 * Fully Expanded Contextual Memory + User Awareness Engine
 * Combines the complete depth of:
 * - agent-lee-memory.js (memory logic, scoring, consolidation)
 * - agent-lee-context.js (profile, history, preferences, personalization)
 */

import * as AgentManager from './agent-manager.js';
import { handleMessage } from './transcript-store.js';

export const ContextType = {
  USER_PROFILE: 'user_profile',
  CONVERSATION_HISTORY: 'conversation_history',
  PAGE_CONTEXT: 'page_context',
  PREFERENCES: 'preferences',
  SYSTEM: 'system'
};

export const AgentLeeMemoryCore = {
  config: {
    shortTermLimit: 100,
    longTermLimit: 1000,
    promoteThreshold: 0.7,
    decayRate: 0.01,
    consolidationInterval: 3600000,
    transcriptLimit: 100
  },

  store: {
    memory: { shortTerm: [], longTerm: [] },
    userProfiles: {},
    conversationHistory: {},
    pageContexts: {},
    preferences: {},
    systemContext: {}
  },

  async init(userId) {
    this.userId = userId;
    this.sessionId = AgentManager.getSessionId();
    this._initUserContext(userId);
    await this.loadMemories();
    this._startConsolidationLoop();
  },

  _initUserContext(userId) {
    const now = Date.now();
    if (!this.store.userProfiles[userId]) {
      this.store.userProfiles[userId] = {
        id: userId,
        name: null,
        email: null,
        phone: null,
        interests: [],
        firstSeen: now,
        lastSeen: now,
        visitCount: 1
      };
    } else {
      this.store.userProfiles[userId].lastSeen = now;
      this.store.userProfiles[userId].visitCount++;
    }

    this.store.preferences[userId] ||= {
      voice: 'default', speechRate: 1, theme: 'default', notifications: true
    };

    this.store.conversationHistory[userId] ||= [];
  },

  async loadMemories() {
    if (!window.AgentLeeTraining?.db) return;
    const db = window.AgentLeeTraining.db;
    const tx = db.transaction(['memories'], 'readonly');
    const store = tx.objectStore('memories');
    const index = store.index('relevance');

    const shortReq = index.getAll(IDBKeyRange.upperBound(this.config.promoteThreshold));
    const longReq = index.getAll(IDBKeyRange.lowerBound(this.config.promoteThreshold));

    return new Promise((resolve, reject) => {
      shortReq.onsuccess = e => this.store.memory.shortTerm = e.target.result;
      longReq.onsuccess = e => this.store.memory.longTerm = e.target.result;
      tx.oncomplete = () => resolve();
      tx.onerror = e => reject(e);
    });
  },

  _startConsolidationLoop() {
    setInterval(() => this._consolidate(), this.config.consolidationInterval);
  },

  _consolidate() {
    this._updateRelevance();
    this._promote();
    this._prune('shortTerm', this.config.shortTermLimit);
    this._prune('longTerm', this.config.longTermLimit);
    this._persist();
  },

  _updateRelevance() {
    const now = Date.now();
    for (const m of [...this.store.memory.shortTerm, ...this.store.memory.longTerm]) {
      const age = (now - m.timestamp) / 86400000;
      const decay = Math.exp(-this.config.decayRate * age);
      const access = Math.log((m.accessCount || 1) + 1) / Math.log(10);
      const success = m.wasSuccessful ? 1.2 : 0.8;
      m.relevance = Math.min(0.99, (m.relevance || 0.5) * 0.6 + decay * 0.2 + access * 0.1 + success * 0.1);
    }
  },

  _promote() {
    const promote = this.store.memory.shortTerm.filter(m => m.relevance >= this.config.promoteThreshold);
    this.store.memory.longTerm.push(...promote);
    this.store.memory.shortTerm = this.store.memory.shortTerm.filter(m => m.relevance < this.config.promoteThreshold);
  },

  _prune(type, max) {
    this.store.memory[type] = this.store.memory[type].sort((a,b) => b.relevance - a.relevance).slice(0, max);
  },

  _persist() {
    if (!window.AgentLeeTraining?.db) return;
    const db = window.AgentLeeTraining.db;
    const tx = db.transaction(['memories'], 'readwrite');
    const store = tx.objectStore('memories');
    store.clear();
    for (const m of [...this.store.memory.shortTerm, ...this.store.memory.longTerm]) {
      store.add(m);
    }
  },

  addMemory(input, response, wasSuccessful, category) {
    const memory = {
      input,
      response,
      wasSuccessful,
      category,
      relevance: wasSuccessful ? 0.6 : 0.3,
      timestamp: Date.now(),
      accessCount: 1
    };
    this.store.memory.shortTerm.push(memory);
    return memory;
  },

  async addConversationEntry(userId, role, text, metadata = {}) {
    const entry = { role, text, timestamp: Date.now(), metadata };
    this.store.conversationHistory[userId].push(entry);
    if (this.store.conversationHistory[userId].length > 100) {
      this.store.conversationHistory[userId] = this.store.conversationHistory[userId].slice(-100);
    }
    await handleMessage(role, text, metadata.audioBlob || null, userId, this.sessionId);
    return entry;
  },

  getConversationHistory(userId, limit = 10) {
    return (this.store.conversationHistory[userId] || []).slice(-limit);
  },

  updateUserProfile(userId, profileData) {
    const current = this.store.userProfiles[userId] || {
      id: userId,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      visitCount: 1
    };
    this.store.userProfiles[userId] = {
      ...current,
      ...profileData,
      lastSeen: Date.now()
    };
    return this.store.userProfiles[userId];
  },

  getUserProfile(userId) {
    return this.store.userProfiles[userId] || null;
  },

  setUserPreferences(userId, prefs) {
    this.store.preferences[userId] = {
      ...this.store.preferences[userId],
      ...prefs
    };
    AgentManager.setUserPreferences(this.store.preferences[userId]);
    return this.store.preferences[userId];
  },

  getUserPreferences(userId) {
    return this.store.preferences[userId] || {
      voice: 'default', speechRate: 1, theme: 'default', notifications: true
    };
  },

  setSystemContext(key, value) {
    this.store.systemContext[key] = value;
  },

  getSystemContext(key) {
    return this.store.systemContext[key];
  },

  getAllSystemContext() {
    return { ...this.store.systemContext };
  },

  generateGreeting(userId) {
    const profile = this.getUserProfile(userId);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    let greeting = `Good ${timeOfDay}`;
    if (profile?.name) greeting += `, ${profile.name}`;
    greeting += profile?.visitCount > 1 ? '! Welcome back.' : '!';
    return greeting;
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const userId = AgentManager.getUserId();
  if (userId) {
    AgentLeeMemoryCore.init(userId);
    window.AgentLee.memoryCore = AgentLeeMemoryCore;
  }
});
