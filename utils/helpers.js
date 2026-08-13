/**
 * Helper utility functions
 */

/**
 * Check if a date is expired relative to current time
 * @param {Date|string} date 
 * @returns {boolean}
 */
const isExpired = (date) => {
  const targetDate = new Date(date);
  return targetDate < new Date();
};

module.exports = {
  isExpired
};
