// Global test setup
process.env.NODE_ENV = 'test';

// Set test timeout (useful for database operations)
jest.setTimeout(30000);

// Mock console.log during tests to reduce noise (optional)
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.createMockCustomer = (overrides = {}) => ({
  name: 'Test Customer',
  email: 'test@example.com',
  age: 25,
  ...overrides
});

// Add any other global test utilities here