export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  echoConfig: {
    broadcaster: 'socket.io' as const,
    host: 'http://localhost:6001'
  },
  enableDebugLogs: false
}; 