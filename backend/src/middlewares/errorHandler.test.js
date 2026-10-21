const errorHandler = require('./errorHandler');

describe('errorHandler', () => {
  const res = {};
  beforeEach(() => {
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => '');
  });

  afterEach(() => jest.restoreAllMocks());

  test('returns the error status and message', () => {
    const error = new Error('Not Found!');
    error.status = 404;
    errorHandler(error, undefined, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not Found!' });
  });

  test('uses default status and message when the error message is missing', () => {
    const error = new Error();
    errorHandler(error, undefined, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
