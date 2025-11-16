# Card Sync Tasks

This directory contains scripts for downloading and syncing card data from Scryfall.

## Setup

The bulk data files (2GB+) are **not stored in git**. You must download them first.

## Usage

### 1. Download Bulk Data (First Time / Daily Update)

```bash
npm run download-bulk
```

This will:
- Download the latest card data from Scryfall (~2GB)
- Save it to `src/tasks/bulkData/`
- Automatically clean up old files (keeps last 2)
- Check if a recent file exists (< 24 hours old) before downloading

### 2. Sync Cards to Database

```bash
npm run sync-cards
```

This will:
- Find the most recent JSON file in `bulkData/`
- Stream and process the cards in batches
- Upsert them into your PostgreSQL database

### 3. Download + Sync (Combined)

```bash
npm run update-cards
```

Runs both download and sync in sequence.

## Automated Daily Updates

To download fresh data every 24 hours, set up a cron job or scheduled task:

**Linux/Mac (crontab):**
```bash
# Run at 2 AM daily
0 2 * * * cd /path/to/alchemist/src/server && npm run update-cards >> logs/card-sync.log 2>&1
```

**Windows (Task Scheduler):**
```powershell
# Create a scheduled task
schtasks /create /tn "CardDataSync" /tr "cmd /c cd C:\path\to\alchemist\src\server && npm run update-cards" /sc daily /st 02:00
```

## Files

- `downloadBulkData.js` - Downloads bulk data from Scryfall API
- `runSync.js` - Streams and syncs cards to database
- `bulkData/` - Storage for downloaded JSON files (gitignored)

## Notes

- Bulk data files are **excluded from git** (2GB+ size)
- Old files are automatically cleaned up (keeps 2 most recent)
- Downloads are skipped if a recent file exists (< 24 hours)
- Streaming is used to handle large files efficiently
