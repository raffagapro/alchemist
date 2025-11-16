const getCardsByName = require('../../src/controllers/card/getCardsByName');
const { Card } = require('../../src/dbConn');
const { Op } = require('sequelize');

// Mock the database connection
jest.mock('../../src/dbConn', () => ({
  Card: {
    findAll: jest.fn()
  }
}));

describe('getCardsByName Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('should return cards when found by name', async () => {
    const mockCards = [
      {
        id: 1,
        oracleId: '12345678-1234-5678-1234-567812345678',
        name: 'Lightning Bolt',
        manaCost: '{R}',
        typeLine: 'Instant'
      },
      {
        id: 2,
        oracleId: '87654321-4321-8765-4321-876543218765',
        name: 'Chain Lightning',
        manaCost: '{R}',
        typeLine: 'Sorcery'
      }
    ];

    req.query.name = 'lightning';
    Card.findAll.mockResolvedValue(mockCards);

    await getCardsByName(req, res);

    expect(Card.findAll).toHaveBeenCalledWith({
      where: {
        name: {
          [Op.iLike]: '%lightning%'
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockCards);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 when name parameter is missing', async () => {
    req.query = {};

    await getCardsByName(req, res);

    expect(Card.findAll).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Name query parameter is required' });
  });

  it('should return 404 when no cards are found', async () => {
    req.query.name = 'nonexistentcard';
    Card.findAll.mockResolvedValue([]);

    await getCardsByName(req, res);

    expect(Card.findAll).toHaveBeenCalledWith({
      where: {
        name: {
          [Op.iLike]: '%nonexistentcard%'
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No cards found' });
  });

  it('should return 500 when database error occurs', async () => {
    req.query.name = 'lightning';
    const dbError = new Error('Database connection failed');
    Card.findAll.mockRejectedValue(dbError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await getCardsByName(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching cards by name:', dbError);

    consoleErrorSpy.mockRestore();
  });

  it('should handle partial name matches with case insensitivity', async () => {
    const mockCards = [
      {
        id: 3,
        name: 'Black Lotus',
        manaCost: '{0}'
      }
    ];

    req.query.name = 'LOTUS';
    Card.findAll.mockResolvedValue(mockCards);

    await getCardsByName(req, res);

    expect(Card.findAll).toHaveBeenCalledWith({
      where: {
        name: {
          [Op.iLike]: '%LOTUS%'
        }
      }
    });
    expect(res.json).toHaveBeenCalledWith(mockCards);
  });
});
