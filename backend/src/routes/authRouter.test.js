const { prisma } = require('../lib/prisma');
const { app, request } = require('../tests/testApp');

describe('authRouter', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  test('signup end point works', async () => {
    const userInfo = {
      username: 'jack',
      email: 'jack11@gmail.com',
      password: 'qwerty123',
      confirmedPassword: 'qwerty123',
    };

    const response = await request(app).post('/signup').send(userInfo);

    expect(response.status).toEqual(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.username).toBe('jack');
    expect(response.body.data.email).toBe('jack11@gmail.com');
    expect(response.body.data.password).toBeUndefined();

    const response2 = await request(app).post('/signup').send(userInfo);
    expect(response2.status).toEqual(400);
    expect(response2.body.errors).toHaveLength(2);
  });

  test('signup inputs validation work', async () => {
    const userInfo = {
      username: 'a',
      email: 'jac',
      password: 'q',
      confirmedPassword: 'qwert',
    };

    const response = await request(app).post('/signup').send(userInfo);
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
});
