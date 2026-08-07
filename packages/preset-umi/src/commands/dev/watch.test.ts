import { createEventFilteredHandler } from './watch';

test('event filtered handler only forwards selected events', () => {
  const events: string[] = [];
  const handler = createEventFilteredHandler({
    events: ['add', 'unlink'],
    onChange(event) {
      events.push(event);
    },
  });

  handler('change', '/tmp/index.md');
  handler('add', '/tmp/new.md');
  handler('unlink', '/tmp/old.md');

  expect(events).toEqual(['add', 'unlink']);
});

test('event filtered handler forwards every event by default', () => {
  const events: string[] = [];
  const handler = createEventFilteredHandler({
    onChange(event) {
      events.push(event);
    },
  });

  handler('change', '/tmp/index.md');
  handler('add', '/tmp/new.md');

  expect(events).toEqual(['change', 'add']);
});
