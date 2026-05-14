/**
 * Paginate a mongoose query
 * @param {number} page - 1-based page number
 * @param {number} limit - items per page
 * @returns {{ skip: number, limit: number }}
 */
const paginate = (page = 1, limit = 20) => ({
  skip: (Math.max(1, page) - 1) * limit,
  limit: Math.max(1, limit),
});

/**
 * Sanitize a search string for use in regex
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a consistent API response
 */
const apiResponse = (success, data = null, message = '') => ({ success, data, message });

module.exports = { paginate, escapeRegex, apiResponse };