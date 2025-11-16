const { getAllStores, getStoreById, createStore, updateStore, deleteStore } = require('../../../src/controllers/admin/stores');
const { Store, User, InventoryItem } = require('../../../src/dbConn');

// Mock the database connection
jest.mock('../../../src/dbConn', () => ({
  Store: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  User: {
    count: jest.fn()
  },
  InventoryItem: {
    count: jest.fn()
  }
}));

describe('Store Controllers', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllStores', () => {
    it('should return all stores sorted by name', async () => {
      const mockStores = [
        { id: 1, name: 'Store A', email: 'storea@test.com' },
        { id: 2, name: 'Store B', email: 'storeb@test.com' }
      ];

      Store.findAll.mockResolvedValue(mockStores);

      await getAllStores(req, res);

      expect(Store.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStores);
    });

    it('should return 500 when database error occurs', async () => {
      const dbError = new Error('Database error');
      Store.findAll.mockRejectedValue(dbError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await getAllStores(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch stores' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching stores:', dbError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStoreById', () => {
    it('should return store when found', async () => {
      const mockStore = { id: 1, name: 'Test Store', email: 'test@store.com' };
      req.params.id = '1';

      Store.findByPk.mockResolvedValue(mockStore);

      await getStoreById(req, res);

      expect(Store.findByPk).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStore);
    });

    it('should return 400 when id is not provided', async () => {
      req.params.id = undefined;

      await getStoreById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store ID is required' });
      expect(Store.findByPk).not.toHaveBeenCalled();
    });

    it('should return 404 when store not found', async () => {
      req.params.id = '999';
      Store.findByPk.mockResolvedValue(null);

      await getStoreById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store not found' });
    });

    it('should return 500 when database error occurs', async () => {
      req.params.id = '1';
      const dbError = new Error('Database error');
      Store.findByPk.mockRejectedValue(dbError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await getStoreById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch store' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createStore', () => {
    it('should create a new store successfully', async () => {
      const storeData = {
        name: 'New Store',
        description: 'A new store',
        email: 'new@store.com',
        phone: '123-456-7890',
        city: 'New York'
      };

      const mockCreatedStore = { id: 1, ...storeData, isActive: true };
      req.body = storeData;

      Store.create.mockResolvedValue(mockCreatedStore);

      await createStore(req, res);

      expect(Store.create).toHaveBeenCalledWith({
        ...storeData,
        website: undefined,
        addressLine1: undefined,
        addressLine2: undefined,
        state: undefined,
        postalCode: undefined,
        country: undefined,
        businessHours: undefined,
        timezone: undefined,
        settings: undefined,
        isActive: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedStore);
    });

    it('should return 400 when name is not provided', async () => {
      req.body = { email: 'test@store.com' };

      await createStore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store name is required' });
      expect(Store.create).not.toHaveBeenCalled();
    });

    it('should return 409 when store name already exists', async () => {
      req.body = { name: 'Existing Store' };
      const uniqueError = new Error('Unique constraint error');
      uniqueError.name = 'SequelizeUniqueConstraintError';

      Store.create.mockRejectedValue(uniqueError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await createStore(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store name already exists' });

      consoleErrorSpy.mockRestore();
    });

    it('should return 500 when database error occurs', async () => {
      req.body = { name: 'Test Store' };
      const dbError = new Error('Database error');

      Store.create.mockRejectedValue(dbError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await createStore(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create store' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateStore', () => {
    it('should update store successfully', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Store', email: 'updated@store.com' };

      const mockStore = {
        id: 1,
        name: 'Old Store',
        update: jest.fn().mockResolvedValue(true)
      };

      Store.findByPk.mockResolvedValue(mockStore);

      await updateStore(req, res);

      expect(Store.findByPk).toHaveBeenCalledWith('1');
      expect(mockStore.update).toHaveBeenCalledWith({
        name: 'Updated Store',
        email: 'updated@store.com'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStore);
    });

    it('should return 400 when id is not provided', async () => {
      req.params.id = undefined;
      req.body = { name: 'Updated Store' };

      await updateStore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store ID is required' });
      expect(Store.findByPk).not.toHaveBeenCalled();
    });

    it('should return 404 when store not found', async () => {
      req.params.id = '999';
      req.body = { name: 'Updated Store' };

      Store.findByPk.mockResolvedValue(null);

      await updateStore(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store not found' });
    });

    it('should filter out protected fields', async () => {
      req.params.id = '1';
      req.body = {
        id: 999,
        name: 'Updated Store',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-02'
      };

      const mockStore = {
        id: 1,
        name: 'Old Store',
        update: jest.fn().mockResolvedValue(true)
      };

      Store.findByPk.mockResolvedValue(mockStore);

      await updateStore(req, res);

      expect(mockStore.update).toHaveBeenCalledWith({
        name: 'Updated Store'
      });
    });

    it('should return 409 when store name already exists', async () => {
      req.params.id = '1';
      req.body = { name: 'Existing Store' };

      const mockStore = {
        id: 1,
        update: jest.fn()
      };

      const uniqueError = new Error('Unique constraint error');
      uniqueError.name = 'SequelizeUniqueConstraintError';

      Store.findByPk.mockResolvedValue(mockStore);
      mockStore.update.mockRejectedValue(uniqueError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateStore(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store name already exists' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteStore', () => {
    it('should delete store successfully when no users or inventory', async () => {
      req.params.id = '1';

      const mockStore = {
        id: 1,
        name: 'Test Store',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Store.findByPk.mockResolvedValue(mockStore);
      User.count.mockResolvedValue(0);
      InventoryItem.count.mockResolvedValue(0);

      await deleteStore(req, res);

      expect(Store.findByPk).toHaveBeenCalledWith('1');
      expect(User.count).toHaveBeenCalledWith({ where: { storeId: '1' } });
      expect(InventoryItem.count).toHaveBeenCalledWith({ where: { storeId: '1' } });
      expect(mockStore.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Store deleted successfully' });
    });

    it('should return 400 when id is not provided', async () => {
      req.params.id = undefined;

      await deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store ID is required' });
      expect(Store.findByPk).not.toHaveBeenCalled();
    });

    it('should return 404 when store not found', async () => {
      req.params.id = '999';

      Store.findByPk.mockResolvedValue(null);

      await deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Store not found' });
    });

    it('should return 400 when store has users', async () => {
      req.params.id = '1';

      const mockStore = {
        id: 1,
        destroy: jest.fn()
      };

      Store.findByPk.mockResolvedValue(mockStore);
      User.count.mockResolvedValue(5);
      InventoryItem.count.mockResolvedValue(0);

      await deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot delete store with existing users or inventory',
        details: { users: 5, inventoryItems: 0 }
      });
      expect(mockStore.destroy).not.toHaveBeenCalled();
    });

    it('should return 400 when store has inventory items', async () => {
      req.params.id = '1';

      const mockStore = {
        id: 1,
        destroy: jest.fn()
      };

      Store.findByPk.mockResolvedValue(mockStore);
      User.count.mockResolvedValue(0);
      InventoryItem.count.mockResolvedValue(10);

      await deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot delete store with existing users or inventory',
        details: { users: 0, inventoryItems: 10 }
      });
      expect(mockStore.destroy).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      req.params.id = '1';
      const dbError = new Error('Database error');

      Store.findByPk.mockRejectedValue(dbError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete store' });

      consoleErrorSpy.mockRestore();
    });
  });
});
