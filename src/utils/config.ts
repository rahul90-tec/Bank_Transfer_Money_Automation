/**
 * Global application configuration and environment variables for ParaBank.
 */
export const Config = {
  baseUrl: process.env.BASE_URL || 'https://parabank.parasoft.com',
  defaultTimeout: 45000,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  isCI: !!process.env.CI,
};
