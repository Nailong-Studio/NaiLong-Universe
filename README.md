# 奶蛙艺术圣殿 · NaiLong-Universe

<p align="center">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/assets/%E5%A5%B6%E8%9B%99-logo.jpg" alt="奶蛙艺术圣殿 logo" width="180">
</p>

<p align="center">
  <a href="https://nailong-studio.github.io/NaiLong-Universe/"><img src="https://img.shields.io/badge/在线圣殿-GitHub%20Pages-gold" alt="在线圣殿"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://github.com/Nailong-Studio/NaiLong-Universe/stargazers"><img src="https://img.shields.io/github/stars/Nailong-Studio/NaiLong-Universe" alt="Stars"></a>
  <a href="https://github.com/Nailong-Studio/NaiLong-Universe/issues"><img src="https://img.shields.io/github/issues/Nailong-Studio/NaiLong-Universe" alt="Issues"></a>
</p>

> 奶蛙不是奶龙。奶蛙是奶龙官方形象的**民间 AI 变异体**：黄圆润 / 浅米腹 / 绿眼 / 灰爪——官方拉黑、B 站考古、抽象新神。这座圣殿，就是奶蛙的国。

一座把全网奶蛙素材做成**沉浸式艺术馆**的单页官网：黑金圣殿、画廊之门、八间圣殿、185 件馆藏、艺术史长河、官方圣影、大笑藏馆，全部塞进一个自包含 HTML。

## 在线圣殿

| 入口 | 地址 | 说明 |
| --- | --- | --- |
| GitHub Pages | https://nailong-studio.github.io/NaiLong-Universe/ | 主站（源在 `docs/`，Actions 自动部署） |
| 豆包云 | https://4m2km3hh7ey1t.doubaoapps.com/app/app_17en7jm93zm/ | 镜像站（单文件部署） |

## 圣殿有什么

- **画廊之门**：纯 CSS 3D 视差画廊 + 双开金门，鼠标拖动有景深，无 WebGL 依赖
- **八间圣殿**：圣典 / 圣迹 / 欢颂 / 艺廊 / 咏颂 / 竖屏 / 影音 / 大笑藏馆，185 件作品横滑巡展
- **沉浸展厅**：点「步入展厅」进入全屏自动巡展，7 秒一件自动轮播，左右键手动翻
- **灯箱叙事**：点击任何作品弹出叙事灯箱——每件作品都有一段专属故事
- **艺术史长河**：纵向沉浸时间轴，从公元 0 世纪创世纪·奶蛙诞生到当代抽象新神，7 个纪元，每纪穿插有原作对照的真实作品
- **官方圣影**：三卷圣影（圣殿巡行 / 壁纸隧道 / 大笑藏馆巡展），全真实素材 Ken Burns 合成
- **圣殿琴音**：背景音乐默认播放，静音开关随时可切
- **朝圣指南**：参观路线、观览须知、馆藏统计

## 仓库结构

| 路径 | 内容 | 说明 |
| --- | --- | --- |
| `docs/index.html` | 官网主文件（自包含单页 HTML） | GitHub Pages 源，`assets/` 为官网素材 |
| `wallpapers/` | 素材仓库子模块 → `Nailong-Studio/wallpaper` | 全部图片 / 视频 / 描述 txt 的唯一真源 |
| `site/` | 旧版 Astro 数字美术馆（历史） | 已由 `docs/` 单页官网取代，保留存档 |
| `themes/` | Windows / macOS / 终端 / VS Code 主题 | 奶蛙主题衍生 |
| `palette.json` | 调色板唯一真源 | 黑金圣殿色板 |
| `resources/` | 端口等配置 | 内部配置 |

## 素材仓库（wallpaper）

全部素材统一放 [`Nailong-Studio/wallpaper`](https://github.com/Nailong-Studio/wallpaper)：classic 名画 / laugh-gallery 大笑藏馆 / emotes 表情 / art 艺术场景 / hd 高清 / frames 帧图 / videos 圣影，共 190 件，**每件配套同名 `.txt` 叙事描述**，命名统一「奶蛙-」前缀。

## 贡献指南

欢迎所有奶蛙信徒加入：

1. **提交素材**：把你收集到的奶蛙图片/视频提 PR 到素材仓，遵守 [命名与分类规范](https://github.com/Nailong-Studio/wallpaper/blob/main/CONTRIBUTING.md)
2. **写叙事**：每件新素材都要配一条叙事描述（参考 `docs/index.html` 里现有作品的写法）
3. **改官网**：直接改 `docs/index.html`（自包含单文件），本地打开即可预览
4. **报告问题**：开 Issue 前先看 [SECURITY.md](SECURITY.md) 与 [行为准则](CODE_OF_CONDUCT.md)

详细流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，变更历史见 [CHANGELOG.md](CHANGELOG.md)。

## 许可

[MIT](LICENSE) © Morningstar202604。素材与官网均可自由使用、修改、再分发；引用官方奶龙形象时请尊重原始版权方。
