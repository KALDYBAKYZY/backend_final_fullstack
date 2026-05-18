const { paginate, escapeRegex, apiResponse } = require('../../src/utils/helpers');

describe('helpers', () => {

  describe('escapeRegex', () => {
    it('escapes special regex chars', () => {
      expect(escapeRegex('hello.world')).toBe('hello\\.world');
    });
    it('escapes multiple specials', () => {
      expect(escapeRegex('a+b*c')).toBe('a\\+b\\*c');
    });
  });
});