import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserRegistrationData } from '../models/user.model';

/**
 * Page Object for ParaBank Registration Page (register.htm).
 */
export class RegisterPage extends BasePage {
  readonly pageHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly ssnInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;

  readonly welcomeTitle: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.firstNameInput = page.locator('#customerForm input[name="customer.firstName"]');
    this.lastNameInput = page.locator('#customerForm input[name="customer.lastName"]');
    this.streetInput = page.locator('#customerForm input[name="customer.address.street"]');
    this.cityInput = page.locator('#customerForm input[name="customer.address.city"]');
    this.stateInput = page.locator('#customerForm input[name="customer.address.state"]');
    this.zipCodeInput = page.locator('#customerForm input[name="customer.address.zipCode"]');
    this.phoneInput = page.locator('#customerForm input[name="customer.phoneNumber"]');
    this.ssnInput = page.locator('#customerForm input[name="customer.ssn"]');
    this.usernameInput = page.locator('#customerForm input[name="customer.username"]');
    this.passwordInput = page.locator('#customerForm input[name="customer.password"]');
    this.confirmPasswordInput = page.locator('#customerForm input[name="repeatedPassword"]');
    this.registerButton = page.locator('#customerForm input[value="Register"]');

    this.welcomeTitle = page.locator('#rightPanel h1.title');
    this.successMessage = page.locator('#rightPanel p').first();
  }

  /**
   * Navigate directly to the registration page.
   */
  async open(): Promise<void> {
    await this.navigateTo('/parabank/register.htm');
    await this.firstNameInput.waitFor({ state: 'visible' });
  }

  /**
   * Complete registration with the given user details.
   */
  async registerUser(userData: UserRegistrationData): Promise<void> {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.streetInput.fill(userData.street);
    await this.cityInput.fill(userData.city);
    await this.stateInput.fill(userData.state);
    await this.zipCodeInput.fill(userData.zipCode);
    await this.phoneInput.fill(userData.phoneNumber);
    await this.ssnInput.fill(userData.ssn);
    await this.usernameInput.fill(userData.username);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);

    await this.registerButton.click();
    // Wait for either the welcome heading or potential field error
    await this.page.waitForFunction(
      (username) => {
        const h1 = document.querySelector('#rightPanel h1.title');
        const err = document.querySelector('span[id$="username.errors"]');
        return (h1 && h1.textContent?.includes(`Welcome ${username}`)) || (err && err.textContent?.trim().length! > 0);
      },
      userData.username,
      { timeout: 15000 }
    );

    const errorSpan = this.page.locator('span[id$="username.errors"]');
    if (await errorSpan.isVisible()) {
      const errText = await errorSpan.innerText();
      throw new Error(`Registration failed for ${userData.username}: ${errText}`);
    }
  }

  /**
   * Get registration welcome heading text.
   */
  async getWelcomeText(): Promise<string> {
    return (await this.welcomeTitle.innerText()).trim();
  }

  /**
   * Get registration confirmation body text.
   */
  async getSuccessMessageText(): Promise<string> {
    return (await this.successMessage.innerText()).trim();
  }
}
