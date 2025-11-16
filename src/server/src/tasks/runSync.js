'use strict';

const fs = require('fs');
const path = require('path');
const { Card } = require('../dbConn');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const colorMap = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
const rarityMap = { 
  'common': 'common', 
  'uncommon': 'uncommon', 
  'rare': 'rare', 
  'mythic': 'mythic',
  'special': 'special',
  'bonus': 'bonus'
};

function parseCost(costString) {
  const cost = {};
  if (!costString) return cost;
  const regex = /\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(costString)) !== null) {
    const mana = match[1];
    if (isNaN(mana)) {
      cost[mana.toLowerCase()] = (cost[mana.toLowerCase()] || 0) + 1;
    } else {
      cost.generic = (cost.generic || 0) + parseInt(mana);
    }
  }
  return cost;
}

function determineType(typeLine) {
  if (!typeLine) return 'other';
  const lower = typeLine.toLowerCase();
  if (lower.includes('creature')) return 'creature';
  if (lower.includes('instant') || lower.includes('sorcery')) return 'spell';
  if (lower.includes('artifact')) return lower.includes('equipment') ? 'equipment' : 'artifact';
  if (lower.includes('land')) return 'land';
  return 'other';
}

function getAttributes(colorIdentity) {
  return (colorIdentity || []).filter(c => colorMap[c]).map(c => colorMap[c]);
}

function normalizeCard(card) {
  return {
    // Scryfall Core Fields
    object: card.object || 'card',
    scryfallId: card.id || null,
    oracleId: card.oracle_id || null,
    multiverseIds: card.multiverse_ids || [],
    resourceId: card.resource_id || null,
    mtgoId: card.mtgo_id || null,
    tcgplayerId: card.tcgplayer_id || null,
    cardmarketId: card.cardmarket_id || null,
    
    // Card Identity
    name: card.name,
    slug: card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    lang: card.lang || 'en',
    releasedAt: card.released_at || null,
    
    // URIs
    uri: card.uri || null,
    scryfallUri: card.scryfall_uri || null,
    
    // Layout & Image
    layout: card.layout || 'normal',
    highresImage: card.highres_image || false,
    imageStatus: card.image_status || 'missing',
    imageUris: card.image_uris || {},
    
    // Game Mechanics
    manaCost: card.mana_cost || null,
    cmc: card.cmc || 0,
    typeLine: card.type_line || null,
    oracleText: card.oracle_text || null,
    colors: card.colors || [],
    colorIdentity: card.color_identity || [],
    keywords: card.keywords || [],
    producedMana: card.produced_mana || [],
    
    // Legalities
    legalities: card.legalities || {},
    
    // Availability & Print Info
    games: card.games || [],
    reserved: card.reserved || false,
    gameChanger: card.game_changer || false,
    foil: card.foil || false,
    nonfoil: card.nonfoil !== undefined ? card.nonfoil : true,
    finishes: card.finishes || [],
    oversized: card.oversized || false,
    promo: card.promo || false,
    reprint: card.reprint || false,
    variation: card.variation || false,
    
    // Set Information
    setId: card.set_id || null,
    set: card.set || null,
    setName: card.set_name || null,
    setType: card.set_type || null,
    setUri: card.set_uri || null,
    setSearchUri: card.set_search_uri || null,
    scryfallSetUri: card.scryfall_set_uri || null,
    rulingsUri: card.rulings_uri || null,
    printsSearchUri: card.prints_search_uri || null,
    
    // Collector Info
    collectorNumber: card.collector_number || null,
    digital: card.digital || false,
    rarity: rarityMap[card.rarity] || 'common',
    flavorText: card.flavor_text || null,
    cardBackId: card.card_back_id || null,
    
    // Artist Info
    artist: card.artist || null,
    artistIds: card.artist_ids || [],
    illustrationId: card.illustration_id || null,
    
    // Frame & Border
    borderColor: card.border_color || 'black',
    frame: card.frame || '2015',
    fullArt: card.full_art || false,
    textless: card.textless || false,
    booster: card.booster || false,
    storySpotlight: card.story_spotlight || false,
    
    // Rankings & Stats
    edhrecRank: card.edhrec_rank || null,
    
    // Preview Info
    preview: card.preview || null,
    
    // Prices
    prices: card.prices || {},
    
    // Related URIs
    relatedUris: card.related_uris || {},
    
    // Purchase URIs
    purchaseUris: card.purchase_uris || {},
    
    // Legacy fields (for backward compatibility)
    description: card.oracle_text || card.flavor_text || '',
    type: determineType(card.type_line),
    cost: parseCost(card.mana_cost),
    attack: parseInt(card.power) || 0,
    defense: parseInt(card.toughness) || 0,
    health: 0,
    attributes: getAttributes(card.color_identity),
    tags: [card.set, ...(card.keywords || [])].filter(Boolean),
    imageUrl: card.image_uris?.normal || card.image_uris?.small || '',
    isPublished: true,
    metadata: {
      power: card.power || null,
      toughness: card.toughness || null,
      loyalty: card.loyalty || null,
      defense: card.defense || null
    }
  };
}

const BATCH_SIZE = 500;

async function upsertBatch(cards) {
  await Promise.all(cards.map(c => Card.upsert(c, { conflictFields: ['slug'] })));
}

async function streamBulkFile(filePath) {
  return new Promise((resolve, reject) => {
    let processed = 0;
    let batch = [];

    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),      // parse JSON tokens
      streamArray()  // stream items from top-level array
    ]);

    pipeline.on('data', async ({ value }) => {
      batch.push(normalizeCard(value));
      if (batch.length >= BATCH_SIZE) {
        pipeline.pause();
        try {
          await upsertBatch(batch);
          processed += batch.length;
          batch = [];
          if (processed % 10000 === 0) console.log(`Processed ${processed} cards...`);
        } catch (e) {
          return pipeline.destroy(e);
        } finally {
          pipeline.resume();
        }
      }
    });

    pipeline.on('end', async () => {
      try {
        if (batch.length) {
          await upsertBatch(batch);
          processed += batch.length;
        }
        console.log(`✓ Card sync completed! Total cards: ${processed}`);
        resolve(processed);
      } catch (e) {
        reject(e);
      }
    });

    pipeline.on('error', err => reject(err));
  });
}

async function syncCards() {
  // Use directory next to this script
  const bulkDir = path.resolve(__dirname, 'bulkData');
  let filePath;

  try {
    if (!fs.existsSync(bulkDir) || !fs.statSync(bulkDir).isDirectory()) {
      console.error(`bulkData directory not found: ${bulkDir}`);
      return;
    }

    const jsonFiles = fs.readdirSync(bulkDir).filter(f => f.toLowerCase().endsWith('.json'));
    if (jsonFiles.length === 0) {
      console.error(`No .json files found in: ${bulkDir}`);
      return;
    }

    const latest = jsonFiles
      .map(f => ({ name: f, mtime: fs.statSync(path.join(bulkDir, f)).mtime.getTime() }))
      .sort((a, b) => b.mtime - a.mtime)[0].name;

    filePath = path.join(bulkDir, latest);
  } catch (err) {
    console.error('Error locating JSON file in bulkData:', err);
    return;
  }

  try {
    console.log('Starting card sync (streamed)...', filePath);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    await streamBulkFile(filePath);
  } catch (error) {
    console.error('Error syncing cards:', error);
  }
}

if (require.main === module) {
  console.log('runSync.js invoked directly — starting sync...');
  (async () => {
    try {
      await syncCards();
      console.log('run finished.');
    } catch (err) {
      console.error('Fatal error running syncCards:', err);
      process.exitCode = 1;
    }
  })();
}

module.exports = { syncCards };