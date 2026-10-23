# Selected Publications

{% comment %}
  每篇论文 = _papers/ 目录下的一个 Markdown 文件。
  front matter 里写 badge / image / order（决定排序），正文直接写 Markdown；
  通讯作者在姓名后写 ✉ 即可，模板会统一渲染成上标。
  新增论文：复制一个 _papers/*.md，改内容并设置 order 即可。
{% endcomment %}

{% assign selected_papers = site.papers | sort: "order" %}
{% for paper in selected_papers %}
{% include paper-box.html paper=paper %}
{% endfor %}
