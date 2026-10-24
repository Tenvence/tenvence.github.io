# 样式快照 · 2026-10-23（渐变卡片版）

当前线上使用的样式（浅蓝紫渐变背景 + 毛玻璃导航 + 圆角论文卡片 + 极简页脚）。
之后如果把样式改坏了，把这里的文件拷回仓库根目录即可还原。

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
# 在仓库根目录执行
cp -R _style-backup/2026-10-23-gradient/_sass .
cp -R _style-backup/2026-10-23-gradient/assets .
cp -R _style-backup/2026-10-23-gradient/_includes .
cp -R _style-backup/2026-10-23-gradient/_layouts .
bundle exec jekyll build
```

只想改回样式、不动内容时，还原 `_sass/` 和 `assets/css/` 即可。

> 没有包含 `_config.yml`（里面有论文集合、排除目录等内容配置），避免还原时覆盖内容相关的设置。
