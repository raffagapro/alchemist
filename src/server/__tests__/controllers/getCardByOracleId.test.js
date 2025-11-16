const getCardByOracleId = require('../../src/controllers/card/getCardByOracleId');
const { Card } = require('../../src/dbConn');

// Mock the database connection
jest.mock('../../src/dbConn', () => ({
  Card: {
    findOne: jest.fn()
  }
}));

describe('getCardByOracleId Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('should return a card when found', async () => {
    const mockCard = {
      id: 1,
      oracleId: '12345678-1234-5678-1234-567812345678',
      name: 'Lightning Bolt',
      manaCost: '{R}',
      typeLine: 'Instant',
      oracleText: 'Lightning Bolt deals 3 damage to any target.'
    };

    req.params.id = '12345678-1234-5678-1234-567812345678';
    Card.findOne.mockResolvedValue(mockCard);

    await getCardByOracleId(req, res);

    expect(Card.findOne).toHaveBeenCalledWith({ 
      where: { oracleId: '12345678-1234-5678-1234-567812345678' } 
    });
    expect(res.json).toHaveBeenCalledWith(mockCard);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 404 when card is not found', async () => {
    req.params.id = '12345678-1234-5678-1234-567812345678';
    Card.findOne.mockResolvedValue(null);

    await getCardByOracleId(req, res);

    expect(Card.findOne).toHaveBeenCalledWith({ 
      where: { oracleId: '12345678-1234-5678-1234-567812345678' } 
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Card not found' });
  });

  it('should return 500 when database error occurs', async () => {
    req.params.id = '12345678-1234-5678-1234-567812345678';
    const dbError = new Error('Database connection failed');
    Card.findOne.mockRejectedValue(dbError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await getCardByOracleId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching card by ID:', dbError);

    consoleErrorSpy.mockRestore();
  });

  it('should handle empty id parameter', async () => {
    req.params.id = '';
    Card.findOne.mockResolvedValue(null);

    await getCardByOracleId(req, res);

    expect(Card.findOne).toHaveBeenCalledWith({ where: { oracleId: '' } });
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
