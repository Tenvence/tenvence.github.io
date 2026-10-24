# 样式快照 · 2026-10-23（暖色书页，当前）

暖白书页背景 `#fffdfa`（rgb 255,253,250） + 深红主题 `#881b1a`（`#6f1615` 用于白字徽章与悬停） + 衬线标题 + 圆角卡片 + 极简页脚（上下留白都等于 section 间距）；导航为悬浮胶囊 + 毛玻璃；
头像为去底后的透明 PNG（`images/profile.png`）。

## 还原

```bash
cp -R _style-backup/2026-10-23-warm/_sass .
cp -R _style-backup/2026-10-23-warm/assets .
cp -R _style-backup/2026-10-23-warm/_includes .
cp -R _style-backup/2026-10-23-warm/_layouts .
bundle exec jekyll build
```

其他快照：`2026-10-23-gradient/`（渐变）、`2026-10-23-flat/`、`2026-10-23-serif/`、`2026-10-23-blue/`（冷色背景版）。
