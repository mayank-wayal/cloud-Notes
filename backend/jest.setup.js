// Jest global setup file
// This runs before all tests
import { jest } from "@jest/globals";

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  // Comment out lines below if you need logs during testing
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
