const { paginate, escapeRegex, apiResponse } = require('../../src/utils/helpers');

describe('helpers', () => {
  describe('paginate', () => {
    it('returns correct skip for page 1', () => {
      expect(paginate(1, 20)).toEqual({ skip: 0, limit: 20 });
    });
    it('returns correct skip for page 3', () => {
      expect(paginate(3, 10)).toEqual({ skip: 20, limit: 10 });
    });
    it('clamps page below 1 to 1', () => {
      expect(paginate(0, 10).skip).toBe(0);
    });
  });

  describe('escapeRegex', () => {
    it('escapes special regex chars', () => {
      expect(escapeRegex('hello.world')).toBe('hello\\.world');
    });
    it('escapes multiple specials', () => {
      expect(escapeRegex('a+b*c')).toBe('a\\+b\\*c');
    });
  });

  describe('apiResponse', () => {
    it('returns success structure', () => {
      const r = apiResponse(true, { id: 1 }, 'ok');
      expect(r).toEqual({ success: true, data: { id: 1 }, message: 'ok' });
    });
    it('defaults data to null', () => {
      expect(apiResponse(false).data).toBeNull();
    });
  });
});