import Phaser from 'phaser';
import { GRASS, GROUND, SIDEWALK, ROAD, WATER, BUILDINGS, TREES, LAMP } from '../TileData.js';

const TILE = 64;
const SUBTILE = 8; // 每個圖磚 8px
const CELLS = 8;   // 每個遊戲格 = 8×8 個圖磚

// 台灣街頭：大量機車 + 各種車輛
// 保留原始 PNG 車輛 + 新增圖磚車輛
const NPC_TYPES_H = [
  'scooter', 'scooter', 'scooter',
  'tileCarRedH', 'tileCarGreenH', 'tileCarYellowH', 'tileBusH',
  'npcTaxi', 'npcSedan', 'npcRed', 'npcGreen', 'npcBus',
];
const NPC_TYPES_V = [
  'scooter', 'scooter', 'scooter',
  'tileCarBlueV', 'tileCarRedV', 'tileCarRed2V', 'tileTruckV',
  'npcPolice', 'npcTruck', 'npcSports', 'npcAmbulance',
];
const TILE_H_VEHICLES = new Set(['tileCarRedH', 'tileCarGreenH', 'tileCarYellowH', 'tileBusH']);
const TILE_V_VEHICLES = new Set(['tileCarBlueV', 'tileCarRedV', 'tileCarRed2V', 'tileTruckV']);

// ===== 台灣城市關卡定義 =====
// 根據真實新竹市古蹟地圖重新設計
// 參考：tonyhuang39.com/tony0508/map508.gif
//
// 地圖方位：上=北，下=南，左=西，右=東
// 核心地標相對位置（根據地圖）：
// - 新竹車站在右下方（東南）
// - 城隍廟在中間偏左上（西北方向）
// - 東門圓環（迎曦門）在中間，護城河穿過
// - 護城河從右上(東北)往左下(西南)斜向流
// - 經國路在最左（西側），中正路偏左貫穿南北
// - 北大路從左上斜向右上（斜向道路）
// - 中華路在東門圓環東側往右延伸
// - 林森路在車站上方橫向
const LEVELS = [
  {
    name: '新竹市區',
    mapW: 48, mapH: 40,
    hRoads: [
      // === 主幹道 ===
      { y: [5, 6], x1: 0, x2: 47 },        // 西大路/東大路（北側）
      { y: [13, 14], x1: 0, x2: 47 },       // 北門街橫段/府後街
      { y: [21, 22], x1: 0, x2: 47 },       // 東門街（經過東門圓環，核心橫向）
      { y: [29, 30], x1: 0, x2: 47 },       // 林森路（車站北側）
      { y: [37, 38], x1: 5, x2: 42 },       // 西大路南段
      // === 次要道路 ===
      { y: [9, 10], x1: 5, x2: 28 },        // 中山路（城隍廟前方）
      { y: [17, 18], x1: 12, x2: 40 },      // 民富街/文化街
      { y: [25, 26], x1: 8, x2: 35 },       // 南門街/石坊街
      { y: [33, 34], x1: 10, x2: 38 },      // 中正路橫段（車站前）
    ],
    vRoads: [
      // === 主幹道 ===
      { x: [4, 5], y1: 0, y2: 39 },         // 經國路（最西側主幹道）
      { x: [13, 14], y1: 0, y2: 39 },        // 北門街/中正路（南北向核心）
      { x: [22, 23], y1: 0, y2: 39 },        // 東門街縱段/中央路
      { x: [31, 32], y1: 0, y2: 39 },        // 民族路/文化街
      { x: [40, 41], y1: 0, y2: 39 },        // 中華路二段/東大路
      // === 次要道路 ===
      { x: [9, 10], y1: 5, y2: 26 },         // 大同路/世界街
      { x: [18, 19], y1: 9, y2: 30 },        // 南門街縱段
      { x: [27, 28], y1: 5, y2: 34 },        // 府後街/東門街
      { x: [36, 37], y1: 13, y2: 38 },       // 光復路
    ],
    // 護城河座標（斜向，從東北到西南）
    moat: [
      { x: 35, y: 11 }, { x: 34, y: 12 }, { x: 33, y: 13 }, { x: 32, y: 14 },
      { x: 31, y: 15 }, { x: 30, y: 16 }, { x: 29, y: 17 }, { x: 28, y: 18 },
      { x: 27, y: 19 }, { x: 26, y: 20 },
      // 護城河在東門圓環處轉彎往西南
      { x: 25, y: 21 }, { x: 24, y: 22 }, { x: 23, y: 23 },
      { x: 22, y: 24 }, { x: 21, y: 25 }, { x: 20, y: 26 },
      { x: 19, y: 27 }, { x: 18, y: 28 },
    ],
    // POI 放在路旁建築區（非馬路上）
    pois: [
      { key: 'poi1', gridX: 11, gridY: 11, texture: 'poiTemple', label: '城隍廟', color: 0xef4444 },
      { key: 'poi2', gridX: 38, gridY: 31, texture: 'poiStation', label: '新竹車站', color: 0x3b82f6 },
      { key: 'poi3', gridX: 34, gridY: 15, texture: 'poiMall', label: '巨城 Big City', color: 0x8b5cf6 },
      { key: 'poi4', gridX: 43, gridY: 7, texture: 'poiOffice', label: '園區公司', color: 0x22c55e },
    ],
    landmarks: [
      { x: 25, y: 21, label: '東門 迎曦門', radius: 2 },
    ],
    quests: [
      '📋 任務1：去城隍廟吃米粉貢丸當早餐',
      '📋 任務2：騎到新竹車站接包裹',
      '📋 任務3：去巨城 Big City 買咖啡',
      '📋 任務4：趕去園區公司打卡上班！',
      '🎉 新竹關完成！你是風城最強通勤王！',
    ],
    roadLabels: [
      { text: '東大路', x: 24, y: 5 },
      { text: '北門街', x: 9, y: 13 },
      { text: '府後街', x: 28, y: 13 },
      { text: '東門街', x: 12, y: 21 },
      { text: '中華路', x: 38, y: 21 },
      { text: '林森路', x: 24, y: 29 },
      { text: '中山路', x: 16, y: 9 },
      { text: '民富街', x: 26, y: 17 },
      { text: '南門街', x: 18, y: 25 },
      { text: '中正路', x: 13, y: 34 },
      { text: '經國路', x: 4, y: 20 },
      { text: '中正路', x: 13, y: 20 },
      { text: '中央路', x: 22, y: 16 },
      { text: '民族路', x: 31, y: 20 },
      { text: '中華路二段', x: 40, y: 16 },
      { text: '大同路', x: 9, y: 16 },
      { text: '文化街', x: 31, y: 10 },
      { text: '光復路', x: 36, y: 26 },
      { text: '西大路', x: 24, y: 37 },
      { text: '護城河', x: 30, y: 15 },
    ],
    playerStart: { x: 14, y: 17 },  // 從中正路/民富街交叉口出發
    deadlineMs: 200000,
    rainAfterStage: 2,
  },

  // ===== 第 2 關：台中市區 =====
  {
    name: '台中市區',
    mapW: 50, mapH: 42,
    hRoads: [
      { y: [4, 5], x1: 0, x2: 49 },         // 自由路
      { y: [12, 13], x1: 0, x2: 49 },        // 三民路
      { y: [20, 21], x1: 0, x2: 49 },        // 台灣大道（核心主幹）
      { y: [28, 29], x1: 0, x2: 49 },        // 公益路
      { y: [36, 37], x1: 4, x2: 45 },        // 建國路
      { y: [8, 9], x1: 6, x2: 32 },          // 英才路
      { y: [16, 17], x1: 10, x2: 40 },       // 中正路橫段
      { y: [24, 25], x1: 8, x2: 38 },        // 民權路
      { y: [32, 33], x1: 12, x2: 42 },       // 進化路
    ],
    vRoads: [
      { x: [4, 5], y1: 0, y2: 41 },          // 經國路
      { x: [13, 14], y1: 0, y2: 41 },         // 中正路縱向
      { x: [22, 23], y1: 0, y2: 41 },         // 文心路
      { x: [31, 32], y1: 0, y2: 41 },         // 復興路
      { x: [40, 41], y1: 0, y2: 41 },         // 東大路
      { x: [9, 10], y1: 4, y2: 29 },          // 五權路
      { x: [18, 19], y1: 8, y2: 37 },         // 美村路
      { x: [27, 28], y1: 4, y2: 33 },         // 大墩路
      { x: [36, 37], y1: 12, y2: 41 },        // 文心南路
    ],
    moat: [
      { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 },
      { x: 15, y: 7 }, { x: 16, y: 7 }, { x: 17, y: 7 },
      { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 },
    ],
    pois: [
      { key: 'poi1', gridX: 11, gridY: 15, texture: 'poiTemple', label: '宮原眼科', color: 0xef4444 },
      { key: 'poi2', gridX: 33, gridY: 38, texture: 'poiStation', label: '台中車站', color: 0x3b82f6 },
      { key: 'poi3', gridX: 6, gridY: 3, texture: 'poiMall', label: '逢甲夜市', color: 0xf59e0b },
      { key: 'poi4', gridX: 43, gridY: 22, texture: 'poiOffice', label: '台中辦公室', color: 0x22c55e },
    ],
    landmarks: [
      { x: 16, y: 7, label: '台中公園 湖心亭', radius: 2 },
    ],
    quests: [
      '📋 任務1：去宮原眼科買冰淇淋當早餐',
      '📋 任務2：騎到台中車站收取快遞',
      '📋 任務3：去逢甲夜市買一份大腸包小腸',
      '📋 任務4：趕去台中辦公室打卡上班！',
      '🎉 台中關完成！你是文心路最強通勤王！',
    ],
    roadLabels: [
      { text: '自由路', x: 24, y: 4 },
      { text: '三民路', x: 24, y: 12 },
      { text: '台灣大道', x: 24, y: 20 },
      { text: '公益路', x: 24, y: 28 },
      { text: '建國路', x: 24, y: 36 },
      { text: '英才路', x: 18, y: 8 },
      { text: '中正路', x: 25, y: 16 },
      { text: '民權路', x: 22, y: 24 },
      { text: '進化路', x: 26, y: 32 },
      { text: '經國路', x: 4, y: 20 },
      { text: '文心路', x: 22, y: 16 },
      { text: '復興路', x: 31, y: 20 },
      { text: '東大路', x: 40, y: 20 },
      { text: '五權路', x: 9, y: 20 },
      { text: '美村路', x: 18, y: 22 },
      { text: '大墩路', x: 27, y: 20 },
      { text: '文心南路', x: 36, y: 28 },
      { text: '台中公園', x: 16, y: 5 },
    ],
    playerStart: { x: 14, y: 20 },
    deadlineMs: 210000,
    rainAfterStage: 2,
  },

  // ===== 第 3 關：彰化市區 =====
  {
    name: '彰化市區',
    mapW: 40, mapH: 34,
    hRoads: [
      { y: [4, 5], x1: 0, x2: 39 },          // 中山路
      { y: [12, 13], x1: 0, x2: 39 },         // 中正路
      { y: [20, 21], x1: 0, x2: 39 },         // 民生路
      { y: [28, 29], x1: 4, x2: 35 },         // 光復路
      { y: [8, 9], x1: 5, x2: 26 },           // 永樂街
      { y: [16, 17], x1: 8, x2: 32 },         // 中華路橫段
      { y: [24, 25], x1: 6, x2: 30 },         // 南郭路
      { y: [31, 32], x1: 10, x2: 34 },        // 彰南路
    ],
    vRoads: [
      { x: [4, 5], y1: 0, y2: 33 },           // 中華路
      { x: [12, 13], y1: 0, y2: 33 },          // 民族路
      { x: [20, 21], y1: 0, y2: 33 },          // 成功路
      { x: [28, 29], y1: 0, y2: 33 },          // 光復路縱向
      { x: [8, 9], y1: 4, y2: 21 },            // 中正路縱段
      { x: [16, 17], y1: 8, y2: 29 },          // 和平路
      { x: [24, 25], y1: 4, y2: 28 },          // 三民路縱向
      { x: [33, 34], y1: 12, y2: 33 },         // 卦山路
    ],
    moat: [
      { x: 7, y: 10 }, { x: 8, y: 10 },
      { x: 7, y: 11 }, { x: 8, y: 11 },
      { x: 6, y: 14 }, { x: 7, y: 14 },
      { x: 6, y: 15 }, { x: 7, y: 15 },
    ],
    pois: [
      { key: 'poi1', gridX: 35, gridY: 10, texture: 'poiTemple', label: '八卦山大佛', color: 0xf59e0b },
      { key: 'poi2', gridX: 3, gridY: 7, texture: 'poiStation', label: '彰化車站', color: 0x3b82f6 },
      { key: 'poi3', gridX: 3, gridY: 22, texture: 'poiMall', label: '扇形車庫', color: 0xa78bfa },
      { key: 'poi4', gridX: 22, gridY: 15, texture: 'poiOffice', label: '彰化辦公室', color: 0x22c55e },
    ],
    landmarks: [
      { x: 34, y: 9, label: '八卦山入口', radius: 1 },
    ],
    quests: [
      '📋 任務1：去八卦山大佛下吃爌肉飯',
      '📋 任務2：騎到彰化車站等同事',
      '📋 任務3：去扇形車庫拍火車打卡',
      '📋 任務4：趕去彰化辦公室打卡上班！',
      '🎉 彰化關完成！你是卦山下最強通勤騎士！',
    ],
    roadLabels: [
      { text: '中山路', x: 18, y: 4 },
      { text: '中正路', x: 18, y: 12 },
      { text: '民生路', x: 18, y: 20 },
      { text: '光復路', x: 18, y: 28 },
      { text: '永樂街', x: 14, y: 8 },
      { text: '中華路', x: 18, y: 16 },
      { text: '南郭路', x: 16, y: 24 },
      { text: '彰南路', x: 20, y: 31 },
      { text: '中華路', x: 4, y: 16 },
      { text: '民族路', x: 12, y: 16 },
      { text: '成功路', x: 20, y: 16 },
      { text: '光復路', x: 28, y: 16 },
      { text: '和平路', x: 16, y: 20 },
      { text: '三民路', x: 24, y: 20 },
      { text: '卦山路', x: 33, y: 22 },
      { text: '護城溪', x: 7, y: 11 },
    ],
    playerStart: { x: 13, y: 20 },
    deadlineMs: 180000,
    rainAfterStage: 1,
  },

  // ===== 第 4 關：台南市區 =====
  {
    name: '台南市區',
    mapW: 48, mapH: 40,
    hRoads: [
      { y: [4, 5], x1: 0, x2: 47 },          // 北門路
      { y: [12, 13], x1: 0, x2: 47 },         // 民族路
      { y: [20, 21], x1: 0, x2: 47 },         // 民生路
      { y: [28, 29], x1: 0, x2: 47 },         // 府前路
      { y: [36, 37], x1: 4, x2: 43 },         // 南門路
      { y: [8, 9], x1: 6, x2: 35 },           // 成功路
      { y: [16, 17], x1: 8, x2: 38 },         // 中正路
      { y: [24, 25], x1: 6, x2: 34 },         // 永福路
      { y: [32, 33], x1: 10, x2: 40 },        // 樹林街
    ],
    vRoads: [
      { x: [4, 5], y1: 0, y2: 39 },           // 西門路
      { x: [13, 14], y1: 0, y2: 39 },          // 中正路縱向
      { x: [22, 23], y1: 0, y2: 39 },          // 海安路
      { x: [31, 32], y1: 0, y2: 39 },          // 成功路縱向
      { x: [40, 41], y1: 0, y2: 39 },          // 東門路
      { x: [9, 10], y1: 4, y2: 29 },           // 民權路縱段
      { x: [18, 19], y1: 8, y2: 37 },          // 永福路縱段
      { x: [27, 28], y1: 4, y2: 33 },          // 友愛路縱段
      { x: [36, 37], y1: 12, y2: 39 },         // 長榮路
    ],
    moat: [
      { x: 4, y: 32 }, { x: 5, y: 32 }, { x: 6, y: 32 },
      { x: 7, y: 32 }, { x: 8, y: 32 }, { x: 9, y: 32 },
      { x: 4, y: 33 }, { x: 5, y: 33 }, { x: 6, y: 33 },
      { x: 7, y: 33 }, { x: 8, y: 33 }, { x: 9, y: 33 },
    ],
    pois: [
      { key: 'poi1', gridX: 11, gridY: 15, texture: 'poiTemple', label: '赤崁樓', color: 0xef4444 },
      { key: 'poi2', gridX: 2, gridY: 22, texture: 'poiTemple', label: '安平古堡', color: 0xf59e0b },
      { key: 'poi3', gridX: 15, gridY: 18, texture: 'poiMall', label: '林百貨', color: 0xa78bfa },
      { key: 'poi4', gridX: 43, gridY: 21, texture: 'poiOffice', label: '台南辦公室', color: 0x22c55e },
    ],
    landmarks: [
      { x: 14, y: 30, label: '大南門', radius: 1 },
    ],
    quests: [
      '📋 任務1：去赤崁樓旁吃碗牛肉湯當早餐',
      '📋 任務2：騎到安平古堡買蝦餅伴手禮',
      '📋 任務3：去林百貨頂樓拍台南風景',
      '📋 任務4：趕去台南辦公室打卡上班！',
      '🎉 台南關完成！你是府城最強通勤王！',
    ],
    roadLabels: [
      { text: '北門路', x: 22, y: 4 },
      { text: '民族路', x: 22, y: 12 },
      { text: '民生路', x: 22, y: 20 },
      { text: '府前路', x: 22, y: 28 },
      { text: '南門路', x: 22, y: 36 },
      { text: '成功路', x: 18, y: 8 },
      { text: '中正路', x: 22, y: 16 },
      { text: '永福路', x: 18, y: 24 },
      { text: '樹林街', x: 24, y: 32 },
      { text: '西門路', x: 4, y: 20 },
      { text: '海安路', x: 22, y: 14 },
      { text: '成功路', x: 31, y: 20 },
      { text: '東門路', x: 40, y: 20 },
      { text: '民權路', x: 9, y: 20 },
      { text: '永福路', x: 18, y: 20 },
      { text: '友愛路', x: 27, y: 20 },
      { text: '長榮路', x: 36, y: 28 },
      { text: '台南運河', x: 7, y: 32 },
    ],
    playerStart: { x: 14, y: 20 },
    deadlineMs: 220000,
    rainAfterStage: 2,
  },

  // ===== 第 5 關：台北市區 =====
  {
    name: '台北市區',
    mapW: 56, mapH: 46,
    hRoads: [
      { y: [4, 5], x1: 0, x2: 55 },          // 民權東路
      { y: [12, 13], x1: 0, x2: 55 },         // 南京東路
      { y: [20, 21], x1: 0, x2: 55 },         // 忠孝東路
      { y: [28, 29], x1: 0, x2: 55 },         // 仁愛路
      { y: [36, 37], x1: 0, x2: 55 },         // 信義路
      { y: [42, 43], x1: 4, x2: 51 },         // 羅斯福路
      { y: [8, 9], x1: 6, x2: 40 },           // 長安東路
      { y: [16, 17], x1: 8, x2: 44 },         // 市民大道
      { y: [24, 25], x1: 6, x2: 42 },         // 和平東路
      { y: [32, 33], x1: 10, x2: 50 },        // 辛亥路
      { y: [39, 40], x1: 8, x2: 48 },         // 基隆路橫段
    ],
    vRoads: [
      { x: [4, 5], y1: 0, y2: 45 },           // 中山北路
      { x: [13, 14], y1: 0, y2: 45 },          // 中華路
      { x: [22, 23], y1: 0, y2: 45 },          // 復興南路
      { x: [31, 32], y1: 0, y2: 45 },          // 敦化南路
      { x: [40, 41], y1: 0, y2: 45 },          // 光復南路
      { x: [49, 50], y1: 0, y2: 45 },          // 松壽路
      { x: [9, 10], y1: 4, y2: 37 },           // 林森北路
      { x: [18, 19], y1: 8, y2: 43 },          // 新生南路
      { x: [27, 28], y1: 4, y2: 40 },          // 建國南路
      { x: [36, 37], y1: 12, y2: 45 },         // 基隆路縱向
      { x: [45, 46], y1: 4, y2: 42 },          // 逸仙路
    ],
    pois: [
      { key: 'poi1', gridX: 6, gridY: 19, texture: 'poiMall', label: '西門町', color: 0xec4899 },
      { key: 'poi2', gridX: 51, gridY: 38, texture: 'poiStation', label: '台北101', color: 0x06b6d4 },
      { key: 'poi3', gridX: 11, gridY: 22, texture: 'poiStation', label: '台北車站', color: 0x3b82f6 },
      { key: 'poi4', gridX: 47, gridY: 34, texture: 'poiOffice', label: '信義區辦公室', color: 0x22c55e },
    ],
    landmarks: [
      { x: 18, y: 34, label: '中正紀念堂', radius: 2 },
    ],
    quests: [
      '📋 任務1：去西門町買雞排配珍奶',
      '📋 任務2：騎去台北101觀景台打卡',
      '📋 任務3：去台北車站收重要包裹',
      '📋 任務4：趕去信義區辦公室打卡上班！',
      '🎉 台北關完成！你是首都最強通勤機車騎士！',
    ],
    roadLabels: [
      { text: '民權東路', x: 26, y: 4 },
      { text: '南京東路', x: 26, y: 12 },
      { text: '忠孝東路', x: 26, y: 20 },
      { text: '仁愛路', x: 26, y: 28 },
      { text: '信義路', x: 26, y: 36 },
      { text: '羅斯福路', x: 26, y: 42 },
      { text: '長安東路', x: 20, y: 8 },
      { text: '市民大道', x: 24, y: 16 },
      { text: '和平東路', x: 22, y: 24 },
      { text: '辛亥路', x: 28, y: 32 },
      { text: '基隆路', x: 26, y: 39 },
      { text: '中山北路', x: 4, y: 20 },
      { text: '中華路', x: 13, y: 20 },
      { text: '復興南路', x: 22, y: 14 },
      { text: '敦化南路', x: 31, y: 20 },
      { text: '光復南路', x: 40, y: 20 },
      { text: '松壽路', x: 49, y: 28 },
      { text: '林森北路', x: 9, y: 20 },
      { text: '新生南路', x: 18, y: 20 },
      { text: '建國南路', x: 27, y: 14 },
      { text: '基隆路', x: 36, y: 30 },
      { text: '逸仙路', x: 45, y: 20 },
      { text: '中正紀念堂', x: 18, y: 32 },
    ],
    playerStart: { x: 23, y: 20 },
    deadlineMs: 250000,
    rainAfterStage: 2,
  },
];

export default class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  create() {
    this.levelIndex = this.registry.get('levelIndex') || 0;
    this.level = LEVELS[this.levelIndex];
    this.MAP_W = this.level.mapW;
    this.MAP_H = this.level.mapH;

    this.score = this.registry.get('score') || 0;
    this.combo = 1;
    this.lastCoinTime = 0;
    this.isBoosting = false;
    this.boostFuel = 100;
    this.invincible = false;
    this.gameOver = false;
    this.gameWon = false;
    this.baseSpeed = 200;
    this.npcHonkTimer = 0;

    // 預先計算道路格子集合（用於快速查詢）
    this.roadSet = new Set();
    this.hLanes = []; // 水平車道 { y, x1, x2 }（單行）
    this.vLanes = []; // 垂直車道 { x, y1, y2 }（單行）
    this.buildRoadSets();

    // 建構地圖
    this.buildMap();

    // 建立群組
    this.coins = this.physics.add.group();
    this.boosts = this.physics.add.group();
    this.timeBonuses = this.physics.add.group();
    this.npcCars = this.physics.add.group();

    // 放置金幣和道具
    this.spawnCoins();
    this.spawnPowerups();
    this.spawnNPCCars();

    // 玩家
    const ps = this.level.playerStart;
    this.player = this.physics.add.sprite(ps.x * TILE + 32, ps.y * TILE + 32, 'scooter').setScale(3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(12, 8).setOffset(2, 1);
    this.player.setDepth(5);
    this.playerDir = 'right';
    this.updatePlayerRotation();

    // 尾焰粒子
    this.exhaust = this.add.particles(0, 0, 'spark', {
      follow: this.player, followOffset: { x: -10, y: 0 },
      lifespan: 300, speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 }, alpha: { start: 0.6, end: 0 },
      quantity: 1, emitting: false,
      tint: [0xff6b35, 0xfbbf24, 0xff4444],
    });

    this.physics.world.setBounds(0, 0, this.MAP_W * TILE, this.MAP_H * TILE);
    this.cameras.main.setBounds(0, 0, this.MAP_W * TILE, this.MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.physics.add.collider(this.player, this.blockers);

    // 碰撞
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.boosts, this.collectBoost, null, this);
    this.physics.add.overlap(this.player, this.timeBonuses, this.collectTime, null, this);
    this.physics.add.collider(this.player, this.npcCars, this.hitByCar, null, this);
    // NPC 車輛之間也會碰撞（不能互穿）
    this.physics.add.collider(this.npcCars, this.npcCars);
    this.physics.add.collider(this.npcCars, this.blockers);

    // 操控
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D,E,SPACE');
    this.setupVirtualControls();

    // 音效
    this.engineSound = this.sound.add('bgmLoop', { loop: true, volume: 0.15 });
    this.engineSound.play();
    this.sfx = {
      interact: this.sound.add('sfxInteract', { volume: 0.4 }),
      coin: this.sound.add('sfxCoin', { volume: 0.3 }),
      crash: this.sound.add('sfxCrash', { volume: 0.5 }),
      hurt: this.sound.add('sfxHurt', { volume: 0.4 }),
      powerup: this.sound.add('sfxPowerup', { volume: 0.4 }),
      boost: this.sound.add('sfxBoost', { volume: 0.3 }),
      honk: this.sound.add('sfxHonk', { volume: 0.2 }),
      gameover: this.sound.add('sfxGameover', { volume: 0.5 }),
    };

    // 任務
    this.questState = { stage: 0, startAt: this.time.now, deadlineMs: this.level.deadlineMs };

    // HUD
    this.setupHUD();

    // 方向箭頭
    this.arrow = this.add.triangle(0, 0, 0, 12, 20, 0, 0, -12, 0xfbbf24)
      .setScrollFactor(0).setDepth(12).setAlpha(0.85);
    this.arrowDist = this.add.text(0, 0, '', {
      fontSize: '13px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(12).setOrigin(0.5);

    // 雨
    this.rain = this.add.particles(0, 0, 'rain', {
      x: { min: 0, max: this.MAP_W * TILE }, y: 0, lifespan: 800,
      speedY: { min: 600, max: 900 }, speedX: { min: -50, max: -100 },
      scale: { start: 0.04, end: 0.02 }, alpha: { start: 0.4, end: 0 },
      quantity: 4, emitting: false,
    });
    this.rain.setScrollFactor(0.9).setDepth(15);

    // 定時事件
    this.time.addEvent({ delay: 8000, callback: this.spawnCoins, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 15000, callback: this.spawnPowerups, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 800, callback: this.spawnNPCCars, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 20000, callback: this.randomEvent, callbackScope: this, loop: true });

    this.setStage(0);
    this.showLevelIntro();
  }

  showLevelIntro() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // 半透明黑背景
    const bg = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.65)
      .setScrollFactor(0).setDepth(50);

    const levelNum = this.add.text(cx, cy - 40, `第 ${this.levelIndex + 1} 關`, {
      fontSize: '32px', color: '#93c5fd', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setAlpha(0);

    const levelName = this.add.text(cx, cy + 20, this.level.name, {
      fontSize: '52px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setAlpha(0);

    // 淡入動畫
    this.tweens.add({
      targets: levelNum, alpha: 1, y: cy - 30, duration: 600, ease: 'Power2',
    });
    this.tweens.add({
      targets: levelName, alpha: 1, y: cy + 15, duration: 800, ease: 'Power2', delay: 300,
    });

    // 2.5 秒後淡出
    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: [bg, levelNum, levelName], alpha: 0, duration: 500,
        onComplete: () => { bg.destroy(); levelNum.destroy(); levelName.destroy(); },
      });
    });

    // 開場期間暫停玩家移動
    this.input.keyboard.enabled = false;
    this.time.delayedCall(3000, () => {
      this.input.keyboard.enabled = true;
    });
  }

  // 預先計算所有道路格子和車道
  buildRoadSets() {
    const level = this.level;
    for (const hr of level.hRoads) {
      for (const row of hr.y) {
        for (let x = hr.x1; x <= hr.x2; x++) {
          this.roadSet.add(`${x},${row}`);
        }
        this.hLanes.push({ y: row, x1: hr.x1, x2: hr.x2 });
      }
    }
    for (const vr of level.vRoads) {
      for (const col of vr.x) {
        for (let y = vr.y1; y <= vr.y2; y++) {
          this.roadSet.add(`${col},${y}`);
        }
        this.vLanes.push({ x: col, y1: vr.y1, y2: vr.y2 });
      }
    }
  }

  isRoad(x, y) {
    return this.roadSet.has(`${x},${y}`);
  }

  // 玩家能否進入某位置（像素座標）
  canPlayerEnter(px, py) {
    // 檢查玩家中心所在格子
    const gx = Math.floor(px / TILE);
    const gy = Math.floor(py / TILE);
    if (this.isRoad(gx, gy)) return true;
    // 也檢查周圍半格（玩家可能跨格）
    const margin = TILE * 0.4;
    if (this.isRoad(Math.floor((px - margin) / TILE), gy)) return true;
    if (this.isRoad(Math.floor((px + margin) / TILE), gy)) return true;
    if (this.isRoad(gx, Math.floor((py - margin) / TILE))) return true;
    if (this.isRoad(gx, Math.floor((py + margin) / TILE))) return true;
    // POI 附近 3 格內可以進入（去任務點）
    for (const p of this.level.pois) {
      if (Math.abs(gx - p.gridX) <= 2 && Math.abs(gy - p.gridY) <= 2) return true;
    }
    // 圓環附近
    for (const lm of (this.level.landmarks || [])) {
      if (Math.abs(gx - lm.x) <= 3 && Math.abs(gy - lm.y) <= 3) return true;
    }
    return false;
  }

  buildMap() {
    this.blockers = this.physics.add.staticGroup();
    this.interactives = this.physics.add.staticGroup();

    // 建立 Phaser Tilemap（每個遊戲格 = 8×8 圖磚）
    const tw = this.MAP_W * CELLS;
    const th = this.MAP_H * CELLS;
    const map = this.make.tilemap({
      tileWidth: SUBTILE, tileHeight: SUBTILE,
      width: tw, height: th,
    });
    const tileset = map.addTilesetImage('cityTiles', 'cityTiles', SUBTILE, SUBTILE);
    const terrainLayer = map.createBlankLayer('terrain', tileset);
    const buildingLayer = map.createBlankLayer('buildings', tileset);
    const objectLayer = map.createBlankLayer('objects', tileset);

    terrainLayer.setDepth(0);
    buildingLayer.setDepth(1);
    objectLayer.setDepth(2);

    // 1) 填充草地底色
    for (let ty = 0; ty < th; ty++) {
      for (let tx = 0; tx < tw; tx++) {
        const variant = ((tx * 7 + ty * 13) % 17 === 0) ? GRASS[1]
                      : ((tx * 11 + ty * 3) % 23 === 0) ? GRASS[2]
                      : GRASS[0];
        terrainLayer.putTileAt(variant, tx, ty);
      }
    }

    // 2) 填充道路
    for (let gy = 0; gy < this.MAP_H; gy++) {
      for (let gx = 0; gx < this.MAP_W; gx++) {
        if (!this.isRoad(gx, gy)) continue;
        const bx = gx * CELLS;
        const by = gy * CELLS;
        const hasL = this.isRoad(gx - 1, gy);
        const hasR = this.isRoad(gx + 1, gy);
        const hasU = this.isRoad(gx, gy - 1);
        const hasD = this.isRoad(gx, gy + 1);
        const hasH = hasL || hasR;
        const hasV = hasU || hasD;

        if (hasH && hasV) {
          // 十字路口
          this._fillCrossroad(terrainLayer, bx, by, hasL, hasR, hasU, hasD);
        } else if (hasV) {
          this._fillVerticalRoad(terrainLayer, bx, by);
        } else {
          this._fillHorizontalRoad(terrainLayer, bx, by);
        }
      }
    }

    // 3) 填充人行道
    for (let gy = 0; gy < this.MAP_H; gy++) {
      for (let gx = 0; gx < this.MAP_W; gx++) {
        if (this.isRoad(gx, gy)) continue;
        const nearRoad = this.isRoad(gx - 1, gy) || this.isRoad(gx + 1, gy) ||
                         this.isRoad(gx, gy - 1) || this.isRoad(gx, gy + 1);
        if (!nearRoad) continue;
        const bx = gx * CELLS;
        const by = gy * CELLS;
        this._fillSidewalk(terrainLayer, bx, by, gx, gy);
      }
    }

    // 4) 填充建築物
    for (let gy = 0; gy < this.MAP_H; gy++) {
      for (let gx = 0; gx < this.MAP_W; gx++) {
        if (this.isRoad(gx, gy)) continue;
        const nearRoad = this.isRoad(gx - 1, gy) || this.isRoad(gx + 1, gy) ||
                         this.isRoad(gx, gy - 1) || this.isRoad(gx, gy + 1);
        if (nearRoad) continue;
        if (gx <= 0 || gx >= this.MAP_W - 1 || gy <= 0 || gy >= this.MAP_H - 1) continue;
        const hash = (gx * 31 + gy * 17) % 7;
        if (hash !== 0 && hash !== 3) continue;

        const bx = gx * CELLS;
        const by = gy * CELLS;
        const bIdx = (gx * 7 + gy * 13) % BUILDINGS.length;
        const tmpl = BUILDINGS[bIdx];
        // 居中放置建築
        const offX = Math.floor((CELLS - tmpl.w) / 2);
        const offY = Math.floor((CELLS - tmpl.h) / 2);
        for (let r = 0; r < tmpl.h; r++) {
          for (let c = 0; c < tmpl.w; c++) {
            buildingLayer.putTileAt(tmpl.tiles[r][c], bx + offX + c, by + offY + r);
          }
        }
        // 碰撞用方塊（仍然 64px 基準）
        const cx = gx * TILE + TILE / 2;
        const cy = gy * TILE + TILE / 2;
        const block = this.add.rectangle(cx, cy, TILE, TILE, 0x000000, 0);
        this.blockers.add(block);
      }
    }

    // 5) 裝飾（樹木、路燈）
    for (let gy = 0; gy < this.MAP_H; gy++) {
      for (let gx = 0; gx < this.MAP_W; gx++) {
        if (this.isRoad(gx, gy)) continue;
        const nearRoad = this.isRoad(gx - 1, gy) || this.isRoad(gx + 1, gy) ||
                         this.isRoad(gx, gy - 1) || this.isRoad(gx, gy + 1);
        const bx = gx * CELLS;
        const by = gy * CELLS;
        const treeHash = (gx * 13 + gy * 7) % 9;

        if (nearRoad && treeHash === 0) {
          // 棕櫚樹（2 tile 高）
          objectLayer.putTileAt(TREES.PALM_TOP, bx + 3, by + 2);
          objectLayer.putTileAt(TREES.PALM_BOT, bx + 3, by + 3);
        } else if (nearRoad && treeHash === 3) {
          // 路燈
          objectLayer.putTileAt(LAMP.TOP, bx + 4, by + 3);
          objectLayer.putTileAt(LAMP.BOT, bx + 4, by + 4);
        } else if (!nearRoad && treeHash === 1) {
          // 圓形樹（空地）
          objectLayer.putTileAt(TREES.ROUND, bx + 4, by + 4);
        }
      }
    }

    this.tileMap = map;

    // 在主要路口放紅綠燈
    this.placeTrafficLights();

    // 放置路名標示
    this.placeRoadLabels();

    // POI
    this.poiKeys = [];
    this.poi = {};
    for (const p of this.level.pois) {
      this.poi[p.key] = this.createPOI(p.gridX, p.gridY, p.texture, p.label, p.color);
      this.poiKeys.push(p.key);
    }
    Object.values(this.poi).forEach((p) => this.interactives.add(p.sprite));
  }

  // ===== 道路圖磚填充輔助方法 =====

  _fillVerticalRoad(layer, bx, by) {
    // 垂直道路：左緣 + 6列中央 + 右緣
    for (let r = 0; r < CELLS; r++) {
      layer.putTileAt(ROAD.V_LEFT, bx, by + r);
      for (let c = 1; c < CELLS - 1; c++) {
        layer.putTileAt(ROAD.V_MID, bx + c, by + r);
      }
      layer.putTileAt(ROAD.V_RIGHT, bx + CELLS - 1, by + r);
    }
  }

  _fillHorizontalRoad(layer, bx, by) {
    // 水平道路：上緣 + 6列中央 + 下緣
    for (let c = 0; c < CELLS; c++) {
      layer.putTileAt(ROAD.H_TOP, bx + c, by);
      for (let r = 1; r < CELLS - 1; r++) {
        layer.putTileAt(ROAD.H_MID, bx + c, by + r);
      }
      layer.putTileAt(ROAD.H_BOT, bx + c, by + CELLS - 1);
    }
  }

  _fillCrossroad(layer, bx, by, hasL, hasR, hasU, hasD) {
    // 路口：先填滿中央瀝青
    for (let r = 0; r < CELLS; r++) {
      for (let c = 0; c < CELLS; c++) {
        layer.putTileAt(ROAD.H_MID, bx + c, by + r);
      }
    }
    // 上緣
    if (!hasU) {
      for (let c = 0; c < CELLS; c++) layer.putTileAt(ROAD.H_TOP, bx + c, by);
    }
    // 下緣
    if (!hasD) {
      for (let c = 0; c < CELLS; c++) layer.putTileAt(ROAD.H_BOT, bx + c, by + CELLS - 1);
    }
    // 左緣
    if (!hasL) {
      for (let r = 0; r < CELLS; r++) layer.putTileAt(ROAD.V_LEFT, bx, by + r);
    }
    // 右緣
    if (!hasR) {
      for (let r = 0; r < CELLS; r++) layer.putTileAt(ROAD.V_RIGHT, bx + CELLS - 1, by + r);
    }
    // 角落
    if (!hasU && !hasL) layer.putTileAt(ROAD.CROSS_TL, bx, by);
    if (!hasU && !hasR) layer.putTileAt(ROAD.CROSS_TR, bx + CELLS - 1, by);
    if (!hasD && !hasL) layer.putTileAt(ROAD.CROSS_BL, bx, by + CELLS - 1);
    if (!hasD && !hasR) layer.putTileAt(ROAD.CROSS_BR, bx + CELLS - 1, by + CELLS - 1);
  }

  _fillSidewalk(layer, bx, by, gx, gy) {
    const rL = this.isRoad(gx - 1, gy);
    const rR = this.isRoad(gx + 1, gy);
    const rU = this.isRoad(gx, gy - 1);
    const rD = this.isRoad(gx, gy + 1);

    for (let r = 0; r < CELLS; r++) {
      for (let c = 0; c < CELLS; c++) {
        const isTop = r === 0;
        const isBot = r === CELLS - 1;
        const isLeft = c === 0;
        const isRight = c === CELLS - 1;

        let tile = SIDEWALK.MID;
        // 邊緣
        if (isTop && rU) tile = SIDEWALK.TOP;
        else if (isBot && rD) tile = SIDEWALK.BOT;
        else if (isLeft && rL) tile = SIDEWALK.LEFT;
        else if (isRight && rR) tile = SIDEWALK.RIGHT;
        // 角落
        if (isTop && isLeft && rU && rL) tile = SIDEWALK.TL;
        else if (isTop && isRight && rU && rR) tile = SIDEWALK.TR;
        else if (isBot && isLeft && rD && rL) tile = SIDEWALK.BL;
        else if (isBot && isRight && rD && rR) tile = SIDEWALK.BR;

        layer.putTileAt(tile, bx + c, by + r);
      }
    }
  }

  placeTrafficLights() {
    // 在主幹道交叉口放紅綠燈（帶狀態系統）
    this.trafficLights = []; // { x, y, hGreen: boolean, sprite, timer }
    const mainHRows = [];
    const mainVCols = [];
    for (let i = 0; i < Math.min(5, this.level.hRoads.length); i++) {
      mainHRows.push(this.level.hRoads[i].y[0]);
    }
    for (let i = 0; i < Math.min(5, this.level.vRoads.length); i++) {
      mainVCols.push(this.level.vRoads[i].x[0]);
    }
    const placed = new Set();
    for (const col of mainVCols) {
      for (const row of mainHRows) {
        if (!this.isRoad(col, row)) continue;
        const key = `${Math.floor(col / 5)},${Math.floor(row / 5)}`;
        if (placed.has(key)) continue;
        placed.add(key);
        const tx = col - 1, ty = row - 1;
        if (tx >= 0 && ty >= 0 && !this.isRoad(tx, ty)) {
          const img = this.add.image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'trafficLight')
            .setScale(1.8).setAlpha(0.85).setDepth(3);
          // 路口中心像素座標（用來偵測 NPC 接近）
          const centerX = col * TILE + TILE / 2;
          const centerY = row * TILE + TILE / 2;
          this.trafficLights.push({
            centerX, centerY, hGreen: true, sprite: img,
          });
        }
      }
    }

    // 紅綠燈狀態指示圓點（紅/綠）
    for (const tl of this.trafficLights) {
      tl.hDot = this.add.circle(tl.centerX - TILE, tl.centerY, 6, 0x22c55e).setDepth(5).setAlpha(0.9);
      tl.vDot = this.add.circle(tl.centerX, tl.centerY - TILE, 6, 0xef4444).setDepth(5).setAlpha(0.9);
    }

    // 每 8 秒切換紅綠燈
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        for (const tl of this.trafficLights) {
          tl.hGreen = !tl.hGreen;
          tl.hDot.fillColor = tl.hGreen ? 0x22c55e : 0xef4444;
          tl.vDot.fillColor = tl.hGreen ? 0xef4444 : 0x22c55e;
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  placeRoadLabels() {
    const labels = this.level.roadLabels || [];
    for (const l of labels) {
      if (l.x < this.MAP_W && l.y < this.MAP_H) {
        const lx = l.x * TILE + TILE / 2;
        const ly = l.y * TILE + TILE / 2;
        // 路標牌背景
        this.add.rectangle(lx, ly, 56, 18, 0x1e3a5f, 0.85).setDepth(2);
        this.add.rectangle(lx, ly, 54, 16, 0x1e3a5f, 0).setStrokeStyle(1, 0x60a5fa, 0.6).setDepth(2);
        this.add.text(lx, ly, l.text, {
          fontSize: '11px', color: '#e0f2fe', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(2);
      }
    }

    // 護城河
    const moat = this.level.moat || [];
    this.moatSet = new Set();
    const moatPositions = new Set(moat.map(m => `${m.x},${m.y}`));
    for (const m of moat) {
      const cx = m.x * TILE + TILE / 2;
      const cy = m.y * TILE + TILE / 2;
      this.moatSet.add(`${m.x},${m.y}`);
      // 用圖磚填水面（加點變化）
      const bx = m.x * CELLS;
      const by = m.y * CELLS;
      const terrainLayer = this.tileMap.getLayer('terrain').tilemapLayer;
      const waterTiles = [WATER.FULL, WATER.ALT1, WATER.ALT2];
      for (let r = 0; r < CELLS; r++) {
        for (let c = 0; c < CELLS; c++) {
          const wIdx = ((bx + c) * 3 + (by + r) * 7) % 5 === 0 ? waterTiles[1]
                     : ((bx + c) * 11 + (by + r) * 5) % 7 === 0 ? waterTiles[2]
                     : waterTiles[0];
          terrainLayer.putTileAt(wIdx, bx + c, by + r);
        }
      }
      // 兩側河岸用人行道磚
      if (!this.isRoad(m.x - 1, m.y) && !moatPositions.has(`${m.x - 1},${m.y}`)) {
        const rbx = (m.x - 1) * CELLS;
        for (let r = 0; r < CELLS; r++) {
          for (let c = 0; c < CELLS; c++) {
            terrainLayer.putTileAt(SIDEWALK.MID, rbx + c, by + r);
          }
        }
      }
      if (!this.isRoad(m.x + 1, m.y) && !moatPositions.has(`${m.x + 1},${m.y}`)) {
        const rbx = (m.x + 1) * CELLS;
        for (let r = 0; r < CELLS; r++) {
          for (let c = 0; c < CELLS; c++) {
            terrainLayer.putTileAt(SIDEWALK.MID, rbx + c, by + r);
          }
        }
      }
      // 護城河是障礙物（不能騎過去）
      const block = this.add.rectangle(cx, cy, TILE, TILE, 0x000000, 0).setDepth(0);
      this.blockers.add(block);
    }

    // 特殊地標（如東門圓環）
    const landmarks = this.level.landmarks || [];
    for (const lm of landmarks) {
      const cx = lm.x * TILE + TILE / 2;
      const cy = lm.y * TILE + TILE / 2;
      const r = (lm.radius || 1) * TILE;
      // 圓環外圈
      const circle = this.add.circle(cx, cy, r, 0x4a5568, 0.6).setDepth(2);
      this.add.circle(cx, cy, r - 8, 0x3f3f46, 0.8).setDepth(2);
      // 圓環中心綠地
      this.add.circle(cx, cy, r * 0.4, 0x4a8f3a, 0.7).setDepth(2);
      // 標籤
      this.add.text(cx, cy - r - 12, lm.label, {
        fontSize: '13px', color: '#fbbf24', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(3);
    }
  }

  createPOI(gridX, gridY, texture, label, color) {
    const x = gridX * TILE + TILE / 2;
    const y = gridY * TILE + TILE / 2;
    const sprite = this.add.image(x, y, texture).setScale(1.6).setDepth(4);

    const glow = this.add.circle(x, y, 36, color, 0.25).setDepth(3);
    this.tweens.add({
      targets: glow, alpha: { from: 0.1, to: 0.4 }, scale: { from: 0.9, to: 1.2 },
      duration: 800, yoyo: true, repeat: -1,
    });

    this.add.text(x, y - 45, label, {
      fontSize: '15px', color: '#fff', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(4);

    return { sprite, glow, gridX, gridY };
  }

  spawnCoins() {
    if (this.coins.countActive() > 40) return;
    // 在道路上隨機撒金幣
    const roadCells = Array.from(this.roadSet);
    for (let i = 0; i < 20; i++) {
      const cell = roadCells[Phaser.Math.Between(0, roadCells.length - 1)];
      const [gx, gy] = cell.split(',').map(Number);
      const cx = gx * TILE + TILE / 2;
      const cy = gy * TILE + TILE / 2;
      const coin = this.coins.create(cx, cy, 'coin').setScale(1.5).setDepth(3);
      coin.body.setAllowGravity(false);
      this.tweens.add({
        targets: coin, y: cy - 5, duration: 600,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  spawnPowerups() {
    if (this.boosts.countActive() > 3) return;
    if (this.timeBonuses.countActive() > 3) return;
    const roadCells = Array.from(this.roadSet);

    for (let i = 0; i < 2; i++) {
      const cell = roadCells[Phaser.Math.Between(0, roadCells.length - 1)];
      const [gx, gy] = cell.split(',').map(Number);
      const b = this.boosts.create(gx * TILE + TILE / 2, gy * TILE + TILE / 2, 'boostPickup').setScale(1.8).setDepth(3);
      b.body.setAllowGravity(false);
      this.tweens.add({ targets: b, angle: 360, duration: 2000, repeat: -1 });
    }
    for (let i = 0; i < 2; i++) {
      const cell = roadCells[Phaser.Math.Between(0, roadCells.length - 1)];
      const [gx, gy] = cell.split(',').map(Number);
      const t = this.timeBonuses.create(gx * TILE + TILE / 2, gy * TILE + TILE / 2, 'timePickup').setScale(1.8).setDepth(3);
      t.body.setAllowGravity(false);
      this.tweens.add({ targets: t, scale: { from: 1.6, to: 2.0 }, duration: 500, yoyo: true, repeat: -1 });
    }
  }

  spawnNPCCars() {
    if (this.npcCars.countActive() > 350) return;  // 台灣塞車感（超大量車流）
    const toSpawn = Math.min(40, 400 - this.npcCars.countActive());
    for (let i = 0; i < toSpawn; i++) this.spawnOneNPC();
  }

  spawnOneNPC() {
    const horizontal = Math.random() > 0.5;
    let x, y, vx, vy, flipX, angle, type;

    if (horizontal && this.hLanes.length > 0) {
      type = NPC_TYPES_H[Phaser.Math.Between(0, NPC_TYPES_H.length - 1)];
      const lane = this.hLanes[Phaser.Math.Between(0, this.hLanes.length - 1)];
      const goRight = lane.y % 2 === 0;
      x = goRight ? -80 : (this.MAP_W * TILE + 80);
      y = lane.y * TILE + TILE / 2;
      const speed = Phaser.Math.Between(80, 170);
      vx = goRight ? speed : -speed;
      vy = 0;
      // 圖磚車輛已有方向，用 flipX 處理反向
      flipX = TILE_H_VEHICLES.has(type) ? !goRight : !goRight;
      angle = 0;
    } else if (this.vLanes.length > 0) {
      type = NPC_TYPES_V[Phaser.Math.Between(0, NPC_TYPES_V.length - 1)];
      const lane = this.vLanes[Phaser.Math.Between(0, this.vLanes.length - 1)];
      const goDown = lane.x % 2 === 0;
      x = lane.x * TILE + TILE / 2;
      y = goDown ? -80 : (this.MAP_H * TILE + 80);
      const speed = Phaser.Math.Between(80, 170);
      vx = 0;
      vy = goDown ? speed : -speed;
      flipX = false;
      // 圖磚垂直車輛不需要旋轉（已經是垂直的）
      angle = TILE_V_VEHICLES.has(type) ? 0 : (goDown ? 90 : -90);
      if (TILE_V_VEHICLES.has(type) && !goDown) {
        flipX = false; // 用 flipY 處理上行
      }
    } else {
      return;
    }

    const car = this.npcCars.create(x, y, type);
    const isScooter = type === 'scooter';
    const isTileVehicle = TILE_H_VEHICLES.has(type) || TILE_V_VEHICLES.has(type);
    const bigTypes = ['npcBus', 'npcTruck', 'npcAmbulance', 'tileBusH', 'tileTruckV'];
    let scale;
    if (isTileVehicle) {
      // 圖磚車輛很小（16×8 或 8×16），需放大
      scale = bigTypes.includes(type) ? 4.0 : 3.5;
    } else if (isScooter) {
      scale = 2.5;
      vx *= Phaser.Math.FloatBetween(1.1, 1.5);
      vy *= Phaser.Math.FloatBetween(1.1, 1.5);
    } else if (bigTypes.includes(type)) {
      scale = 2.5;
    } else {
      scale = 2.2;
    }
    car.setScale(scale).setAngle(angle).setFlipX(flipX).setDepth(4);
    // 垂直圖磚車輛上行時 flipY
    if (TILE_V_VEHICLES.has(type) && vy < 0) {
      car.setFlipY(true);
    }
    car.body.setAllowGravity(false);
    car.setVelocity(vx, vy);
    car.body.setSize(car.width * 0.7, car.height * 0.7);
    car.body.setImmovable(true);
    car.body.pushable = false;
    car.setData('origVx', vx);
    car.setData('origVy', vy);
    car.setData('horizontal', horizontal);
    car.setData('stopped', false);

    this.time.delayedCall(30000, () => { if (car.active) car.destroy(); });
  }

  collectCoin(player, coin) {
    const now = this.time.now;
    if (now - this.lastCoinTime < 2000) {
      this.combo = Math.min(this.combo + 1, 10);
    } else {
      this.combo = 1;
    }
    this.lastCoinTime = now;
    const points = 10 * this.combo;
    this.score += points;
    this.showFloatingText(coin.x, coin.y - 20, `+${points}`, this.combo > 1 ? '#fbbf24' : '#fff');
    if (this.combo > 1) {
      this.showFloatingText(coin.x, coin.y - 40, `${this.combo}x COMBO!`, '#ff6b35');
    }
    this.sfx.coin.play();
    coin.destroy();
  }

  collectBoost(player, boost) {
    this.boostFuel = Math.min(100, this.boostFuel + 50);
    this.showFloatingText(boost.x, boost.y - 20, '加速燃料 +50!', '#3b82f6');
    this.sfx.powerup.play();
    boost.destroy();
  }

  collectTime(player, timeBonus) {
    this.questState.deadlineMs += 15000;
    this.showFloatingText(timeBonus.x, timeBonus.y - 20, '時間 +15s!', '#22c55e');
    this.sfx.powerup.play();
    this.cameras.main.flash(300, 34, 197, 94, false);
    timeBonus.destroy();
  }

  hitByCar(player, car) {
    if (this.invincible || this.gameOver || this.gameWon) return;
    this.invincible = true;
    this.sfx.crash.play();
    this.questState.deadlineMs -= 10000;
    this.score = Math.max(0, this.score - 50);
    this.combo = 1;

    const exp = this.add.sprite(player.x, player.y, 'exp0').setScale(0.6).setDepth(20);
    exp.play('explode');
    exp.on('animationcomplete', () => exp.destroy());

    this.add.particles(player.x, player.y, 'spark', {
      speed: { min: 100, max: 250 }, angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 }, lifespan: 400, quantity: 15,
      tint: [0xff4444, 0xfbbf24, 0xff6b35], emitting: false,
    }).explode(15);

    this.cameras.main.shake(300, 0.015);
    this.cameras.main.flash(200, 255, 0, 0, false);
    this.showFloatingText(player.x, player.y - 30, '-10秒! -50分!', '#ef4444');

    this.tweens.add({
      targets: player, alpha: { from: 0.3, to: 1 },
      duration: 100, repeat: 10, yoyo: true,
      onComplete: () => { player.setAlpha(1); this.invincible = false; },
    });

    const knockAngle = Phaser.Math.Angle.Between(car.x, car.y, player.x, player.y);
    player.setVelocity(Math.cos(knockAngle) * 300, Math.sin(knockAngle) * 300);
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  randomEvent() {
    if (this.gameOver || this.gameWon) return;
    const events = [
      () => {
        // 救護車高速衝過
        this.showFloatingText(this.player.x, this.player.y - 60, '⚠ 救護車來了！小心！', '#ef4444');
        if (this.hLanes.length === 0) return;
        const lane = this.hLanes[Phaser.Math.Between(0, this.hLanes.length - 1)];
        const car = this.npcCars.create(lane.x1 * TILE - 80, this.player.y, 'npcAmbulance');
        car.setScale(2.8).setDepth(4);
        car.body.setAllowGravity(false);
        car.setVelocityX(350);
        car.body.setSize(car.width * 0.7, car.height * 0.7);
        this.sfx.honk.play();
        this.time.delayedCall(12000, () => { if (car.active) car.destroy(); });
      },
      () => {
        this.showFloatingText(this.player.x, this.player.y - 60, '金幣雨！趕快撿！', '#fbbf24');
        for (let i = 0; i < 20; i++) {
          const cx = this.player.x + Phaser.Math.Between(-250, 250);
          const cy = this.player.y + Phaser.Math.Between(-250, 250);
          const coin = this.coins.create(cx, cy, 'coin').setScale(1.5).setDepth(3);
          coin.body.setAllowGravity(false);
          this.tweens.add({ targets: coin, y: cy - 5, duration: 600, yoyo: true, repeat: -1 });
        }
      },
      () => {
        this.showFloatingText(this.player.x, this.player.y - 60, '⚠ 尖峰時段！車流加速！', '#f97316');
        this.npcCars.getChildren().forEach(c => {
          if (c.active) { c.body.velocity.x *= 1.8; c.body.velocity.y *= 1.8; }
        });
        this.time.delayedCall(10000, () => {
          this.npcCars.getChildren().forEach(c => {
            if (c.active) { c.body.velocity.x /= 1.8; c.body.velocity.y /= 1.8; }
          });
        });
      },
    ];
    events[Phaser.Math.Between(0, events.length - 1)]();
  }

  setupVirtualControls() {
    this.virtual = { up: false, down: false, left: false, right: false, interact: false, boost: false };
    const btnStyle = { fontSize: '28px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', padding: { x: 14, y: 10 } };
    const mkBtn = (x, y, label, keyName) => {
      const b = this.add.text(x, y, label, btnStyle).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
      b.on('pointerdown', () => this.virtual[keyName] = true);
      b.on('pointerup', () => this.virtual[keyName] = false);
      b.on('pointerout', () => this.virtual[keyName] = false);
      b.on('pointerupoutside', () => this.virtual[keyName] = false);
      return b;
    };
    const h = this.scale.height, w = this.scale.width;
    mkBtn(24, h - 130, '◀', 'left');
    mkBtn(88, h - 194, '▲', 'up');
    mkBtn(88, h - 66, '▼', 'down');
    mkBtn(152, h - 130, '▶', 'right');
    mkBtn(w - 90, h - 120, 'E', 'interact').setStyle({ fontSize: '30px', backgroundColor: 'rgba(34,197,94,0.5)' });
    mkBtn(w - 90, h - 190, '⚡', 'boost').setStyle({ fontSize: '26px', backgroundColor: 'rgba(59,130,246,0.5)' });
  }

  setupHUD() {
    // 關卡名稱
    this.add.text(this.scale.width / 2, 8, `🏙 ${this.level.name}`, {
      fontSize: '16px', color: '#93c5fd', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);

    this.hud = this.add.text(20, 16, '', {
      fontSize: '18px', color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 }, lineSpacing: 4,
    }).setScrollFactor(0).setDepth(10);

    this.scoreText = this.add.text(this.scale.width - 20, 16, '', {
      fontSize: '22px', color: '#fbbf24', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(10).setOrigin(1, 0);

    this.msg = this.add.text(20, 100, '', {
      fontSize: '18px', color: '#fde68a',
      backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(10);

    this.boostBarBg = this.add.rectangle(this.scale.width / 2, this.scale.height - 20, 200, 12, 0x1e293b, 0.7)
      .setScrollFactor(0).setDepth(10);
    this.boostBar = this.add.rectangle(this.scale.width / 2, this.scale.height - 20, 200, 12, 0x3b82f6, 0.9)
      .setScrollFactor(0).setDepth(10);
    this.add.text(this.scale.width / 2, this.scale.height - 36, '加速 [SPACE]', {
      fontSize: '12px', color: '#93c5fd',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    this.setupMinimap();
  }

  setupMinimap() {
    const mmW = 160, mmH = 115;
    const mmX = this.scale.width - mmW - 10, mmY = 55;
    this.minimapBg = this.add.rectangle(mmX + mmW / 2, mmY + mmH / 2, mmW, mmH, 0x1e293b, 0.75)
      .setScrollFactor(0).setDepth(9).setStrokeStyle(1, 0x475569);
    this.minimapDot = this.add.circle(0, 0, 3, 0x22c55e).setScrollFactor(0).setDepth(10);

    this.minimapPOIs = {};
    for (const p of this.level.pois) {
      const mx = mmX + (p.gridX / this.MAP_W) * mmW;
      const my = mmY + (p.gridY / this.MAP_H) * mmH;
      this.minimapPOIs[p.key] = this.add.circle(mx, my, 3, p.color).setScrollFactor(0).setDepth(10);
    }
    this.mmX = mmX; this.mmY = mmY; this.mmW = mmW; this.mmH = mmH;
  }

  setStage(stage) {
    const totalPois = this.level.pois.length;
    this.questState.stage = stage;
    this.msg.setText(this.level.quests[Math.min(stage, this.level.quests.length - 1)]);

    if (stage > 0 && stage < totalPois + 1) {
      this.sfx.interact.play();
      this.score += 100 * stage;
      this.showFloatingText(this.player.x, this.player.y - 50, `任務完成 +${100 * stage}分！`, '#22c55e');
      this.cameras.main.flash(300, 34, 197, 94, false);
    }
    if (stage === this.level.rainAfterStage) {
      this.rain.start();
      const rainMsgs = ['下雨了！路滑小心！', '突然下起大雨！減速慢行！', '雨天路滑注意安全！'];
      this.showFloatingText(this.player.x, this.player.y - 70, rainMsgs[Phaser.Math.Between(0, rainMsgs.length - 1)], '#93c5fd');
      this.baseSpeed = 160;
    }
    if (stage === totalPois) {
      this.rain.stop();
      this.baseSpeed = 200;
      this.gameWon = true;
      this.showVictory();
    }
  }

  handleInteract(target) {
    const stage = this.questState.stage;
    const poiList = this.level.pois;
    for (let i = 0; i < poiList.length; i++) {
      if (target === this.poi[poiList[i].key].sprite && stage === i) {
        this.setStage(i + 1);
        return;
      }
    }
    this.msg.setText('⚠ 先照任務順序跑！');
  }

  showVictory() {
    this.engineSound.stop();
    const left = Math.max(0, this.questState.deadlineMs - (this.time.now - this.questState.startAt));
    const timeBonus = Math.floor(left / 1000) * 5;
    this.score += timeBonus;
    const cx = this.scale.width / 2, cy = this.scale.height / 2;
    const hasNextLevel = this.levelIndex + 1 < LEVELS.length;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(30);
    this.add.text(cx, cy - 80, `🏆 ${this.level.name} 通勤王！`, {
      fontSize: '42px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    const lines = [
      `金幣分數：${this.score - timeBonus}`,
      `剩餘時間加成：+${timeBonus}`,
      `最終分數：${this.score}`,
      '',
    ];
    if (hasNextLevel) {
      const nextName = LEVELS[this.levelIndex + 1].name;
      lines.push(`按 N 進入下一關：${nextName}`);
      lines.push('按 R 重玩本關');
    } else {
      lines.push('🎊 恭喜！全部關卡通關！你是全台灣最強通勤王！');
      lines.push('按 R 從頭開始');
    }
    this.add.text(cx, cy, lines.join('\n'), {
      fontSize: '22px', color: '#fff', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    if (hasNextLevel) {
      this.input.keyboard.once('keydown-N', () => {
        this.registry.set('levelIndex', this.levelIndex + 1);
        this.registry.set('score', this.score);
        this.scene.restart();
      });
    }
    this.input.keyboard.once('keydown-R', () => {
      this.registry.set('levelIndex', hasNextLevel ? this.levelIndex : 0);
      this.registry.set('score', 0);
      this.scene.restart();
    });
  }

  showGameOver() {
    this.gameOver = true;
    this.engineSound.stop();
    this.sfx.gameover.play();
    this.player.setVelocity(0, 0);
    const cx = this.scale.width / 2, cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(30);
    this.add.text(cx, cy - 60, '💀 超時！', {
      fontSize: '48px', color: '#ef4444', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.add.text(cx, cy + 20, [
      '老闆說你今天要請全公司喝手搖飲！',
      `最終分數：${this.score}`, '', '按 R 重新開始',
    ].join('\n'), {
      fontSize: '20px', color: '#fff', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.input.keyboard.once('keydown-R', () => this.scene.restart());
  }

  // 玩家轉向（用 flipX/flipY 代替 angle 避免顛倒）
  updatePlayerRotation() {
    switch (this.playerDir) {
      case 'right':
        this.player.setAngle(0).setFlipX(false).setFlipY(false);
        break;
      case 'left':
        this.player.setAngle(0).setFlipX(true).setFlipY(false);
        break;
      case 'down':
        this.player.setAngle(90).setFlipX(false).setFlipY(false);
        break;
      case 'up':
        this.player.setAngle(-90).setFlipX(false).setFlipY(false);
        break;
    }
  }

  update() {
    if (this.gameOver || this.gameWon) return;

    // 加速
    const boosting = (this.keys.SPACE.isDown || this.virtual.boost) && this.boostFuel > 0;
    if (boosting && !this.isBoosting) { this.isBoosting = true; this.sfx.boost.play(); }
    if (!boosting) this.isBoosting = false;
    const speed = boosting ? this.baseSpeed * 1.8 : this.baseSpeed;
    if (boosting) {
      this.boostFuel = Math.max(0, this.boostFuel - 0.5);
      this.exhaust.emitting = true;
    } else {
      this.boostFuel = Math.min(100, this.boostFuel + 0.08);
      this.exhaust.emitting = false;
    }

    // 移動
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown || this.virtual.left) vx -= speed;
    if (this.cursors.right.isDown || this.keys.D.isDown || this.virtual.right) vx += speed;
    if (this.cursors.up.isDown || this.keys.W.isDown || this.virtual.up) vy -= speed;
    if (this.cursors.down.isDown || this.keys.S.isDown || this.virtual.down) vy += speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    // 道路限制：預測下一格位置，如果不是道路就擋住
    const dt = 1 / 60;
    const nextX = this.player.x + vx * dt * 3;
    const nextY = this.player.y + vy * dt * 3;
    if (!this.canPlayerEnter(nextX, nextY)) {
      // 嘗試只保留一個方向
      const canH = this.canPlayerEnter(this.player.x + vx * dt * 3, this.player.y);
      const canV = this.canPlayerEnter(this.player.x, this.player.y + vy * dt * 3);
      if (!canH) vx = 0;
      if (!canV) vy = 0;
    }
    this.player.setVelocity(vx, vy);

    // 轉向（用 flip 代替 angle 180）
    let newDir = this.playerDir;
    if (vx < 0) newDir = 'left';
    else if (vx > 0) newDir = 'right';
    else if (vy < 0) newDir = 'up';
    else if (vy > 0) newDir = 'down';
    if (newDir !== this.playerDir) {
      this.playerDir = newDir;
      this.updatePlayerRotation();
    }

    const moving = Math.abs(vx) + Math.abs(vy) > 0;
    const targetScale = boosting ? 3.4 : (moving ? 3.2 : 3);
    this.player.setScale(Phaser.Math.Linear(this.player.scaleX, targetScale, 0.1));

    // 互動
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || this.virtual.interact) {
      const near = this.physics.overlapCirc(this.player.x, this.player.y, 70, true, true)
        .find((b) => this.interactives.contains(b.gameObject));
      if (near) this.handleInteract(near.gameObject);
      this.virtual.interact = false;
    }

    // HUD
    const left = Math.max(0, this.questState.deadlineMs - (this.time.now - this.questState.startAt));
    const sec = Math.ceil(left / 1000);
    const urgent = sec <= 30;
    this.hud.setText([
      `⏱ ${sec}s ${urgent ? '⚠ 快沒時間了！' : ''}`,
      `📋 任務：${this.questState.stage}/${this.level.pois.length}`,
      `🔥 連擊：${this.combo}x`,
    ].join('\n'));
    this.hud.setColor(urgent ? '#ef4444' : '#fff');
    this.scoreText.setText(`💰 ${this.score}`);

    // 加速條
    this.boostBar.width = (this.boostFuel / 100) * 200;
    this.boostBar.fillColor = this.boostFuel > 30 ? 0x3b82f6 : 0xef4444;

    // 小地圖
    const px = this.mmX + (this.player.x / (this.MAP_W * TILE)) * this.mmW;
    const py = this.mmY + (this.player.y / (this.MAP_H * TILE)) * this.mmH;
    this.minimapDot.setPosition(px, py);

    for (const p of this.level.pois) {
      const dot = this.minimapPOIs[p.key];
      const isTarget = this.poiKeys[this.questState.stage] === p.key;
      dot.setRadius(isTarget ? 4 : 2).setAlpha(isTarget ? 1 : 0.5);
    }

    // 方向箭頭
    const targetKey = this.poiKeys[this.questState.stage];
    const curTarget = this.poi[targetKey];
    if (curTarget && this.questState.stage < this.level.pois.length) {
      const tx = curTarget.sprite.x, ty = curTarget.sprite.y;
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, tx, ty);
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty);
      const margin = 60;
      const hw = this.scale.width / 2 - margin, hh = this.scale.height / 2 - margin;
      const ax = this.scale.width / 2 + Math.cos(angle) * Math.min(hw, dist * 0.3);
      const ay = this.scale.height / 2 + Math.sin(angle) * Math.min(hh, dist * 0.3);
      this.arrow.setPosition(ax, ay).setAngle(Phaser.Math.RadToDeg(angle)).setVisible(dist > 120);
      this.arrowDist.setPosition(ax, ay + 18).setText(`${Math.floor(dist / TILE)}格`).setVisible(dist > 120);
    } else {
      this.arrow.setVisible(false);
      this.arrowDist.setVisible(false);
    }

    // 紅綠燈停車邏輯
    const stopDist = TILE * 2.5; // 距離路口 2.5 格內開始停車
    this.npcCars.getChildren().forEach(car => {
      if (!car.active) return;
      const isH = car.getData('horizontal');
      let shouldStop = false;

      for (const tl of this.trafficLights) {
        const dx = Math.abs(car.x - tl.centerX);
        const dy = Math.abs(car.y - tl.centerY);

        if (isH) {
          // 水平車輛：紅燈時在路口前停下
          if (!tl.hGreen && dy < TILE * 1.5 && dx < stopDist && dx > TILE * 0.3) {
            // 確認車是朝路口方向行駛
            const origVx = car.getData('origVx');
            if ((origVx > 0 && car.x < tl.centerX) || (origVx < 0 && car.x > tl.centerX)) {
              shouldStop = true;
              break;
            }
          }
        } else {
          // 垂直車輛：紅燈時在路口前停下
          if (tl.hGreen && dx < TILE * 1.5 && dy < stopDist && dy > TILE * 0.3) {
            const origVy = car.getData('origVy');
            if ((origVy > 0 && car.y < tl.centerY) || (origVy < 0 && car.y > tl.centerY)) {
              shouldStop = true;
              break;
            }
          }
        }
      }

      if (shouldStop && !car.getData('stopped')) {
        car.setVelocity(0, 0);
        car.setData('stopped', true);
      } else if (!shouldStop && car.getData('stopped')) {
        car.setVelocity(car.getData('origVx'), car.getData('origVy'));
        car.setData('stopped', false);
      }
    });

    // 清除越界或離開道路的 NPC
    this.npcCars.getChildren().forEach(car => {
      if (!car.active) return;
      // 越界
      if (car.x < -300 || car.x > this.MAP_W * TILE + 300 ||
          car.y < -300 || car.y > this.MAP_H * TILE + 300) {
        car.destroy();
        return;
      }
      // 離開道路就銷毀（被碰撞推出道路時）
      const gx = Math.floor(car.x / TILE);
      const gy = Math.floor(car.y / TILE);
      if (car.x > 0 && car.y > 0 && !this.isRoad(gx, gy)) {
        car.destroy();
      }
    });

    // 喇叭
    this.npcHonkTimer += this.game.loop.delta;
    if (this.npcHonkTimer > 5000) {
      this.npcHonkTimer = 0;
      const nearCars = this.npcCars.getChildren().filter(c =>
        c.active && Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y) < 200
      );
      if (nearCars.length > 0) this.sfx.honk.play();
    }

    if (left <= 0 && this.questState.stage < this.level.pois.length) this.showGameOver();
  }
}
