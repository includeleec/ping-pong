# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于HTML5 Canvas的乒乓球游戏，具有可调节难度系统。游戏支持多球对战（1-5个球同时存在）和速度调节功能。

## Architecture

### Core Files
- `index.html` - 游戏界面结构
- `game.js` - 游戏逻辑核心类 PingPongGame
- `styles.css` - 样式和响应式设计

### Key Components

#### Game Class Structure
- **Constructor**: 初始化画布、游戏对象、事件监听
- **Ball Management**: 多球系统（balls数组），支持1-5个球
- **Difficulty System**: 球数量、速度倍率、预设难度
- **Game Loop**: requestAnimationFrame驱动的游戏循环

#### Difficulty System
- 球数量：1-5个（通过ballCount控制）
- 速度倍率：0.8x-2.5x（通过ballSpeedMultiplier控制）
- 预设难度：easy/medium/hard/extreme

#### Control Interface
- 鼠标控制：mousemove事件监听
- 键盘控制：ArrowUp/ArrowDown键
- 游戏控制：开始/暂停/重置按钮
- 难度控制：下拉菜单（球数量、速度、预设）

## Development Commands

### Setup & Run
```bash
# 直接在浏览器中打开index.html即可运行游戏
# 无需构建步骤，纯前端项目
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### Testing
```bash
# 手动测试游戏功能
1. 在浏览器中打开index.html
2. 测试难度设置：
   - 选择不同球数量（1-5）
   - 调整速度等级（1-4）
   - 切换预设难度
3. 测试游戏控制：
   - 开始/暂停/重置游戏
   - 鼠标和键盘控制球拍
   - 得分和胜利条件
```

### Code Structure Analysis
```bash
# 主要方法调用链
init() → setupEventListeners() → setupDifficultyControls()
startGame() → gameLoop() → [updateBalls() + updateAI() + draw()] → requestAnimationFrame
```

### Customization Points
- **Ball Colors**: 在getBallColor()方法中修改颜色数组
- **Difficulty Presets**: 在setDifficultyPreset()方法中调整预设值
- **Game Rules**: 在checkWin()方法中修改胜利条件（当前为10分制）
- **Paddle Properties**: 在constructor中修改球拍尺寸、速度、颜色

### Key Methods to Modify
- `initializeBalls()` - 球初始化逻辑
- `updateBalls()` - 球物理更新
- `updateAI()` - AI行为逻辑
- `setDifficultyPreset()` - 难度预设配置