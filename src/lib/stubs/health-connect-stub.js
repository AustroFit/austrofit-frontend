// Stub for @capacitor/health-connect – only used in native Android builds
export const HealthConnect = {
  checkHealthPermissions: async () => ({ permissions: [] }),
  requestHealthPermissions: async () => {},
  readRecords: async () => ({ records: [] })
};
