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
- 目標：在限時內完成通勤任務鏈
  1. 去便利店買早餐
  2. 送文件到客戶端（藍色標記）
  3. 去公司打卡
  4. 到警察點解除罰單

## 已完成重點

- Canvas 單檔版重構為 **Phaser 3 + Vite**
- 模組化場景結構（`src/scenes`）
- 可移動探索地圖、碰撞、鏡頭跟隨
- 任務流程與事件系統（含限時挑戰）
- 基礎音效與雨天事件演出
- GitHub Pages 相容（`vite.config.js` 設定 `base: './'`）

## 素材來源與授權

目前開發階段使用的外部素材（原型）來自：

- Phaser Labs 公開示例素材（圖像/音訊）
  - `https://labs.phaser.io/assets/...`

> 後續正式商用前，建議替換為明確可商用授權素材（如 Kenney / itch.io 授權包 / OpenGameArt CC0），並在此處補齊作者與授權條款。
