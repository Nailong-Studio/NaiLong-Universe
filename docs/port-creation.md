# Port Creation · 新 Port 创建指南

对标 `catppuccin/docs/port-creation.md`。

## 1. 选品类

在 `resources/ports.yml` 选 `category`：`editor` / `terminal` / `os` / `wallpaper` / `browser` 等。

## 2. 建仓

```bash
gh repo create Nailong-Studio/<port-name> --public --description "奶龙主题 · <工具名>"
```

仓库结构（参考 `themes/vscode/`）：

```
<port-name>/
├── palette.json -> 软链或复制自 NaiLong-Universe/palette.json（定期同步）
├── package.json / 主题文件
├── themes/ 或对应配置目录
├── README.md
└── LICENSE
```

## 3. 接入 palette

- 复制 `palette.json` 到新仓根目录，或 `git submodule add https://github.com/Nailong-Studio/NaiLong-Universe palette`
- 新增 `scripts/generate.py` 或直接复用 `NaiLong-Universe/scripts/generate.py` 生成对应配置

## 4. 注册

在 `NaiLong-Universe/resources/ports.yml` 添加条目，PR 到主仓。

## 5. 发布

- 独立仓自行 `vsce publish` / 发包
- 主仓 `wallpapers/` 已独立为 `Nailong-Studio/wallpaper`，新壁纸请提至该仓

## 模板

可直接参考主仓 `themes/vscode/` 的目录结构。
