import test from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../src/core/EventBus.js';

test('EventBus: subscription and publishing', () => {
  const bus = new EventBus();
  const received = [];

  const unsubscribe = bus.subscribe('PlayerMoved', (evt) => {
    received.push(evt);
  });

  bus.publish({
    event_type: 'PlayerMoved',
    actor_id: 'player_main',
    location: { x: 50, y: 100 },
    payload: { speed: 140 }
  });

  assert.equal(received.length, 1);
  assert.equal(received[0].event_type, 'PlayerMoved');
  assert.equal(received[0].actor_id, 'player_main');
  assert.equal(received[0].location.x, 50);
  assert.equal(received[0].location.y, 100);
  assert.equal(received[0].payload.speed, 140);
  assert.ok(received[0].event_id.startsWith('evt_'));

  // Test unsubscribe
  unsubscribe();
  bus.publish({ event_type: 'PlayerMoved' });
  assert.equal(received.length, 1, 'no new events should be delivered after unsubscribe');
});

test('EventBus: event schema conformance and history', () => {
  const bus = new EventBus();

  bus.publish({ event_type: 'A' });
  bus.publish({ event_type: 'B' });
  bus.publish({ event_type: 'C' });

  const history = bus.getHistory(2);
  assert.equal(history.length, 2);
  assert.equal(history[0].event_type, 'B');
  assert.equal(history[1].event_type, 'C');
});
