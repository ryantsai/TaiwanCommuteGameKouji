# Taiwan Commute Game Kouji

2D 通勤探索小遊戲（Phaser 3 + Vite）。

## 開發 / 執行

```bash
npm install
npm run dev
```

開啟 `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## 遊玩方式

- 移動：`WASD` 或方向鍵
- 互動：`E`
- 觸控：左下虛擬方向鍵移動、右下 `E` 按鈕互動
- 目標：在限時內完成通勤任務鏈
  1. 去便利店買早餐
  2. 送文件到客戶端（藍色車）
  3. 去公司打卡
  4. 到警察點解除罰單

## 目前內容

- Phaser 3 模組化場景
- 可移動探索地圖、碰撞、鏡頭跟隨
- 4 段任務故事 + 限時挑戰
- 雨天事件演出
- GitHub Pages（docs 輸出）

## 素材來源與授權

本專案目前使用 **Kenney Asset Pack** 素材（你本機 `/home/ryan/Kenney`）與其音效，
使用檔案位於：

- `src/assets/images/player_bike.png`
- `src/assets/images/poi_shop.png`
- `src/assets/images/poi_office.png`
- `src/assets/images/poi_police.png`
- `src/assets/images/poi_customer.png`
- `src/assets/audio/bgm_time_driving.ogg`
- `src/assets/audio/sfx_interact.ogg`

授權：Kenney 官方素材（多數為 CC0 / 可自由使用，仍建議保留出處）。
