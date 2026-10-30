import test from 'node:test';
import assert from 'node:assert/strict';
import { StatefulPropsManager } from '../../src/simulation/StatefulProps.js';
import { EventBus } from '../../src/core/EventBus.js';
import { Vector2 } from '../../src/core/Vector2.js';

test('StatefulPropsManager: initialization of default props', () => {
  const bus = new EventBus();
  const manager = new StatefulPropsManager(bus);

  const poster = manager.getProp('prop_poster_bulletin');
  assert.ok(poster, 'poster prop should exist');
  assert.equal(poster.state, 'intact');

  const lamp = manager.getProp('prop_street_lamp_west');
  assert.ok(lamp, 'lamp prop should exist');
  assert.equal(lamp.state, 'lit');

  const cabinet = manager.getProp('prop_electric_box');
  assert.ok(cabinet, 'cabinet prop should exist');
  assert.equal(cabinet.state, 'intact');
});

test('StatefulPropsManager: player proximity detection', () => {
  const bus = new EventBus();
  const manager = new StatefulPropsManager(bus);

  const poster = manager.getProp('prop_poster_bulletin');
  const nearPos = new Vector2(poster.position.x + 10, poster.position.y);
  const farPos = new Vector2(poster.position.x + 200, poster.position.y);

  assert.equal(manager.checkPlayerProximity(nearPos, 38)?.id, 'prop_poster_bulletin');
  assert.equal(manager.checkPlayerProximity(farPos, 38), null);
});

test('StatefulPropsManager: state toggling and event publishing', () => {
  const bus = new EventBus();
  const manager = new StatefulPropsManager(bus);

  const events = [];
  bus.subscribe('PropStateChanged', (evt) => {
    events.push(evt);
  });

  // Interact with poster: 'intact' -> 'torn'
  const state1 = manager.interact('prop_poster_bulletin');
  assert.equal(state1, 'torn');
  assert.equal(events.length, 1);
  assert.equal(events[0].payload.old_state, 'intact');
  assert.equal(events[0].payload.new_state, 'torn');

  // Interact with lamp: 'lit' -> 'flickering' -> 'broken' -> 'lit'
  const lampState1 = manager.interact('prop_street_lamp_west');
  assert.equal(lampState1, 'flickering');
  const lampState2 = manager.interact('prop_street_lamp_west');
  assert.equal(lampState2, 'broken');
  const lampState3 = manager.interact('prop_street_lamp_west');
  assert.equal(lampState3, 'lit');

  assert.equal(events.length, 4);
});
