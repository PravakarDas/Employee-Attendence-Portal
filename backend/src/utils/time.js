const axios = require('axios');

/**
 * Get current time from a reliable external time source
 * Falls back to server time if external source is unavailable
 * Uses World Time API as the primary source
 */
const getReliableTime = async () => {
  try {
    // Try to fetch from World Time API (free, no API key needed)
    const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC', {
      timeout: 3000 // 3 second timeout
    });

    if (response.data && response.data.utc_datetime) {
      const reliableTime = new Date(response.data.utc_datetime);
      console.log('Time fetched from World Time API:', reliableTime.toISOString());
      return reliableTime;
    }

    // Fallback to server time
    console.warn('World Time API returned invalid data, using server time');
    return new Date();
  } catch (error) {
    // If external API fails, fall back to server time
    console.warn('Failed to fetch time from external source:', error.message);
    console.log('Using server time as fallback');
    return new Date();
  }
};

/**
 * Get current UTC time (server time as UTC)
 * This is a synchronous fallback that always works
 */
const getServerTime = () => {
  return new Date();
};

/**
 * Format time for display (converts UTC to local timezone)
 */
const formatTime = (date, timezone = 'UTC') => {
  if (!date) return null;
  
  try {
    return new Date(date).toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return date.toISOString();
  }
};

/**
 * Calculate duration between two dates in hours
 */
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end - start;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return Math.round(diffInHours * 100) / 100;
};

/**
 * Get start and end of day in UTC
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if two dates are the same day (UTC)
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};

module.exports = {
  getReliableTime,
  getServerTime,
  formatTime,
  calculateDuration,
  getStartOfDay,
  getEndOfDay,
  isSameDay
};
