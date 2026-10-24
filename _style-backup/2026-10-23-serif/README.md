# 样式快照 · 2026-10-23（衬线标题版，当前）

纯色浅蓝灰背景 + 毛玻璃导航 + 圆角论文卡片 + 极简页脚；
侧边栏姓名和每个 section 标题（h1）使用衬线字体（Georgia）。

## 还原

```bash
cp -R _style-backup/2026-10-23-serif/_sass .
cp -R _style-backup/2026-10-23-serif/assets .
cp -R _style-backup/2026-10-23-serif/_includes .
cp -R _style-backup/2026-10-23-serif/_layouts .
bundle exec jekyll build
```

其他快照：
- `2026-10-23-gradient/` 渐变卡片版
- `2026-10-23-flat/` 无渐变、但标题仍是无衬线
