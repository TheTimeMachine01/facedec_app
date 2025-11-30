export const API_ROUTES = {
  // Authentication routes
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/register',
  REFRESH: '/api/auth/refresh',

  // Face-Detection Routes
  DETECT: '/api/face/detect',
  MATCH: '/api/face/match',

  // User routes
  ME: '/api/v1/users/me',

  // Attendance APIs
  INLOG: 'api/attendance/inlog',
  OUTLOG: 'api/attendance/outlog',
  HASINTIMETODAY: 'api/attendance/hasInTimeToday',
  HASOUTTIMETODAY: 'api/attendance/hasOutTimeToday'
};