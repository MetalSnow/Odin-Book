const { prisma } = require('../lib/prisma');
const { store } = require('../middlewares/sessionMidlleware');
const { validSignup, loginDetails } = require('../tests/helpers');
const { app, request } = require('../tests/testApp');

describe('profileRouter', () => {
  afterAll(async () => {
    store.stopInterval();
    await prisma.$disconnect();
  });

  const agent = request.agent(app);

  beforeAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`,
    ]);
    const res = await request(app).post('/signup').send(validSignup());
    expect(res.status).toEqual(200);

    const res2 = await agent.post('/login').send(loginDetails());
    expect(res2.status).toEqual(200);
  });

  describe('GET /profile/:username', () => {
    test('returns the correct profile and user data', async () => {
      const response = await agent.get('/profile/jack');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('jack');
      expect(response.body.data).toHaveProperty('profile');
    });

    test('returns 404 with and error message if user not found', async () => {
      const response = await agent.get('/profile/wrongUserName');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User Not Found');
    });
  });
});
