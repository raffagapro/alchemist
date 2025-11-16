const request = require('supertest');
const express = require('express');
const routerCard = require('../../src/routes/routerCard');

// Mock the controllers
jest.mock('../../src/controllers/card/getCardByOracleId', () => 
  jest.fn((req, res) => res.json({ controller: 'getCardByOracleId', id: req.params.id }))
);
jest.mock('../../src/controllers/card/getCardsByName', () => 
  jest.fn((req, res) => res.json({ controller: 'getCardsByName', name: req.query.name }))
);

const getCardByOracleId = require('../../src/controllers/card/getCardByOracleId');
const getCardsByName = require('../../src/controllers/card/getCardsByName');

describe('Card Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/', routerCard);
    jest.clearAllMocks();
  });

  describe('GET /search', () => {
    it('should route to getCardsByName controller', async () => {
      const response = await request(app).get('/search?name=bolt');

      expect(response.status).toBe(200);
      expect(getCardsByName).toHaveBeenCalled();
      expect(response.body).toEqual({ 
        controller: 'getCardsByName', 
        name: 'bolt' 
      });
    });

    it('should pass query parameters to controller', async () => {
      await request(app).get('/search?name=lightning');

      expect(getCardsByName).toHaveBeenCalled();
      const callArgs = getCardsByName.mock.calls[0];
      expect(callArgs[0].query.name).toBe('lightning');
    });
  });

  describe('GET /card/:id', () => {
    it('should route to getCardByOracleId controller', async () => {
      const testId = '12345678-1234-5678-1234-567812345678';
      const response = await request(app).get(`/card/${testId}`);

      expect(response.status).toBe(200);
      expect(getCardByOracleId).toHaveBeenCalled();
      expect(response.body).toEqual({ 
        controller: 'getCardByOracleId', 
        id: testId 
      });
    });

    it('should pass id parameter to controller', async () => {
      const testId = 'abc-123';
      await request(app).get(`/card/${testId}`);

      expect(getCardByOracleId).toHaveBeenCalled();
      const callArgs = getCardByOracleId.mock.calls[0];
      expect(callArgs[0].params.id).toBe(testId);
    });
  });

  describe('Route priority', () => {
    it('should route /search before /card/:id to prevent conflicts', async () => {
      await request(app).get('/search?name=test');

      expect(getCardsByName).toHaveBeenCalled();
      expect(getCardByOracleId).not.toHaveBeenCalled();
    });

    it('should not treat "search" as an id parameter', async () => {
      await request(app).get('/search');

      expect(getCardsByName).toHaveBeenCalled();
      expect(getCardByOracleId).not.toHaveBeenCalled();
    });
  });

  describe('Route not found', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(getCardByOracleId).not.toHaveBeenCalled();
      expect(getCardsByName).not.toHaveBeenCalled();
    });
  });
});
