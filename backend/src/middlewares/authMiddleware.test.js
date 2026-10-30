const { isAuth } = require('./authMiddleware');

describe('isAuth middleware', () => {
  const obj = {};

  beforeEach(() => {
    obj.req = { isAuthenticated: () => true };
    obj.res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    obj.next = jest.fn();
  });

  test('calls next function when user is authenticated', () => {
    isAuth(obj.req, obj.res, obj.next);

    expect(obj.res.status).not.toHaveBeenCalled();
    expect(obj.res.json).not.toHaveBeenCalled();
    expect(obj.next).toHaveBeenCalled();
  });

  test('returns response status 401 with false success and msg', () => {
    obj.req = { isAuthenticated: () => false };

    isAuth(obj.req, obj.res, obj.next);

    expect(obj.next).not.toHaveBeenCalled();
    expect(obj.res.status).toHaveBeenCalledWith(401);
    expect(obj.res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You are not authorized!',
    });
  });
});
