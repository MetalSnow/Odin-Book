const { prisma } = require('../lib/prisma');
const { store } = require('../middlewares/sessionMidlleware');
const { validSignup, loginDetails } = require('../tests/helpers');
const { app, request } = require('../tests/testApp');

describe('userRouter', () => {
  afterAll(async () => {
    store.stopInterval();
    await prisma.$disconnect();
  });

  beforeAll(async () => {
    await prisma.user.deleteMany();
    const res = await request(app).post('/signup').send(validSignup());
    expect(res.status).toEqual(200);
  });

  describe('GET /user currentUser', () => {
    const agent = request.agent(app);

    beforeAll(async () => {
      const res = await agent.post('/login').send(loginDetails());
      expect(res.status).toEqual(200);
    });

    test('returns current logged in user data', async () => {
      const response = await agent.get('/user');

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('jack11@gmail.com');
      expect(response.body.data.username).toBe('jack');
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data).toHaveProperty('profile');
    });

    test('returns 401 with an error msg when the user is not logged in', async () => {
      const response = await request(app).get('/user');

      expect(response.status).toEqual(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'You are not authorized to view the resources.',
      );
    });
  });
});
