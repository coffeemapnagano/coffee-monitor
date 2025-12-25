import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// パス設定: プロジェクトルートの data/ ディレクトリに出力
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');
const HASHES_FILE = path.join(DATA_DIR, 'shop-hashes.json');
const SHOPS_FILE = path.join(DATA_DIR, 'shops.json');

// ハッシュ計算関数
function calculateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// コンテンツの正規化（ノイズ除去）
function normalizeContent(html) {
  if (!html) return "";
  
  // 1. script, style, noscript, iframe タグとその中身を削除
  let clean = html.replace(/<(script|style|noscript|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // 2. コメント削除
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');
  
  // 3. HTMLタグを削除してテキストのみにする
  clean = clean.replace(/<[^>]+>/g, ' ');
  
  // 4. HTMLエンティティのデコード（簡易）
  clean = clean.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"');

  // 5. 連続する空白・改行を1つのスペースに置換し、トリミング
  return clean.replace(/\s+/g, ' ').trim();
}

// 遅延関数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('☕ Starting Coffee Shop Update Check...');

  // データディレクトリの確認
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    // ディレクトリが既にある場合は無視
  }

  // ショップリストをJSONファイルから読み込む
  let shops = [];
  try {
    const shopsData = await fs.readFile(SHOPS_FILE, 'utf-8');
    shops = JSON.parse(shopsData);
    console.log(`Loaded ${shops.length} shops from shops.json`);
  } catch (error) {
    console.error('Error loading shops.json:', error.message);
    process.exit(1);
  }

  // 以前のハッシュを読み込み
  let previousHashes = {};
  try {
    const data = await fs.readFile(HASHES_FILE, 'utf-8');
    previousHashes = JSON.parse(data);
  } catch (error) {
    console.log('No previous hash file found. Creating new one.');
  }

  const updatedShops = [];
  const currentHashes = { ...previousHashes };
  const checkTime = new Date();

  // 各ショップをチェック
  for (const shop of shops) {
    console.log(`Checking ${shop.name}...`);
    
    try {
      // タイムアウトを30秒に設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(shop.url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'CoffeeShopMonitor/1.0.0 (GitHub Actions)'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // 正規化したコンテンツでハッシュを計算（誤検知対策）
      const normalizedContent = normalizeContent(html);
      const newHash = calculateHash(normalizedContent);
      
      // 更新判定
      const prevData = previousHashes[shop.id];
      
      if (!prevData || prevData.hash !== newHash) {
        console.log(`✨ Update detected for ${shop.name}`);
        updatedShops.push({
          id: shop.id,
          name: shop.name,
          url: shop.url,
          detectedAt: checkTime.toISOString()
        });
      } else {
        console.log(`- No changes for ${shop.name}`);
      }

      // 最新状態を保存
      currentHashes[shop.id] = {
        hash: newHash,
        name: shop.name,
        url: shop.url,
        lastChecked: checkTime.toISOString()
      };

    } catch (error) {
      console.error(`❌ Error checking ${shop.name}:`, error.message);
    }

    // サーバーへの負荷を避けるため少し待機
    await delay(1000);
  }

  // 結果の保存
  const updateData = {
    timestamp: checkTime.toISOString(),
    date: checkTime.toLocaleDateString('ja-JP'),
    totalShops: shops.length,
    updatedShops: updatedShops
  };

  await fs.writeFile(UPDATES_FILE, JSON.stringify(updateData, null, 2));
  await fs.writeFile(HASHES_FILE, JSON.stringify(currentHashes, null, 2));

  console.log('----------------------------------------');
  console.log(`Check complete. ${updatedShops.length} updates found.`);
  console.log(`Data saved to ${DATA_DIR}`);
}

main().catch(console.error);
