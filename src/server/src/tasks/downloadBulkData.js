'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

const SCRYFALL_BULK_API = 'https://api.scryfall.com/bulk-data';
const BULK_DIR = path.resolve(__dirname, 'bulkData');

/**
 * Downloads the latest bulk data file from Scryfall
 * @param {string} bulkType - Type of bulk data ('all_cards', 'default_cards', etc.)
 */
async function downloadBulkData(bulkType = 'all_cards') {
  try {
    // Ensure bulkData directory exists
    if (!fs.existsSync(BULK_DIR)) {
      fs.mkdirSync(BULK_DIR, { recursive: true });
      console.log(`✓ Created directory: ${BULK_DIR}`);
    }

    // Step 1: Get bulk data metadata
    console.log('Fetching bulk data information from Scryfall...');
    const bulkInfo = await fetchJSON(SCRYFALL_BULK_API);
    
    if (!bulkInfo || !bulkInfo.data) {
      console.error('Unexpected API response:', JSON.stringify(bulkInfo, null, 2));
      throw new Error('Invalid response from Scryfall API - missing data array');
    }

    const targetBulk = bulkInfo.data.find(item => item.type === bulkType);
    if (!targetBulk) {
      const availableTypes = bulkInfo.data.map(item => item.type).join(', ');
      throw new Error(`Bulk data type "${bulkType}" not found. Available: ${availableTypes}`);
    }

    const downloadUrl = targetBulk.download_uri;
    const updatedAt = new Date(targetBulk.updated_at);
    const fileSize = targetBulk.size;
    const fileName = `${bulkType}-${formatDate(updatedAt)}.json`;
    const filePath = path.join(BULK_DIR, fileName);

    console.log(`Bulk data: ${bulkType}`);
    console.log(`Updated: ${updatedAt.toISOString()}`);
    console.log(`Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB`);

    // Step 2: Check if file already exists and is recent
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours < 24) {
        console.log(`✓ Recent file already exists (${ageHours.toFixed(1)} hours old): ${fileName}`);
        return filePath;
      } else {
        console.log(`File exists but is ${ageHours.toFixed(1)} hours old, downloading fresh copy...`);
      }
    }

    // Step 3: Clean up old files (keep only last 2)
    cleanupOldFiles(bulkType);

    // Step 4: Download the file
    console.log(`Downloading from: ${downloadUrl}`);
    console.log(`Saving to: ${filePath}`);
    
    await downloadFile(downloadUrl, filePath);
    
    console.log(`✓ Download complete: ${fileName}`);
    return filePath;

  } catch (error) {
    console.error('Error downloading bulk data:', error.message);
    throw error;
  }
}

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'AlchemistApp/1.0'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse JSON response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download file with progress tracking
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastProgress = 0;

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }

      totalBytes = parseInt(response.headers['content-length'], 10);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = Math.floor((downloadedBytes / totalBytes) * 100);
        
        // Log progress every 5%
        if (progress >= lastProgress + 5) {
          const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(2);
          const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
          console.log(`Progress: ${progress}% (${downloadedMB}/${totalMB} MB)`);
          lastProgress = progress;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('✓ File saved successfully');
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Clean up old bulk data files, keep only the 2 most recent
 */
function cleanupOldFiles(bulkType) {
  try {
    const files = fs.readdirSync(BULK_DIR)
      .filter(f => f.startsWith(bulkType) && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BULK_DIR, f),
        mtime: fs.statSync(path.join(BULK_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Keep only the 2 most recent files
    const filesToDelete = files.slice(2);
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`✓ Deleted old file: ${file.name}`);
    });
  } catch (err) {
    console.warn('Warning: Could not clean up old files:', err.message);
  }
}

/**
 * Format date as YYYYMMDD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Allow running directly from command line
if (require.main === module) {
  const bulkType = process.argv[2] || 'all_cards';
  
  console.log('=== Scryfall Bulk Data Downloader ===\n');
  
  downloadBulkData(bulkType)
    .then(filePath => {
      console.log(`\n✓ Success! File ready at: ${filePath}`);
      console.log('\nRun sync with: npm run sync-cards');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n✗ Download failed:', err.message);
      process.exit(1);
    });
}

module.exports = { downloadBulkData };
