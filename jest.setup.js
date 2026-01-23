import '@testing-library/jest-dom'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

global.Response = jest.fn();
global.Request = jest.fn();
global.Headers = jest.fn();
