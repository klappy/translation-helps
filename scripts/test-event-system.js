/**
 * test-event-system.js
 * Simple script to test if the event bus is working correctly
 */

// Mock the event bus to test it
class EventBus {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    console.log(`✅ Subscribed to ${eventName}`);
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    };
  }

  emit(eventName, data) {
    if (!this.events[eventName]) {
      console.log(`❌ No subscribers for ${eventName}`);
      return;
    }
    console.log(`📡 Emitting ${eventName} to ${this.events[eventName].length} listeners`);
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
}

// Test the event system
const eventBus = new EventBus();

// Simulate AI Context subscribing
console.log('🧠 AI Context: Subscribing to resource events');

eventBus.on('resource:scripture', (data) => {
  console.log('🧠 AI Context: Received scripture data', data);
});

eventBus.on('resource:translationNotes', (data) => {
  console.log('🧠 AI Context: Received translation notes', data);
});

// Simulate components emitting events
console.log('\n📚 Simulating component events...\n');

setTimeout(() => {
  console.log('📖 ScripturePanel: Emitting scripture loaded event');
  eventBus.emit('resource:scripture', {
    usfm: 'Test USFM content',
    bookId: 'GEN',
    chapter: 1
  });
}, 1000);

setTimeout(() => {
  console.log('📝 TranslationNotesPanel: Emitting notes loaded event');
  eventBus.emit('resource:translationNotes', [
    { id: 1, text: 'Test note 1' },
    { id: 2, text: 'Test note 2' }
  ]);
}, 2000);

setTimeout(() => {
  console.log('\n✅ Event system test complete!');
  process.exit(0);
}, 3000);
