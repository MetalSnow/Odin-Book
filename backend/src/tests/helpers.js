const validSignup = (overrides = {}) => ({
  username: 'jack',
  email: 'jack11@gmail.com',
  password: 'qwerty123',
  confirmedPassword: 'qwerty123',
  ...overrides,
});

const loginDetails = (overrides = {}) => ({
  usernameEmail: 'jack11@gmail.com',
  password: 'qwerty123',
  ...overrides,
});

module.exports = { validSignup, loginDetails };
