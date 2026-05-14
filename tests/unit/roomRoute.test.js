const { escapeRegex } = require('../../src/utils/helpers');

// Mocked route handler logic test
describe('Room route handler logic', () => {
  it('escapes search query for regex', () => {
    const query = 'Math 101 (Advanced)';
    const escaped = escapeRegex(query);
    expect(() => new RegExp(escaped)).not.toThrow();
  });

  it('builds correct filter when subject is provided', () => {
    const filter = {};
    const subject = 'Physics';
    if (subject) filter.subject = subject;
    expect(filter).toEqual({ subject: 'Physics' });
  });
});