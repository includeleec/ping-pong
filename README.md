# 🏓 乒乓球游戏 (Ping Pong Game)

一个现代化的、可交互的HTML5乒乓球游戏，具有可调节的难度系统和精美的界面设计。

## 🎮 游戏特色

### ✨ 核心功能
- **多球对战**: 支持1-5个球同时游戏
- **智能AI**: AI会追踪最近的球进行防守
- **双控制模式**: 支持鼠标和键盘控制
- **实时难度调节**: 游戏过程中可调整难度
- **响应式设计**: 适配桌面和移动设备

### 🎯 难度系统
- **球数量**: 1-5个球可选
- **球速度**: 慢速、中速、快速、极速
- **预设难度**:
  - 简单: 1个球，0.8倍速
  - 中等: 2个球，1.2倍速
  - 困难: 3个球，1.8倍速
  - 极限: 5个球，2.5倍速

## 🚀 快速开始

### 方式1: 直接运行
```bash
# 克隆项目
git clone [repository-url]
cd ping-pong-game

# 直接在浏览器中打开
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### 方式2: 本地服务器
```bash
# 使用Python
python -m http.server 8000
# 访问 http://localhost:8000

# 使用Node.js
npx http-server
# 访问 http://localhost:8080
```

## 🎮 游戏操作

### 控制方式
- **鼠标**: 移动鼠标控制球拍位置
- **键盘**: 使用↑↓方向键控制球拍
- **点击**: 点击画布开始游戏
- **空格键**: 快速开始游戏

### 游戏规则
- 先得10分者获胜
- 球击中对方边界得1分
- 球击中球拍会改变方向
- 击中不同位置会影响球的反弹角度

## 🛠️ 技术栈

### 前端技术
- **HTML5 Canvas**: 游戏渲染
- **CSS3**: 响应式界面设计
- **JavaScript ES6**: 游戏逻辑
- **CSS Grid/Flexbox**: 布局系统

### 核心类结构
```
PingPongGame
├── 游戏状态管理 (gameRunning, gamePaused)
├── 多球系统 (balls数组)
├── 难度系统 (ballCount, ballSpeedMultiplier)
├── AI逻辑 (updateAI, 追踪最近球)
├── 物理引擎 (碰撞检测, 反弹计算)
└── 渲染系统 (Canvas绘制)
```

## 🎨 界面设计

### 视觉特色
- **渐变背景**: 现代化的蓝色渐变
- **阴影效果**: 球和球拍的动态阴影
- **动画过渡**: 按钮和控制的平滑动画
- **响应式布局**: 移动端适配

### 颜色方案
- 主色调: `#2563eb` (蓝色)
- 玩家: `#10b981` (绿色)
- AI: `#ef4444` (红色)
- 球: 多彩配色系统

## 🔧 开发指南

### 项目结构
```
ping-pong-game/
├── index.html          # 游戏界面
├── game.js             # 游戏逻辑核心
├── styles.css          # 样式文件
├── README.md           # 项目文档
└── CLAUDE.md           # 开发指南
```

### 核心方法
- `initializeBalls()`: 初始化球系统
- `updateBalls()`: 球物理更新
- `updateAI()`: AI行为逻辑
- `setDifficultyPreset()`: 难度预设配置
- `gameLoop()`: 主游戏循环

### 自定义开发

#### 修改球属性
```javascript
// 在constructor中修改
this.balls = [{
    radius: 15,      // 球大小
    color: '#ff0000' // 球颜色
}]
```

#### 调整AI难度
```javascript
// 在updateAI方法中修改
this.ai.speed = 6;  // 增加AI反应速度
```

#### 修改胜利条件
```javascript
// 在checkWin方法中修改
if (this.playerScore >= 15) { // 改为15分制
```

## 📱 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 16+
- ✅ 移动端浏览器

## 🎯 未来改进方向

- [ ] 音效系统
- [ ] 多人对战模式
- [ ] 排行榜功能
- [ ] 自定义球拍样式
- [ ] 粒子特效
- [ ] 游戏存档

## 🤝 贡献指南

欢迎提交Issues和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 项目亮点

- **零依赖**: 纯原生HTML/CSS/JS实现
- **轻量级**: 文件总大小 < 50KB
- **高性能**: 60FPS流畅体验
- **易扩展**: 模块化代码结构
- **国际化**: 中文界面，易于本地化

---

**享受游戏吧！** 🏓✨
