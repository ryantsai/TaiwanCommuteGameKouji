// Kenney Pico-8 City 圖磚索引（0-indexed，對應 tilemap_packed.png）
// tilemap: 24 欄 × 15 列，每格 8×8px，無間距

// ===== 地形 =====
export const GRASS = [0, 24, 48]; // 草地主磚 + 兩種變體
export const GROUND = [2, 26, 50]; // 空地/泥地

// ===== 人行道 =====
export const SIDEWALK = {
  TL: 19,   // 左上角 (TMX 20)
  TOP: 20,  // 上邊 (TMX 21)
  TR: 21,   // 右上角 (TMX 22)
  LEFT: 43, // 左邊 (TMX 44)
  MID: 44,  // 中央 (TMX 45)
  RIGHT: 45,// 右邊 (TMX 46)
  BL: 67,   // 左下角 (TMX 68)
  BOT: 68,  // 下邊 (TMX 69)
  BR: 69,   // 右下角 (TMX 70)
  // 內角
  INNER_BL: 70,  // (TMX 71)
  INNER_BR: 71,  // (TMX 72)
  CORNER_TR: 46, // (TMX 47)
};

// ===== 道路 =====
export const ROAD = {
  // 橫向道路（3 tile 高）
  H_TOP: 265,    // 上緣 (TMX 266)
  H_MID: 289,    // 中央 (TMX 290) - 也是縱道中央
  H_BOT: 313,    // 下緣 (TMX 314)
  // 縱向道路（3 tile 寬）
  V_LEFT: 288,   // 左緣 (TMX 289)
  V_MID: 289,    // 中央 (TMX 290) - 共用
  V_RIGHT: 290,  // 右緣 (TMX 291)
  // 路口特殊磚
  CROSS_TL: 268, // 路口左上角 (TMX 269)
  CROSS_TR: 296, // 路口右上角 (TMX 297)
  CROSS_BL: 336, // 路口左下角 (TMX 337)
  CROSS_BR: 338, // 路口右下角 (TMX 339)
  CROSS_T: 269,  // 路口上緣特殊 (TMX 270)
  CROSS_B: 317,  // 路口下緣特殊 (TMX 318)
  CROSS_L: 292,  // 路口中左 (TMX 293)
  CROSS_R: 293,  // 路口中右 (TMX 294)
  CROSS_MID: 289,// 路口中央 = 同瀝青
  END_BL: 336,   // 縱道末端左 (TMX 337)
  END_BM: 337,   // 縱道末端中 (TMX 338)
  END_BR: 338,   // 縱道末端右 (TMX 339)
  SPECIAL: 342,  // 特殊轉角 (TMX 343)
};

// ===== 水面 =====
export const WATER = {
  FULL: 1,       // 水面主磚（亮藍色，row0 col1）
  ALT1: 25,      // 水面變體（row1 col1）
  ALT2: 49,      // 水面變體（row2 col1）
};

// ===== 建築模板 =====
// 每個模板定義為 { w, h, tiles: [[row0], [row1], ...] }（0-indexed frame）
export const BUILDINGS = [
  // 灰色辦公大樓 4×4 tiles (TMX 97-100, 121-124, 145-148, 169-172 area)
  {
    name: 'office',
    w: 4, h: 4,
    tiles: [
      [96, 97, 98, 99],
      [120, 121, 122, 123],
      [144, 145, 146, 147],
      [168, 169, 170, 171],
    ],
  },
  // 建築 B（TMX 107-110, 131-134, 155-158）
  {
    name: 'apartmentA',
    w: 4, h: 3,
    tiles: [
      [106, 107, 108, 109],
      [130, 131, 132, 133],
      [154, 155, 156, 157],
    ],
  },
  // 紅色房屋 (TMX 136-138, 160-162)
  {
    name: 'redHouse',
    w: 3, h: 2,
    tiles: [
      [135, 136, 137],
      [159, 160, 161],
    ],
  },
  // 商店（遮雨棚）(TMX 198-201, 213-216 area)
  {
    name: 'shop',
    w: 4, h: 2,
    tiles: [
      [197, 198, 199, 200],
      [212, 213, 214, 215],
    ],
  },
  // 大型建築 A（TMX 241-244, row10）
  {
    name: 'landmark',
    w: 4, h: 1,
    tiles: [
      [240, 241, 242, 243],
    ],
  },
  // 大型建築 B（TMX 246-249）
  {
    name: 'complex',
    w: 4, h: 1,
    tiles: [
      [245, 246, 247, 248],
    ],
  },
];

// ===== 樹木裝飾 =====
export const TREES = {
  PALM_TOP: 263,    // 棕櫚樹上半 (TMX 264)
  PALM_BOT: 287,    // 棕櫚樹下半 (TMX 288)
  ROUND: 286,       // 圓形樹 (TMX 287)
};

// ===== 路燈 =====
export const LAMP = {
  TOP: 93,          // 路燈上 (TMX 94)
  BOT: 117,         // 路燈下 (TMX 118)
  // 路燈變體
  TOP2: 94,         // (TMX 95)
  BOT2: 118,        // (TMX 119)
};

// ===== 車輛 =====
export const VEHICLES = {
  // 水平車輛（2 tile 寬 = 16×8px）
  H_RED: [275, 276],       // 紅車 (TMX 276+277)
  H_GREEN: [277, 278],     // 綠車 (TMX 278+279)
  H_YELLOW: [301, 302],    // 黃車 (TMX 302+303)
  H_BUS: [323, 324],       // 巴士 (TMX 324+325)
  // 垂直車輛（1×2 tile = 8×16px）
  V_BLUE: [280, 304],      // 藍車 (TMX 281+305)
  V_RED: [310, 334],       // 紅車 (TMX 311+335)
  V_RED2: [311, 335],      // 紅車2 (TMX 312+336)
  V_TRUCK: [327, 351],     // 卡車 (TMX 328+352)
};

// 車輛分組（方便生成時隨機選擇）
export const H_VEHICLE_KEYS = ['H_RED', 'H_GREEN', 'H_YELLOW', 'H_BUS'];
export const V_VEHICLE_KEYS = ['V_BLUE', 'V_RED', 'V_RED2', 'V_TRUCK'];
