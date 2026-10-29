const { prisma } = require('../lib/prisma');
const { store } = require('../middlewares/sessionMidlleware');
const { validSignup } = require('../tests/helpers');
const { app, request } = require('../tests/testApp');

describe('authRouter', () => {
  afterAll(async () => {
    store.stopInterval();
    await prisma.$disconnect();
  });

  describe('POST /signup', () => {
    beforeEach(async () => {
      await prisma.user.deleteMany();
    });

    test('signup end point works', async () => {
      const response = await request(app).post('/signup').send(validSignup());

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('jack');
      expect(response.body.data.email).toBe('jack11@gmail.com');
      expect(response.body.data.password).toBeUndefined();

      const response2 = await request(app).post('/signup').send(validSignup());
      const errors = response2.body.errors.map((err) => err.path);
      expect(response2.status).toEqual(400);
      expect(response2.body.errors).toHaveLength(2);
      expect(errors).toEqual(expect.arrayContaining(['username', 'email']));
    });

    test('signup inputs validation work', async () => {
      const userInfo = {
        username: 'a',
        email: 'jac',
        password: 'q',
        confirmedPassword: 'qwert',
      };

      const response = await request(app)
        .post('/signup')
        .send(validSignup(userInfo));
      const errors = response.body.errors.map((err) => err.path);
      expect(response.status).toEqual(400);
      expect(response.body.errors).toHaveLength(4);
      expect(errors).toEqual(
        expect.arrayContaining([
          'email',
          'password',
          'confirmedPassword',
          'username',
        ]),
      );
    });

    test('returns error if username contains symbols', async () => {
      const response = await request(app)
        .post('/signup')
        .send(validSignup({ username: 'jack@mail' }));
      expect(response.status).toEqual(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].path).toBe('username');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      await request(app).post('/signup').send(validSignup());
    });

    test('login end point works', async () => {
      const loginDetails = {
        usernameEmail: 'jack11@gmail.com',
        password: 'qwerty123',
      };
      const response = await request(app).post('/login').send(loginDetails);

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('jack');
    });

    test('authenticate middleware returns 401 with an error message', async () => {
      const loginDetails = {
        usernameEmail: 'j11@gmail.com',
        password: 'qwerty123',
      };
      const response = await request(app).post('/login').send(loginDetails);

      expect(response.status).toEqual(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid username/email or password.');
    });
  });
});
