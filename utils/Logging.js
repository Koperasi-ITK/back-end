// utils/logging.js
const { Logging } = require('../app/models');

/**
 * Logs an action performed by a user.
 *
 * @param {number} userId - The ID of the user who performed the action.
 * @param {string} status - The status to log.
 * @param {DATE} tanggal - The date to log.
 * @param {TIME} waktu - The time to log.
 */
async function logAction(userId, status, tanggal, waktu) {
  try {
    await Logging.create({
      userId,
      status,
      tanggal,
      waktu,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

/**
 * Get the current time in HH:MM:SS format.
 *
 * @returns {string} - The current time.
 */
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

module.exports = {
  logAction,
  getCurrentTime
};
