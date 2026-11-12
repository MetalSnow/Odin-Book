const { prisma } = require('../lib/prisma');
const { store } = require('../middlewares/sessionMidlleware');
const { validSignup, loginDetails } = require('../tests/helpers');
const { app, request } = require('../tests/testApp');

describe('userRouter', () => {
  afterAll(async () => {
    store.stopInterval();
    await prisma.$disconnect();
  });

  const agent = request.agent(app);
  let userId;

  beforeAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`,
    ]);
    const res = await request(app).post('/signup').send(validSignup());
    expect(res.status).toEqual(200);
    userId = res.body.data.id;

    const res2 = await agent.post('/login').send(loginDetails());
    expect(res2.status).toEqual(200);
  });

  describe('GET /user currentUser', () => {
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

  describe('GET /users findUsers', () => {
    test('returns users that contains the word from the query', async () => {
      const response = await agent.get('/users?q=j');

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe('jack');
      expect(response.body.data[0].profile).toHaveProperty('profilePic');
      expect(response.body.data.password).toBeUndefined();
    });

    test('returns user that matches the query', async () => {
      const response = await agent.get('/users?q=jack');

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe('jack');
    });

    test('returns an empty array if none of the users matches the query', async () => {
      const response = await agent.get('/users?q=random');

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test('returns 401 with an error msg when the user is not logged in', async () => {
      const response = await request(app).get('/users?q=err');

      expect(response.status).toEqual(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'You are not authorized to view the resources.',
      );
    });
  });

  describe('GET /user/:userId findUser', () => {
    test('returns user data', async () => {
      const response = await agent.get(`/user/${userId}`);

      expect(response.status).toEqual(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('jack');
      expect(response.body.data).toHaveProperty('profile');
      expect(response.body.data.password).toBeUndefined();
    });

    test('returns 404 with an error message when user is not found', async () => {
      const response = await agent.get(`/user/4000`);

      expect(response.status).toEqual(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User Not Found');
    });

    test('returns 401 with an error msg when the user is not logged in', async () => {
      const response = await request(app).get(`/user/${userId}`);

      expect(response.status).toEqual(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'You are not authorized to view the resources.',
      );
    });
  });

  describe('PATCH /user updateUserInfo', () => {
    test('returns the correct updated user data', async () => {
      const user = {
        name: 'Jack Spicer',
        username: 'jack11',
        email: 'jack@gmail.com',
      };
      const response = await agent.patch('/user').send(user);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Jack Spicer');
      expect(response.body.data.username).toBe('jack11');
      expect(response.body.data.email).toBe('jack@gmail.com');
    });
    test('returns validation errors array if inputs are wrong', async () => {
      const user = {
        name: '', // Name is optional so it should not return an error if empty
        username: '1',
        email: 'jack',
      };
      const response = await agent.patch('/user').send(user);

      const errors = response.body.errors.map((err) => err.path);

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(2);
      expect(errors).toEqual(expect.arrayContaining(['username', 'email']));
    });
  });

  describe('PATCH /user/password updateUserPassword', () => {
    test('returns validation errors array if password inputs are wrong', async () => {
      const data = {
        currentPassword: '',
        newPassword: 'qwe',
        confirmedPassword: 'quertyy',
      };
      const response = await agent.patch('/user/password').send(data);

      const errors = response.body.errors.map((err) => err.path);
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(3);
      expect(errors).toEqual(
        expect.arrayContaining([
          'currentPassword',
          'newPassword',
          'confirmedPassword',
        ]),
      );
    });
    test('returns 200 with a success message', async () => {
      const data = {
        currentPassword: 'qwerty123',
        newPassword: 'qwert',
        confirmedPassword: 'qwert',
      };
      const response = await agent.patch('/user/password').send(data);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully.');
    });
  });

  describe('DELETE /user deleteUser', () => {
    test('returns 200 with a success message', async () => {
      const response = await agent.delete('/user');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deleted successfuly.');
    });
  });
});
