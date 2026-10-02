import { UserRegistrationData } from '../models/user.model';

/**
 * Generates unique user registration data for an isolated test run.
 */
export function generateTestUserData(): UserRegistrationData {
  const shortId = `${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
  return {
    firstName: 'Automation',
    lastName: 'Tester',
    street: '100 Innovation Way',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95112',
    phoneNumber: '4085550199',
    ssn: `999-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 8999)}`,
    username: `u_${shortId}`,
    password: `P@ss_${shortId}`,
  };
}

/**
 * Standard test data constants for account opening and transfer.
 */
export const testConfigData = {
  newAccountType: 'SAVINGS' as const,
  transferAmount: 25.0,
};
