# 样式快照 · 2026-10-23（无渐变版）

当前线上使用的样式：纯色浅蓝灰背景 + 毛玻璃导航 + 圆角论文卡片 + 极简页脚，
所有渐变都已替换为纯色。

## 包含的文件

```
_sass/_custom.scss          视觉主文件（背景、导航、标题、卡片、徽章、页脚、动效）
_sass/_variables.scss       字体栈（系统 UI 字体）
assets/css/main.scss        主题入口，末尾 @import "custom"
assets/js/custom.js         滚动进度条 + 内容渐显
_includes/footer.html       页脚一行版权
_includes/masthead.html     导航（Profile 链接）
_includes/paper-box.html    论文卡片模板
_includes/scripts.html      引入 custom.js
_layouts/default.html       页面骨架（引入页脚）
```

## 还原

```bash
cp -R _style-backup/2026-10-23-flat/_sass .
cp -R _style-backup/2026-10-23-flat/assets .
cp -R _style-backup/2026-10-23-flat/_includes .
cp -R _style-backup/2026-10-23-flat/_layouts .
bundle exec jekyll build
```

渐变版快照在 `_style-backup/2026-10-23-gradient/`。
