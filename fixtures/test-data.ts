/**
 * Test data factory — all test inputs live here.
 * Separating data from logic means:
 *   - Tests are reusable across environments
 *   - Data changes don't touch test code
 *   - Easy to add parametrised scenarios
 */

export interface LoginCredentials {
  username: string;
  password: string;
  expected: "success" | "error";
  errorContains?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Standard Sauce Demo users */
export const users = {
  standard: {
    username: "standard_user",
    password: "secret_sauce",
  },
  lockedOut: {
    username: "locked_out_user",
    password: "secret_sauce",
  },
  problem: {
    username: "problem_user",
    password: "secret_sauce",
  },
  performance: {
    username: "performance_glitch_user",
    password: "secret_sauce",
  },
} as const;

/** Login scenarios — data-driven */
export const loginScenarios: LoginCredentials[] = [
  { username: users.standard.username, password: users.standard.password, expected: "success" },
  {
    username: users.lockedOut.username,
    password: users.lockedOut.password,
    expected: "error",
    errorContains: "locked out",
  },
  {
    username: "fake_user",
    password: "wrong_pass",
    expected: "error",
    errorContains: "not match",
  },
];

/** Shipping info variations */
export const shippingScenarios: ShippingInfo[] = [
  { firstName: "Mojammel", lastName: "Hossain", postalCode: "4000" },
  { firstName: "Jane", lastName: "Doe", postalCode: "1207" },
];
