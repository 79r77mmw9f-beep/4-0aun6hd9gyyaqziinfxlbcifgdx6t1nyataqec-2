/**
 * LIVING CITY - Decoupled Event Bus
 * Schema compliant with section 3.3 of the master game design document.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventCounter = 0;
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Subscribe to an event type. Returns unsubscribe function.
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const set = this.listeners.get(eventType);
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Publish an event matching the standard schema.
   */
  publish(eventData) {
    this.eventCounter += 1;
    const event = {
      event_id: eventData.event_id || `evt_${this.eventCounter}`,
      tick: eventData.tick ?? 0,
      timestamp: eventData.timestamp || Date.now(),
      event_type: eventData.event_type || 'GenericEvent',
      actor_id: eventData.actor_id || null,
      target_id: eventData.target_id || null,
      location: eventData.location ? { ...eventData.location } : null,
      evidence: eventData.evidence || {},
      visibility: eventData.visibility || 'public',
      payload: eventData.payload || {}
    };

    // Store in history
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const callbacks = this.listeners.get(event.event_type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(event);
        } catch (err) {
          console.error(`Error in listener for ${event.event_type}:`, err);
        }
      }
    }

    // Also notify wildcard listeners if any
    const wildcardCallbacks = this.listeners.get('*');
    if (wildcardCallbacks) {
      for (const callback of wildcardCallbacks) {
        try {
          callback(event);
        } catch (err) {
          console.error(`Error in wildcard listener for ${event.event_type}:`, err);
        }
      }
    }

    return event;
  }

  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  clear() {
    this.listeners.clear();
    this.history = [];
  }
}
