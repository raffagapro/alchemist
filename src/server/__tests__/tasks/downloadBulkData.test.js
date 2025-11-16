'use strict';

const fs = require('fs');
const https = require('https');
const { downloadBulkData } = require('../../src/tasks/downloadBulkData');

// Mock dependencies
jest.mock('fs');
jest.mock('https');

describe('downloadBulkData', () => {
  let consoleLogSpy, consoleErrorSpy, consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('API Response Validation', () => {
    it('should throw error if API response missing data array', async () => {
      setupDirectoryMocks();
      mockAPIResponse({}, 200);

      await expect(downloadBulkData('all_cards')).rejects.toThrow(
        'Invalid response from Scryfall API - missing data array'
      );
    });

    it('should throw error for invalid bulk type', async () => {
      setupDirectoryMocks();
      mockAPIResponse(createMockAPIResponse(), 200);

      await expect(downloadBulkData('invalid_type')).rejects.toThrow(
        'Bulk data type "invalid_type" not found'
      );
    });

    it('should list available types when bulk type not found', async () => {
      setupDirectoryMocks();
      mockAPIResponse(createMockAPIResponse(), 200);

      try {
        await downloadBulkData('invalid_type');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Available:');
        expect(error.message).toContain('all_cards');
        expect(error.message).toContain('default_cards');
      }
    });

    it('should handle network errors', async () => {
      setupDirectoryMocks();
      
      https.get.mockImplementation(() => ({
        on: jest.fn((event, handler) => {
          if (event === 'error') handler(new Error('Network error'));
          return { on: jest.fn().mockReturnThis() };
        })
      }));

      await expect(downloadBulkData('all_cards')).rejects.toThrow('Network error');
    });

    it('should handle non-200 HTTP status codes', async () => {
      setupDirectoryMocks();
      mockAPIResponse({}, 500);

      await expect(downloadBulkData('all_cards')).rejects.toThrow('HTTP 500');
    });
  });

  describe('File Caching', () => {
    it('should return existing file if less than 24 hours old', async () => {
      setupDirectoryMocks();
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({
        mtime: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours old
      });
      mockAPIResponse(createMockAPIResponse(), 200);

      const result = await downloadBulkData('all_cards');

      expect(result).toContain('all_cards');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Recent file already exists')
      );
    });
  });

  describe('Directory Management', () => {
    it('should create bulkData directory if it does not exist', async () => {
      fs.existsSync.mockReturnValueOnce(false); // Directory check
      fs.existsSync.mockReturnValue(true); // File check (exists and recent)
      fs.statSync.mockReturnValue({
        mtime: new Date(Date.now() - 1000) // Very recent
      });
      fs.mkdirSync.mockReturnValue(undefined);
      mockAPIResponse(createMockAPIResponse(), 200);

      await downloadBulkData('all_cards');

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Created directory'));
    });
  });
});

// Helper functions
function createMockAPIResponse() {
  return {
    object: 'list',
    data: [
      {
        type: 'all_cards',
        updated_at: '2025-11-16T10:25:03.350Z',
        download_uri: 'https://data.scryfall.io/all-cards/test.json',
        size: 2440343529
      },
      {
        type: 'default_cards',
        updated_at: '2025-11-16T10:09:45.741Z',
        download_uri: 'https://data.scryfall.io/default-cards/test.json',
        size: 519534700
      }
    ]
  };
}

function setupDirectoryMocks() {
  fs.existsSync.mockReturnValue(false);
  fs.readdirSync.mockReturnValue([]);
  fs.mkdirSync.mockReturnValue(undefined);
}

function mockAPIResponse(data, statusCode = 200) {
  https.get.mockImplementation((url, options, callback) => {
    const mockRes = {
      statusCode,
      statusMessage: statusCode === 200 ? 'OK' : 'Error',
      on: jest.fn((event, handler) => {
        if (event === 'data') handler(JSON.stringify(data));
        if (event === 'end') handler();
        return mockRes;
      })
    };
    if (typeof callback === 'function') callback(mockRes);
    return { on: jest.fn().mockReturnThis() };
  });
}
