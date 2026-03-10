# 機車通勤遊戲 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立一個單一 HTML 檔案的俯視 2D 像素風機車通勤遊戲，玩家騎車模擬台灣一週通勤，躲避違停車、動態車輛等障礙。

**Architecture:** 所有程式碼在 `index.html` 內，使用 Canvas 2D API 渲染。遊戲採狀態機管理畫面（標題/每日簡報/關卡/結算），地圖垂直捲動，玩家固定在畫面下 1/3。

**Tech Stack:** HTML5 Canvas 2D API、原生 JavaScript（ES6+）、無外部依賴

---

## 架構總覽

```
index.html
├── <canvas id="game"> 480×640px
└── <script>
    ├── 常數設定（尺寸、速度、顏色）
    ├── 狀態機（TITLE / BRIEFING / PLAYING / RESULT / END）
    ├── 玩家（位置、速度、生命值、操控）
    ├── 障礙物系統（靜態 + 動態）
    ├── 天氣系統
    ├── 事件系統
    ├── 地圖捲動
    ├── 碰撞偵測（AABB）
    ├── UI 渲染
    └── 主遊戲迴圈（requestAnimationFrame）
```

---

### Task 1: 基礎 HTML 骨架 + Canvas 設定

**Files:**
- Create: `index.html`

**Step 1: 建立 HTML 骨架**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>機車通勤</title>
  <style>
    body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="game" width="480" height="640"></canvas>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const W = 480, H = 640;

    // 測試：畫一個藍色矩形
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#4af';
    ctx.fillRect(W/2 - 8, H - 120, 16, 24);
  </script>
</body>
</html>
```

**Step 2: 在瀏覽器開啟確認畫面**

用瀏覽器開啟 `index.html`，確認：
- 黑色背景，中間有灰色畫布
- 畫布下方有藍色小方塊（玩家機車預覽）

**Step 3: Commit**

```bash
git init
git add index.html docs/
git commit -m "feat: 初始化專案，建立 Canvas 骨架"
```

---

### Task 2: 常數、狀態機、主遊戲迴圈

**Files:**
- Modify: `index.html`（在 `<script>` 內新增）

**Step 1: 新增常數與狀態機**

在 script 最上方加入：

```javascript
// 常數
const W = 480, H = 640;
const LANE_COUNT = 4;
const LANE_WIDTH = 80;
const ROAD_LEFT = 80;  // 道路左邊界 x
const ROAD_RIGHT = 400; // 道路右邊界 x

// 遊戲狀態
const STATE = { TITLE: 'title', BRIEFING: 'briefing', PLAYING: 'playing', RESULT: 'result', ENDING: 'ending' };
let gameState = STATE.TITLE;
let currentDay = 1;
let totalScore = 0;
```

**Step 2: 新增主遊戲迴圈**

```javascript
function update(dt) {
  // 後續各 task 填入
}

function render() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);
  // 後續各 task 填入
}

let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

**Step 3: 確認主迴圈運作**

開啟瀏覽器，畫面應持續以深色背景更新（無錯誤）。開啟 DevTools Console 確認無報錯。

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: 新增狀態機與主遊戲迴圈"
```

---

### Task 3: 標題畫面

**Files:**
- Modify: `index.html`

**Step 1: 實作標題畫面渲染**

```javascript
function renderTitle() {
  // 背景
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // 道路裝飾
  ctx.fillStyle = '#333';
  ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, H);

  // 標題文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('機車通勤', W / 2, 200);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('台灣上班族的日常', W / 2, 240);

  // 按鍵提示（閃爍）
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#4af';
    ctx.fillText('按 Enter 開始', W / 2, 400);
  }

  // 玩家機車小預覽（像素繪製）
  drawBike(W / 2 - 8, 300, '#4af');
}
```

**Step 2: 實作 drawBike 函式（像素風機車）**

```javascript
function drawBike(x, y, color) {
  const P = 4; // 像素大小
  // 車身
  ctx.fillStyle = color;
  ctx.fillRect(x, y + P, P * 4, P * 3);
  // 前輪
  ctx.fillStyle = '#888';
  ctx.fillRect(x + P, y, P * 2, P);
  ctx.fillRect(x + P, y + P * 4, P * 2, P * 2);
  // 後輪
  ctx.fillRect(x + P, y + P * 5, P * 2, P);
  // 車燈
  ctx.fillStyle = '#ff0';
  ctx.fillRect(x + P * 3, y + P, P, P);
}
```

**Step 3: 新增鍵盤輸入處理**

```javascript
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Enter' && gameState === STATE.TITLE) {
    gameState = STATE.BRIEFING;
  }
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
```

**Step 4: 在 render() 加入狀態判斷**

```javascript
function render() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);
  if (gameState === STATE.TITLE) renderTitle();
}
```

**Step 5: 確認標題畫面**

開啟瀏覽器，應看到：暗藍色背景、「機車通勤」標題、閃爍的「按 Enter 開始」提示、像素機車圖示。按 Enter 後畫面變黑（Briefing 狀態尚未實作）。

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 實作標題畫面與鍵盤輸入"
```

---

### Task 4: 每日簡報畫面

**Files:**
- Modify: `index.html`

**Step 1: 定義每日資料**

```javascript
const DAYS = [
  { name: '星期一', weather: 'sunny',  events: ['施工區域', '行人特別多'] },
  { name: '星期二', weather: 'rainy',  events: ['違停嚴重', '路面溼滑'] },
  { name: '星期三', weather: 'foggy',  events: ['大霧警報', '能見度低'] },
  { name: '星期四', weather: 'sunny',  events: ['警察取締', '救護車出勤'] },
  { name: '星期五', weather: 'rainy',  events: ['超級塞車', '全力衝刺！'] },
];

const WEATHER_EMOJI = { sunny: '☀️', rainy: '🌧️', foggy: '🌫️' };
const WEATHER_NAME  = { sunny: '晴天', rainy: '雨天', foggy: '起霧' };
```

**Step 2: 實作簡報畫面渲染**

```javascript
function renderBriefing() {
  const day = DAYS[currentDay - 1];

  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#4af';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`第 ${currentDay} 天 — ${day.name}`, W / 2, 100);

  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.fillText(`天氣：${WEATHER_EMOJI[day.weather]} ${WEATHER_NAME[day.weather]}`, W / 2, 180);

  ctx.fillStyle = '#fa0';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('今日注意事項', W / 2, 260);

  ctx.fillStyle = '#ccc';
  ctx.font = '14px monospace';
  day.events.forEach((e, i) => {
    ctx.fillText(`• ${e}`, W / 2, 300 + i * 28);
  });

  ctx.fillStyle = '#aaa';
  ctx.font = '14px monospace';
  ctx.fillText(`總分：${totalScore}`, W / 2, 500);

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#4af';
    ctx.fillText('按 Enter 出發！', W / 2, 560);
  }
}
```

**Step 3: 連接 Enter 鍵 → 進入 PLAYING 狀態**

```javascript
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Enter') {
    if (gameState === STATE.TITLE) gameState = STATE.BRIEFING;
    else if (gameState === STATE.BRIEFING) startDay();
  }
});

function startDay() {
  gameState = STATE.PLAYING;
  // 後續 Task 初始化玩家與地圖
}
```

**Step 4: 在 render() 加入 Briefing 分支**

```javascript
if (gameState === STATE.BRIEFING) renderBriefing();
```

**Step 5: 確認簡報畫面正常顯示後 Commit**

```bash
git add index.html
git commit -m "feat: 實作每日簡報畫面"
```

---

### Task 5: 玩家機車物理與操控

**Files:**
- Modify: `index.html`

**Step 1: 定義玩家物件**

```javascript
let player = {
  x: W / 2 - 8,
  y: H - 140,
  w: 16, h: 24,
  vx: 0, vy: 0,
  speed: 180,       // px/s 橫向最大速度
  baseScrollSpeed: 120, // px/s 地圖捲動速度（等效玩家前進速度）
  scrollSpeed: 120,
  hp: 3,
  maxHp: 3,
  invincible: 0,    // 無敵幀計時（秒）
  score: 0,
  progress: 0,      // 0~1，通勤進度
  totalDistance: 3000, // 一關總距離（px）
  distanceTravelled: 0,
};
```

**Step 2: 實作玩家更新邏輯**

```javascript
function updatePlayer(dt) {
  const day = DAYS[currentDay - 1];
  const isRainy = day.weather === 'rainy';
  const friction = isRainy ? 0.85 : 0.75; // 雨天滑

  // 橫向移動
  if (keys['ArrowLeft'])  player.vx -= player.speed * dt * 8;
  if (keys['ArrowRight']) player.vx += player.speed * dt * 8;
  player.vx *= friction;
  player.vx = Math.max(-player.speed, Math.min(player.speed, player.vx));
  player.x += player.vx * dt;

  // 道路邊界限制
  player.x = Math.max(ROAD_LEFT, Math.min(ROAD_RIGHT - player.w, player.x));

  // 縱向速度（加速/煞車）
  if (keys['ArrowUp'])   player.scrollSpeed = Math.min(240, player.scrollSpeed + 60 * dt);
  if (keys['ArrowDown']) player.scrollSpeed = Math.max(60,  player.scrollSpeed - 80 * dt);
  else player.scrollSpeed += (player.baseScrollSpeed - player.scrollSpeed) * dt * 2;

  // 進度
  player.distanceTravelled += player.scrollSpeed * dt;
  player.progress = Math.min(1, player.distanceTravelled / player.totalDistance);

  // 無敵時間倒數
  if (player.invincible > 0) player.invincible -= dt;
}
```

**Step 3: 實作玩家渲染（含無敵閃爍）**

```javascript
function renderPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible * 8) % 2 === 0) return;
  drawBike(player.x, player.y, '#4af');
}
```

**Step 4: 實作地圖道路底層渲染**

```javascript
let roadOffset = 0; // 捲動偏移

function renderRoad() {
  // 路邊草地
  ctx.fillStyle = '#2d5a1b';
  ctx.fillRect(0, 0, W, H);

  // 柏油路
  ctx.fillStyle = '#444';
  ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, H);

  // 車道虛線
  ctx.setLineDash([20, 20]);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let i = 1; i < LANE_COUNT; i++) {
    const lx = ROAD_LEFT + i * LANE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(lx, -20 + (roadOffset % 40));
    ctx.lineTo(lx, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
```

**Step 5: 在 startDay() 初始化玩家**

```javascript
function startDay() {
  gameState = STATE.PLAYING;
  player.x = W / 2 - 8;
  player.hp = player.maxHp;
  player.score = 0;
  player.distanceTravelled = 0;
  player.progress = 0;
  player.scrollSpeed = player.baseScrollSpeed;
  player.invincible = 0;
  roadOffset = 0;
  obstacles = [];
  spawnTimer = 0;
}
```

**Step 6: 在 update() 和 render() 連接**

```javascript
function update(dt) {
  if (gameState === STATE.PLAYING) {
    roadOffset += player.scrollSpeed * dt;
    updatePlayer(dt);
    if (player.progress >= 1) endDay(true);
  }
}

function render() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);
  if (gameState === STATE.TITLE)    renderTitle();
  if (gameState === STATE.BRIEFING) renderBriefing();
  if (gameState === STATE.PLAYING)  { renderRoad(); renderPlayer(); }
}
```

**Step 7: 確認機車可以左右移動，道路虛線向下捲動**

**Step 8: Commit**

```bash
git add index.html
git commit -m "feat: 實作玩家操控、物理與道路捲動"
```

---

### Task 6: 靜態障礙物

**Files:**
- Modify: `index.html`

**Step 1: 定義障礙物資料結構與種類**

```javascript
let obstacles = [];
let spawnTimer = 0;
const SPAWN_INTERVAL = 1.2; // 秒

const OBSTACLE_TYPES = {
  illegally_parked: {
    label: '違停車', w: 32, h: 48,
    color: '#c0392b', draw: drawCar,
    static: true, damage: 1,
  },
  pothole: {
    label: '坑洞', w: 20, h: 20,
    color: '#5d4037', draw: drawPothole,
    static: true, damage: 1,
  },
  food_stall: {
    label: '路邊攤', w: 40, h: 32,
    color: '#e67e22', draw: drawStall,
    static: true, damage: 0, slowZone: true,
  },
  construction: {
    label: '施工', w: 80, h: 40,
    color: '#f39c12', draw: drawConstruction,
    static: true, damage: 0, blockLanes: 2,
  },
};
```

**Step 2: 實作各障礙物的繪製函式**

```javascript
function drawCar(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#222';
  ctx.fillRect(x + 4, y + 6, w - 8, 10);  // 車窗
  ctx.fillRect(x + 4, y + h - 16, w - 8, 10);
  ctx.fillStyle = '#888';
  ctx.fillRect(x, y + 8, 4, 8);   // 輪子
  ctx.fillRect(x + w - 4, y + 8, 4, 8);
  ctx.fillRect(x, y + h - 16, 4, 8);
  ctx.fillRect(x + w - 4, y + h - 16, 4, 8);
}

function drawPothole(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.ellipse(x + w/2, y + h/2, w/3, h/3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawStall(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('路邊攤', x + w/2, y + h/2 + 4);
}

function drawConstruction(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  // 施工錐桶
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#f39c12' : '#fff';
    ctx.fillRect(x + i * (w/4) + 4, y + 4, 12, 20);
  }
}
```

**Step 3: 實作障礙物生成**

```javascript
function spawnObstacle() {
  const types = Object.keys(OBSTACLE_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const def = OBSTACLE_TYPES[type];

  // 隨機選一條車道
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const lx = ROAD_LEFT + lane * LANE_WIDTH + (LANE_WIDTH - def.w) / 2;

  obstacles.push({
    type, x: lx, y: -def.h - 10,
    w: def.w, h: def.h,
    color: def.color,
    draw: def.draw,
    damage: def.damage,
    vy: 0, // 靜態障礙不自己移動，由地圖捲動帶動
  });
}
```

**Step 4: 更新障礙物位置（隨地圖捲動）**

```javascript
function updateObstacles(dt) {
  spawnTimer += dt;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer = 0;
    spawnObstacle();
  }

  obstacles.forEach(o => {
    o.y += player.scrollSpeed * dt; // 跟著地圖向下移動
  });

  // 清除離開畫面的障礙
  obstacles = obstacles.filter(o => o.y < H + 60);
}
```

**Step 5: 渲染障礙物**

```javascript
function renderObstacles() {
  obstacles.forEach(o => o.draw(o.x, o.y, o.w, o.h, o.color));
}
```

**Step 6: 在 update/render 連接**

```javascript
// update() 內 PLAYING 區塊加入：
updateObstacles(dt);

// render() 內 PLAYING 區塊加入（道路後、玩家前）：
renderObstacles();
```

**Step 7: 確認障礙物從上方出現並向下移動**

**Step 8: Commit**

```bash
git add index.html
git commit -m "feat: 新增靜態障礙物系統"
```

---

### Task 7: 動態障礙物

**Files:**
- Modify: `index.html`

**Step 1: 新增動態障礙物種類**

```javascript
const DYNAMIC_OBSTACLES = {
  moving_car: {
    label: '移動車輛', w: 28, h: 44,
    color: '#8e44ad',
    vy: -40, // 同向慢速（負值 = 向上移動比玩家慢）
    damage: 1,
  },
  door_open: {
    label: '開車門', w: 32, h: 16,
    color: '#e74c3c',
    vy: 0, static: true,
    damage: 1, lifespan: 0.8, // 出現 0.8 秒後消失
  },
  scooter_dash: {
    label: '衝出機車', w: 14, h: 22,
    color: '#16a085',
    vx: 180, vy: 20, // 從巷口橫衝
    damage: 1,
  },
  pedestrian: {
    label: '行人', w: 12, h: 16,
    color: '#f1c40f',
    vx: 60, vy: 0, // 橫向穿越
    damage: 0, // 撞到行人不扣血，但減速
    slowPlayer: true,
  },
};
```

**Step 2: 實作動態障礙物生成（獨立計時器）**

```javascript
let dynamicSpawnTimer = 0;
const DYNAMIC_SPAWN_INTERVAL = 2.5;

function spawnDynamicObstacle() {
  const types = Object.keys(DYNAMIC_OBSTACLES);
  const type = types[Math.floor(Math.random() * types.length)];
  const def = DYNAMIC_OBSTACLES[type];

  let x, y, vx = def.vx || 0, vy = def.vy || 0;

  if (type === 'scooter_dash') {
    // 從左側巷口衝出
    x = ROAD_LEFT - 10;
    y = Math.random() * (H - 200) + 100;
    vx = Math.random() > 0.5 ? 180 : -180;
    if (vx < 0) x = ROAD_RIGHT + 10;
  } else if (type === 'pedestrian') {
    x = ROAD_LEFT - 10;
    y = Math.random() * (H - 200) + 100;
    vx = 60;
  } else if (type === 'door_open') {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    x = ROAD_LEFT + lane * LANE_WIDTH + 4;
    y = Math.random() * (H / 2);
  } else {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    x = ROAD_LEFT + lane * LANE_WIDTH + (LANE_WIDTH - def.w) / 2;
    y = -def.h;
  }

  obstacles.push({
    type, x, y, w: def.w, h: def.h,
    color: def.color,
    draw: type === 'moving_car' ? drawCar : drawGenericObstacle,
    damage: def.damage,
    vx, vy,
    lifespan: def.lifespan || null,
    slowPlayer: def.slowPlayer || false,
    dynamic: true,
  });
}

function drawGenericObstacle(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
```

**Step 3: 更新動態障礙物移動**

```javascript
// updateObstacles() 內，forEach 中加入動態判斷：
obstacles.forEach(o => {
  if (o.dynamic) {
    o.x += (o.vx || 0) * dt;
    o.y += (player.scrollSpeed + (o.vy || 0)) * dt;
    if (o.lifespan !== null) {
      o.lifespan -= dt;
    }
  } else {
    o.y += player.scrollSpeed * dt;
  }
});

// 清除條件更新：
obstacles = obstacles.filter(o => {
  if (o.lifespan !== null && o.lifespan <= 0) return false;
  if (o.x < ROAD_LEFT - 60 || o.x > ROAD_RIGHT + 60) return false;
  if (o.y > H + 60) return false;
  return true;
});

// 動態障礙物生成計時器：
dynamicSpawnTimer += dt;
if (dynamicSpawnTimer >= DYNAMIC_SPAWN_INTERVAL) {
  dynamicSpawnTimer = 0;
  spawnDynamicObstacle();
}
```

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: 新增動態障礙物（移動車輛、開車門、衝出機車、行人）"
```

---

### Task 8: 碰撞偵測與受傷系統

**Files:**
- Modify: `index.html`

**Step 1: 實作 AABB 碰撞檢測**

```javascript
function aabb(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
```

**Step 2: 實作碰撞處理**

```javascript
function checkCollisions() {
  if (player.invincible > 0) return;

  obstacles.forEach(o => {
    if (!aabb(player, o)) return;

    if (o.slowPlayer) {
      // 行人：減速不扣血
      player.scrollSpeed = Math.max(40, player.scrollSpeed * 0.5);
      obstacles = obstacles.filter(ob => ob !== o);
      return;
    }

    if (o.damage > 0) {
      player.hp -= o.damage;
      player.invincible = 1.5; // 1.5 秒無敵
      player.score -= 20;
      totalScore -= 20;
      // 擊退效果
      player.vx = (player.x > o.x + o.w / 2) ? 120 : -120;
      obstacles = obstacles.filter(ob => ob !== o);

      if (player.hp <= 0) {
        endDay(false);
      }
    }
  });
}
```

**Step 3: 在 update() 的 PLAYING 區塊加入**

```javascript
checkCollisions();
```

**Step 4: 實作 endDay 函式**

```javascript
function endDay(success) {
  gameState = STATE.RESULT;
  let dayScore = 0;
  if (success) {
    dayScore += 100;
    const timeBonus = Math.floor((1 - player.distanceTravelled / (player.totalDistance * 1.5)) * 50);
    dayScore += Math.max(0, timeBonus);
  } else {
    dayScore -= 30; // 遲到扣分
  }
  player.score += dayScore;
  totalScore += dayScore;
  dayResult = { success, dayScore };
}
let dayResult = null;
```

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 實作碰撞偵測與受傷/結束關卡系統"
```

---

### Task 9: HUD（遊戲內 UI）

**Files:**
- Modify: `index.html`

**Step 1: 實作 HUD 渲染**

```javascript
function renderHUD() {
  const day = DAYS[currentDay - 1];

  // 頂部黑條
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, 44);

  // 天數
  ctx.fillStyle = '#4af';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`第${currentDay}天 ${day.name}`, 8, 18);

  // 天氣
  ctx.fillStyle = '#fff';
  ctx.font = '13px monospace';
  ctx.fillText(`${WEATHER_EMOJI[day.weather]} ${WEATHER_NAME[day.weather]}`, 8, 36);

  // 生命值（心形像素）
  ctx.textAlign = 'center';
  ctx.font = '18px monospace';
  for (let i = 0; i < player.maxHp; i++) {
    ctx.fillStyle = i < player.hp ? '#e74c3c' : '#555';
    ctx.fillText('♥', W/2 - 20 + i * 22, 20);
  }

  // 進度條
  const barW = 120, barX = W - 140;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, 8, barW, 12);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(barX, 8, barW * player.progress, 12);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, 8, barW, 12);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('公司', W - 8, 18);

  // 分數
  ctx.fillStyle = '#fa0';
  ctx.font = '13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`分數：${totalScore}`, W - 8, 36);

  // 速度提示
  if (player.invincible > 0) {
    ctx.fillStyle = `rgba(255,100,100,${0.5 + Math.sin(Date.now() / 100) * 0.5})`;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('！撞擊！', W / 2, H / 2);
  }
}
```

**Step 2: 在 PLAYING 渲染區塊加入 HUD（最後渲染，在最上層）**

```javascript
if (gameState === STATE.PLAYING) {
  renderRoad();
  renderObstacles();
  renderPlayer();
  renderHUD();
}
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 實作 HUD（生命值、進度條、分數、天氣）"
```

---

### Task 10: 結算畫面與每日循環

**Files:**
- Modify: `index.html`

**Step 1: 實作結算畫面**

```javascript
function renderResult() {
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = dayResult.success ? '#2ecc71' : '#e74c3c';
  ctx.font = 'bold 32px monospace';
  ctx.fillText(dayResult.success ? '平安抵達！' : '遲到了...', W / 2, 160);

  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`今日得分：${dayResult.dayScore > 0 ? '+' : ''}${dayResult.dayScore}`, W / 2, 240);
  ctx.fillText(`累計總分：${totalScore}`, W / 2, 280);

  // 評語
  const comments = dayResult.success
    ? ['順利通勤，繼續加油！', '技術高超！', '完美閃避！']
    : ['唉，又遲到了...', '老闆要扣薪水了', '明天加油！'];
  ctx.fillStyle = '#aaa';
  ctx.font = '14px monospace';
  ctx.fillText(comments[Math.floor(Math.random() * comments.length)], W / 2, 340);

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#4af';
    ctx.font = '16px monospace';
    const isLastDay = currentDay >= 5;
    ctx.fillText(isLastDay ? '按 Enter 看結局' : '按 Enter 繼續', W / 2, 480);
  }
}
```

**Step 2: Enter 鍵推進天數**

```javascript
// keydown handler 加入：
else if (gameState === STATE.RESULT) {
  if (currentDay >= 5) {
    gameState = STATE.ENDING;
  } else {
    currentDay++;
    gameState = STATE.BRIEFING;
  }
}
```

**Step 3: render() 加入 RESULT 分支**

```javascript
if (gameState === STATE.RESULT) renderResult();
```

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: 實作結算畫面與每日循環"
```

---

### Task 11: 天氣效果

**Files:**
- Modify: `index.html`

**Step 1: 雨天效果（雨滴粒子）**

```javascript
let raindrops = [];

function initRain() {
  raindrops = [];
  for (let i = 0; i < 80; i++) {
    raindrops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 300 + Math.random() * 200,
      len: 8 + Math.random() * 8,
    });
  }
}

function updateRain(dt) {
  raindrops.forEach(r => {
    r.y += r.speed * dt;
    if (r.y > H) { r.y = -r.len; r.x = Math.random() * W; }
  });
}

function renderRain() {
  ctx.strokeStyle = 'rgba(120,180,255,0.5)';
  ctx.lineWidth = 1;
  raindrops.forEach(r => {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 2, r.y + r.len);
    ctx.stroke();
  });
}
```

**Step 2: 起霧效果（半透明遮罩）**

```javascript
function renderFog() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(200,200,200,0.85)');
  gradient.addColorStop(0.4, 'rgba(200,200,200,0.6)');
  gradient.addColorStop(0.7, 'rgba(200,200,200,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}
```

**Step 3: 在 startDay() 初始化天氣**

```javascript
const day = DAYS[currentDay - 1];
if (day.weather === 'rainy') initRain();
```

**Step 4: 在 update/render 加入天氣**

```javascript
// update() PLAYING 區塊：
const day = DAYS[currentDay - 1];
if (day.weather === 'rainy') updateRain(dt);

// render() PLAYING 區塊（在 HUD 之前）：
if (day.weather === 'rainy') renderRain();
if (day.weather === 'foggy') renderFog();
```

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 實作雨天/起霧天氣視覺效果"
```

---

### Task 12: 隨機事件（警察、救護車、導航失效）

**Files:**
- Modify: `index.html`

**Step 1: 定義隨機事件系統**

```javascript
let activeEvent = null;
let eventTimer = 0;
let nextEventTime = 5 + Math.random() * 10;

const RANDOM_EVENTS = [
  {
    id: 'police',
    label: '🚨 警察取締！強制停車 3 秒',
    duration: 3,
    onStart: () => { player.scrollSpeed = 0; },
    onEnd: () => { player.scrollSpeed = player.baseScrollSpeed; },
  },
  {
    id: 'ambulance',
    label: '🚑 救護車通過！靠邊停',
    duration: 2.5,
    onStart: () => { player.scrollSpeed = 20; player.x = ROAD_LEFT + 4; },
    onEnd: () => { player.scrollSpeed = player.baseScrollSpeed; },
  },
  {
    id: 'no_gps',
    label: '📱 導航沒訊號！',
    duration: 5,
    onStart: () => { noGPS = true; },
    onEnd: () => { noGPS = false; },
  },
];
let noGPS = false;
```

**Step 2: 實作事件更新與觸發**

```javascript
function updateEvents(dt) {
  nextEventTime -= dt;
  if (nextEventTime <= 0 && !activeEvent) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    activeEvent = { ...ev, remaining: ev.duration };
    ev.onStart();
    nextEventTime = 8 + Math.random() * 12;
  }

  if (activeEvent) {
    activeEvent.remaining -= dt;
    if (activeEvent.remaining <= 0) {
      activeEvent.onEnd();
      activeEvent = null;
    }
  }
}
```

**Step 3: 實作事件 UI 提示**

```javascript
function renderEventNotice() {
  if (!activeEvent) return;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(20, H - 80, W - 40, 50);
  ctx.fillStyle = '#fa0';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(activeEvent.label, W / 2, H - 52);
  // 倒數條
  const ratio = activeEvent.remaining / activeEvent.duration;
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(20, H - 32, (W - 40) * ratio, 8);
}

// 無 GPS 時隱藏進度條（在 renderHUD 內加條件）
// 在 renderHUD 進度條部分加：
if (!noGPS) { /* 畫進度條 */ }
```

**Step 4: 在 update/render 連接**

```javascript
// update() PLAYING 區塊：
updateEvents(dt);

// render() PLAYING 中 HUD 之後：
renderEventNotice();
```

**Step 5: 在 startDay() 重置事件狀態**

```javascript
activeEvent = null;
noGPS = false;
nextEventTime = 5 + Math.random() * 10;
```

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 實作隨機事件系統（警察、救護車、導航失效）"
```

---

### Task 13: 結局畫面

**Files:**
- Modify: `index.html`

**Step 1: 實作結局渲染（依總分判斷）**

```javascript
function renderEnding() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.font = 'bold 24px monospace';

  let title, desc, color;
  if (totalScore >= 400) {
    title = '🏆 通勤達人！';
    desc = ['五天全勤，零事故', '老闆決定幫你加薪！', '（現實中不會這樣）'];
    color = '#f1c40f';
  } else if (totalScore >= 200) {
    title = '😅 普通上班族';
    desc = ['雖然偶有驚險', '但總算撐過這週了', '週末好好休息吧'];
    color = '#4af';
  } else if (totalScore >= 0) {
    title = '😓 辛苦的一週';
    desc = ['遲到罰款加路上驚嚇', '薪水幾乎都沒了', '要不要考慮搭捷運？'];
    color = '#e67e22';
  } else {
    title = '💀 通勤地獄';
    desc = ['這週真的很慘', '考慮在家工作吧', '或是搬到公司旁邊'];
    color = '#e74c3c';
  }

  ctx.fillStyle = color;
  ctx.fillText(title, W / 2, 140);

  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  desc.forEach((line, i) => {
    ctx.fillText(line, W / 2, 220 + i * 30);
  });

  ctx.fillStyle = '#aaa';
  ctx.font = '14px monospace';
  ctx.fillText(`最終分數：${totalScore}`, W / 2, 380);

  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#4af';
    ctx.fillText('按 Enter 重新開始', W / 2, 480);
  }
}
```

**Step 2: ENDING 的 Enter 鍵重置遊戲**

```javascript
else if (gameState === STATE.ENDING) {
  currentDay = 1;
  totalScore = 0;
  gameState = STATE.TITLE;
}
```

**Step 3: render() 加入 ENDING 分支**

```javascript
if (gameState === STATE.ENDING) renderEnding();
```

**Step 4: 最終完整遊戲確認清單**

- [ ] 標題畫面正常顯示，Enter 進入簡報
- [ ] 5 天簡報各有不同天氣/事件描述
- [ ] 機車可上下左右控制，道路捲動
- [ ] 靜態障礙物（違停、坑洞、路邊攤、施工）正確出現
- [ ] 動態障礙物（移動車輛、開車門、衝出機車、行人）正確出現
- [ ] 碰撞正確扣血，invincible 閃爍
- [ ] HUD 顯示正確（生命值、進度條、分數）
- [ ] 天氣效果（雨天雨滴、霧天遮罩）
- [ ] 隨機事件（警察停車、救護車靠邊、GPS 消失）
- [ ] 結算畫面依成敗顯示不同文字
- [ ] 5 天結束後顯示結局，Enter 重新開始
- [ ] 整個遊戲無 JS 錯誤

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 實作結局畫面，完成完整遊戲循環"
```

---

## 完整檔案結構

```
CommuteGame/
├── index.html          ← 全部遊戲程式碼（單一檔案）
├── CLAUDE.md
└── docs/
    └── plans/
        ├── 2026-03-10-commute-game-design.md
        └── 2026-03-10-commute-game-impl.md
```
