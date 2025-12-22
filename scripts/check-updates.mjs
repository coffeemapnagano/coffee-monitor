import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// パス設定: プロジェクトルートの data/ ディレクトリに出力
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');
const HASHES_FILE = path.join(DATA_DIR, 'shop-hashes.json');

// ショップリスト定義
const SHOPS = [
  // 既存データ
  { id: 'glitch', name: 'GLITCH COFFEE & ROASTERS', url: 'https://glitchcoffeeroasters.myshopify.com/' },
  { id: 'onibus', name: 'Onibus Coffee', url: 'https://onibuscoffee.com/' },
  { id: 'mel', name: 'Mel Coffee Roasters', url: 'https://melcoffee.shop/' },
  { id: 'weekenders', name: 'Weekenders Coffee', url: 'https://weekenderscoffee.com/' },
  { id: 'rec', name: 'REC COFFEE', url: 'https://rec-coffee.com/' },
  { id: 'fuglen', name: 'Fuglen Coffee', url: 'https://fuglencoffee.jp/' },
  { id: 'post', name: 'PostCoffee', url: 'https://postcoffee.co/' },
  { id: 'kurasu', name: 'KURASU Kyoto', url: 'https://jp.kurasu.kyoto/' },
  { id: 'philocoffea', name: 'Philocoffea', url: 'https://philocoffea.com/' },
  { id: 'lightup', name: 'Light Up Coffee', url: 'https://lightupcoffee.com/' },
  
  // 北海道
  { id: '8agarage', name: '8A GARAGE', url: 'https://onlineshop-p.8agarage.co.jp/' },
  { id: 'ishibashi', name: 'ISHIBASHI COFFEE', url: 'https://ishibashicoffee.stores.jp/' },
  { id: 'tokeinonai', name: '時計のない喫茶店', url: 'https://tokeinonai.thebase.in/' },
  { id: 'coffee-node', name: 'COFFEE NODE', url: 'https://www.coffee-node.com/' },
  { id: 'oniyanma', name: 'Oniyanma Coffee', url: 'https://oniyanmacoffee.jp/' },
  { id: 'fenrir', name: 'FENRIR BEVERAGE', url: 'https://www.fenrirbeverage.com/' },
  { id: 'sawara', name: 'SAWARA COFFEE', url: 'https://sawaracoffee.com/' },
  { id: 'kura', name: 'Kura Coffee', url: 'https://kuracoffee.official.ec/' },
  { id: 'baristart', name: 'BARISTART COFFEE', url: 'https://www.baristartcoffee.com/' },
  { id: 'kotan', name: 'KOTAN', url: 'https://kotan.theshop.jp/' },
  { id: 'standard', name: 'STANDARD COFFEE LAB.', url: 'https://standardcoffeelab.com/' },
  { id: 'sprout', name: 'SPROUT', url: 'https://sproutstore.thebase.in/' },
  { id: 'ritaru', name: 'RITARU COFFEE', url: 'https://shop.ritaru.com/' },
  { id: 'sountra', name: 'SOUNTRA COFFEE', url: 'https://sountra.theshop.jp/' },
  { id: 'taneyaka', name: 'TANEYAKA', url: 'https://taneyaka.shop/' },
  { id: 'canaan', name: 'CANAAN COFFEE', url: 'https://canaancoffee.thebase.in/' },
  { id: 'alchemist', name: 'Alchemist Coffee', url: 'https://www.alchemist-coffee.com/' },

  // 青森県
  { id: 'coffeeman', name: 'COFFEE MAN good', url: 'https://coffeemangood.stores.jp/' },
  { id: 'wada', name: 'Wada Coffee', url: 'https://wadacoffee.com/' },

  // 岩手県
  { id: 'aurora', name: 'Aurora Coffee Roasters', url: 'https://www.auroracoffeeroasters.jp/' },
  { id: 'nagasawa', name: 'Nagasawa Coffee', url: 'https://www.nagasawa-coffee.net/product-list' },
  { id: 'rokugatsu', name: '六月の鹿', url: 'https://rokugatsunoshika.stores.jp/' },

  // 宮城県
  { id: 'flatwhite', name: 'FLAT WHITE COFFEE', url: 'https://flatwhite.jp/' },
  { id: 'invitro', name: 'IN VITRO COFFEE', url: 'https://invitro.thebase.in/' },
  { id: 'keyaki', name: 'KEYAKI COFFEE', url: 'https://keyakicoffee.base.shop/' },
  { id: 'honoka', name: 'HONOKA COFFEE', url: 'https://ec.honokacoffee.com/' },
  { id: 'public', name: 'PUBLIC COFFEE', url: 'https://publiccoffee.thebase.in/' },
  { id: 'kuriya', name: 'Kuriya Coffee Roasters', url: 'https://www.kuriya-lab.com/coffee-beans-store/' },
  { id: 'balmusette', name: 'BAL MUSETTE', url: 'https://balmusette.thebase.in/' },
  { id: '45coffee', name: '45 COFFEE', url: 'https://45coffee.theshop.jp/' },
  { id: 'spark', name: 'SPARK COFFEE ROASTERS', url: 'https://www.sparkcoffeeroasters.com/' },
  { id: 'darestore', name: 'DARESTORE', url: 'https://darestore-jp.myshopify.com/' },
  { id: 'cantus', name: 'COFFEE CANTUS', url: 'https://coffeecantus.base.shop/' },
  { id: 'apartment', name: 'The Apartment', url: 'https://theapartment.base.shop/' },

  // 秋田県
  { id: '08coffee', name: '08COFFEE', url: 'https://08coffee.thebase.in/' },

  // 山形県
  { id: 'yukihira', name: 'YUKIHIRA COFFEE', url: 'https://www.yukihiracoffee.com/' },
  { id: 'paradiso', name: 'Paradiso', url: 'https://paradiso.shop-pro.jp/' },
  { id: 'tsuki', name: 'TSUKI COFFEE', url: 'https://tsukicoffee.official.ec/' },
  { id: '0123', name: '0123 COFFEE', url: 'https://0123coffee.stores.jp/' },

  // 福島県
  { id: 'obros', name: 'OBROS COFFEE', url: 'https://obroscoffee.jp/' },
  { id: 'koshiba', name: 'KOSHIBA COFFEE', url: 'https://koshibaga.base.shop/' },
  { id: 'bahnhof', name: 'COFFEE BAHNHOF', url: 'https://bahnhof.official.ec/' },
  { id: 'unit', name: 'Unit Coffee', url: 'https://unitcoffee.base.shop/' },
  { id: 'nichinichi', name: 'Nichi Nichi Coffee', url: 'https://nichi-nichi-coffee.stores.jp/' },
  { id: 'boushi', name: 'BOUSHI COFFEE', url: 'https://boushicoffee.thebase.in/' },
  { id: 'wave', name: 'WAVE COFFEE', url: 'https://wavecoffee2.base.shop/' },

  // 茨城県
  { id: 'knot', name: 'KNOT COFFEE', url: 'https://knot-coffee.shop-pro.jp/' },
  { id: 'hitachino', name: 'HITACHINO COFFEE', url: 'https://hitachino-coffee.com/' },
  { id: 'factory', name: 'COFFEE FACTORY', url: 'http://coffeefactory.jp/' },
  { id: 'mood', name: 'MOOD COFFEE & ESPRESSO', url: 'https://moodcoffee-espresso.com/' },
  { id: 'bankoku', name: 'BANKOKU COFFEE', url: 'https://bankoku-coffeeshop.com/' },
  { id: 'saza', name: 'SAZA COFFEE', url: 'https://saza.coffee/' },
  { id: 'washi', name: '鷲の工房', url: 'https://washi-no-kobo.stores.jp/' },

  // 栃木県
  { id: 'fujinuma', name: 'CAFE FUJINUMA', url: 'http://cafefujinuma.com/' },
  { id: 'konnichi', name: 'KONNICHI COFFEE', url: 'https://konnichilabo.base.shop/' },
  { id: 'bluetokai', name: 'Blue Tokai Coffee', url: 'https://www.bluetokaicoffee.jp/collections/coffee' },
  { id: 'mokkei', name: 'MOKKEI COFFEE', url: 'https://mokkeicoffee.com/' },
  { id: 'mamechamame', name: 'Mamecha Mame', url: 'https://www.mamechamame.com/s/shop' },
  { id: 'kametokame', name: 'Kame to Kame', url: 'https://kametokame.theshop.jp/' },
  { id: 'mateship', name: 'MATESHIP', url: 'https://mateship.base.shop/' },

  // 群馬県
  { id: 'warmth', name: 'WARMTH', url: 'https://mainwarmth.stores.jp/' },
  { id: 'niksen', name: 'NIKSEN', url: 'https://niksen.stores.jp/' },
  { id: 'shikishima', name: 'SHIKISHIMA COFFEE', url: 'https://shikishima.coffee/' },
  { id: '13coffee', name: '13 COFFEE ROASTERS', url: 'https://13coffee.com/' },
  { id: 'pyramid', name: 'PYRAMID COFFEE', url: 'https://pyramid.base.shop/' },
  { id: 'tonbi', name: 'TONBI COFFEE', url: 'https://tonbi-coffee.com/' },
  { id: 'reboot', name: 'REBOOT COFFEE', url: 'https://reboot.base.ec/' },
  { id: 'norrys', name: 'Norry\'s Coffee', url: 'https://norryscoffee.theshop.jp/' },

  // 埼玉県
  { id: 'coffeepost', name: 'COFFEE POST', url: 'https://coffeepost.base.shop/' },
  { id: 'koyanagi', name: 'KOYANAGI COFFEE', url: 'https://www.koyanagicoffeenippon.com/' }
];

// ハッシュ計算関数
function calculateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
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
  for (const shop of SHOPS) {
    console.log(`Checking ${shop.name}...`);
    
    try {
      // タイムアウト付きでフェッチ (15秒)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
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
      const newHash = calculateHash(html);
      
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
    await delay(2000);
  }

  // 結果の保存
  const updateData = {
    timestamp: checkTime.toISOString(),
    date: checkTime.toLocaleDateString('ja-JP'),
    totalShops: SHOPS.length,
    updatedShops: updatedShops
  };

  await fs.writeFile(UPDATES_FILE, JSON.stringify(updateData, null, 2));
  await fs.writeFile(HASHES_FILE, JSON.stringify(currentHashes, null, 2));

  console.log('----------------------------------------');
  console.log(`Check complete. ${updatedShops.length} updates found.`);
  console.log(`Data saved to ${DATA_DIR}`);
}

main().catch(console.error);
