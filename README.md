# NaiLong-Universe · 奶龙主题宇宙

<p align="center">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/assets/nailong-logo.jpg" alt="奶龙主题宇宙 logo" width="200">
</p>

> 警告：使用本主题包可能导致沉迷电脑、摸鱼率飙升、老板狂怒。奶龙不承担任何责任，奶龙只是个卖萌的。

一个让奶龙住进你电脑的仓库。开机见奶龙，写代码见奶龙，摸鱼也见奶龙。
从此你的电脑不再是电脑，是奶龙的窝。软件可以换，奶龙不能没有。

本仓库是**奶龙全家桶唯一主仓**：画廊、主题、终端配色、调色板全在这；图片素材（壁纸、表情包、logo、宣传视频）统一放素材仓 [`Nailong-Studio/wallpaper`](https://github.com/Nailong-Studio/wallpaper)（经子模块挂载到 `wallpapers/`）。

## 仓库里有啥

| 目录 | 内容 | 干啥用 |
| --- | --- | --- |
| `site/` | 数字美术馆（Astro 静态画廊，134 件作品） | 在线看奶龙 |
| `wallpapers/` | 壁纸素材库（子模块 → `Nailong-Studio/wallpaper`） | 让屏幕每一寸都是奶龙 |
| `themes/windows/` | Windows 桌面主题（.theme） | 开机就是奶龙的世界 |
| `themes/macos/` | macOS 外观设置指南 | 苹果也逃不过奶龙 |
| `themes/terminal/` | 终端配色（Windows Terminal / iTerm2 / VS Code 终端） | 敲命令都敲出奶龙味 |
| `themes/vscode/` | VS Code 主题包（Nailong Dark / Light，可 vsce 打包） | 编辑器也奶里奶气 |
| `palette.json` | 调色板唯一真源 | 改色只改这一个文件 |

## 画廊

在线浏览 134 张壁纸：https://nailong-studio.github.io/NaiLong-Universe/ （五大厅室分类浏览 + lightbox 下载，原图走 CDN 四档 WebP 实时转码）。

画廊源码在 `site/`（Astro 静态站），构建方式见 [site 说明](#开发)。

## 壁纸

134 张壁纸（子模块 [`Nailong-Studio/wallpaper`](https://github.com/Nailong-Studio/wallpaper)，`git clone --recurse-submodules` 或 `git submodule update --init` 拉取），分五馆陈列：`fullhd/` 22 张卡片海报风（1920x1080 **原图直出**）+ `classic/` 38 张名画系列 + `special/` 9 张特别艺术 + `phone/` 29 张竖屏 + `art/` 36 张艺术创作。

<p align="center">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/fullhd/nailong-01.jpg" alt="奶龙捧腹大笑壁纸" width="280">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/fullhd/nailong-13.jpg" alt="奶龙指脑袋大笑壁纸" width="280">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/fullhd/nailong-28.jpg" alt="奶龙狂笑壁纸" width="280">
</p>

全部壁纸见素材仓 [README](https://github.com/Nailong-Studio/wallpaper/blob/main/README.md)，用 `scripts/make_wallpapers.py` 可自行批量生成（请去素材仓提 PR）。

## 表情包素材库

奶龙表情包 22 张已入素材仓 `emotes/`（静态图 + GIF），拿去斗图、二次配字都行。

<p align="center">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/emotes/nailong-01.jpeg" alt="奶龙捧腹大笑" width="150">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/emotes/nailong-09.gif" alt="奶龙捧腹大笑动图" width="150">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/emotes/nailong-13.gif" alt="奶龙指脑袋大笑" width="150">
  <img src="https://raw.githubusercontent.com/Nailong-Studio/wallpaper/main/emotes/nailong-05.jpeg" alt="奶龙嘲讽大笑" width="150">
</p>

完整清单看素材仓 [emotes/README.md](https://github.com/Nailong-Studio/wallpaper/blob/main/emotes/README.md)。

## 快速开始

别急，一个一个来：

1. [画廊](https://nailong-studio.github.io/NaiLong-Universe/) - 先饱眼福
2. [壁纸](https://github.com/Nailong-Studio/wallpaper) - 再让桌面变成奶龙窝
3. [Windows 主题](themes/windows/README.md) - 窗口也要奶里奶气
4. [macOS 主题](themes/macos/README.md) - 苹果用户请自觉排队
5. [终端配色](themes/terminal/README.md) - 程序员快乐水
6. [VS Code 主题](themes/vscode/README.md) - 编辑器也逃不过
7. [表情包](https://github.com/Nailong-Studio/wallpaper/tree/main/emotes) - 斗图弹药，无限开火

## 支持矩阵

| 平台 | 壁纸 | 主题 | 终端配色 | 状态 |
| --- | --- | --- | --- | --- |
| Windows 10/11 | 有 | 有 | 有 | 建设中 |
| macOS | 有 | 有 | 有 | 建设中 |
| Linux (GNOME) | 有 | 画饼中 | 有 | 建设中 |
| VS Code | 有 | 有（Dark/Light） | 有 | 可用 |

状态说明：所谓"建设中"，就是"还没做完，但已经吹出去了"。

## 配色参考

- 底色：暖黑 `#121212`，选区暖棕 `#2E2511`，护眼到感动
- 主色：奶黄 `#FFD54F` / `#F9A825`，眼睛绿 `#66BB6A` / `#2E7D32` 点睛
- 文字：奶白 `#E8F5E9`
- 宗旨：深色系，夜猫子友好，老板不友好

## 调色板单源（必读，仿 Catppuccin，省得改错）

**不要手改 `themes/` 下的色值！** 全组织唯一真源是 `palette.json`（`version 1.0.0`，`nailongDark` / `nailongLight` 各 26 色，含 hex/RGB/HSL）。所有主题都由它生成：

```bash
# 生成全部
python3 scripts/generate.py --all
# 校验是否与单源一致（CI 会跑）
python3 scripts/generate.py --check
# 校验 VS Code 主题包是否与单源一致
python3 themes/vscode/scripts/generate.py --check
```

- 生成产物：`themes/terminal/nailong-vscode-terminal.json` / `windows-terminal.json` / `nailong.itermcolors` + `themes/windows/NaiLong.theme`
- VS Code 主题包（`themes/vscode/`）的 Dark/Light 两套主题与同一 `palette.json` 对齐
- 新增 Port：看 `docs/port-creation.md`，模板照抄即可
- 规范：`docs/style-guide.md` 已对齐 `catppuccin` 的 `palette` + `ports.yml` 机制

> 图片素材已独立为 `Nailong-Studio/wallpaper`（素材仓），主仓不再放图片，去那边提 PR。

## 开发

```bash
# 画廊（site/，Astro）
cd site
npm ci
npm run dev        # 本地开发
npm run build      # 构建 + 内容校验 + 链接自检，产物在 site/dist

# 主题生成
python3 scripts/generate.py --all
python3 themes/vscode/scripts/generate.py --check
```

## 贡献

欢迎投喂（先看 `docs/style-guide.md`）：

- **壁纸/表情包/素材**：已独立为 `Nailong-Studio/wallpaper`，请去那边按分辨率提 PR，主仓不再收图片
- **主题/终端**：一律改 `palette.json`，跑 `python3 scripts/generate.py --all`，**不要手改 `themes/`**；新增工具看 `docs/port-creation.md`
- 命名别乱来，格式 `nai-long-<场景>-<编号>`
- 提交前跑 `python3 scripts/generate.py --check` 保证与单源一致，再看 README 要不要跟着改

## 版权声明

- 奶龙角色形象版权归其版权方所有，本项目是粉丝向资源合集
- 壁纸与表情包素材来自网络公开资源，为粉丝整理，非官方出品
- 请只上传合法来源的资源
- 本项目纯属用爱发电，不做任何商业用途
