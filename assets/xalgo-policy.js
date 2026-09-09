/**
 * 政策协议页（/policies/*）目录导航生成器
 * 依赖 xalgo-custom.css 中的 .policy-toc / .policy-has-toc 样式。
 * 逻辑：
 *  1. 扫描 .shopify-policy__body 内的 h2/h3，补全 id 作为锚点
 *  2. 生成左侧目录（桌面 sticky / 移动端收纳盒）
 *  3. IntersectionObserver 滚动高亮当前章节
 * 没有任何 h2/h3 标题时不渲染目录，页面保持纯文章排版。
 */
(function () {
  'use strict';

  var container = document.querySelector('.shopify-policy__container');
  if (!container) return;

  /* 政策正文容器：优先官方类名，兜底取标题后的第一个兄弟元素并补上类名 */
  var body = container.querySelector('.shopify-policy__body');
  if (!body) {
    var title = container.querySelector('.shopify-policy__title');
    body = title ? title.nextElementSibling : null;
    if (body && body.tagName !== 'H1') body.classList.add('shopify-policy__body');
  }
  if (!body || !body.classList.contains('shopify-policy__body')) return;

  var headings = body.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  var usedIds = {};
  var tocItems = [];

  function slugify(text) {
    var slug = text
      .toLowerCase()
      .replace(/[^\w一-龥\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
    if (!slug) slug = 'section';
    if (usedIds[slug]) {
      usedIds[slug] += 1;
      slug = slug + '-' + usedIds[slug];
    } else {
      usedIds[slug] = 1;
    }
    return slug;
  }

  headings.forEach(function (heading) {
    if (!heading.id) heading.id = slugify(heading.textContent || '');
    if (!heading.id) return;
    tocItems.push({
      id: heading.id,
      text: (heading.textContent || '').trim(),
      level: heading.tagName === 'H3' ? 2 : 1,
      el: heading,
    });
  });

  if (tocItems.length < 2) return;

  /* —— 构建目录 DOM —— */
  var nav = document.createElement('nav');
  nav.className = 'policy-toc';
  nav.setAttribute('aria-label', 'Table of contents');

  var label = document.createElement('div');
  label.className = 'policy-toc__label';
  label.textContent = 'Contents';
  nav.appendChild(label);

  var list = document.createElement('ul');
  list.className = 'policy-toc__list';

  var links = {};
  tocItems.forEach(function (item) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + item.id;
    a.textContent = item.text;
    if (item.level === 2) a.classList.add('policy-toc__sub');
    a.dataset.tocTarget = item.id;
    li.appendChild(a);
    list.appendChild(li);
    links[item.id] = a;
  });
  nav.appendChild(list);

  /* 锚点平滑滚动 + 修正 sticky header 遮挡（CSS scroll-margin-top 已兜底） */
  nav.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-toc-target]');
    if (!link) return;
    var target = document.getElementById(link.dataset.tocTarget);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + link.dataset.tocTarget);
  });

  container.classList.add('policy-has-toc');
  body.parentNode.insertBefore(nav, body);

  /* —— 滚动高亮 —— */
  function setActive(id) {
    Object.keys(links).forEach(function (key) {
      links[key].classList.toggle('is-active', key === id);
    });
  }

  if ('IntersectionObserver' in window) {
    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        for (var i = 0; i < tocItems.length; i++) {
          if (visible[tocItems[i].id]) {
            setActive(tocItems[i].id);
            return;
          }
        }
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    tocItems.forEach(function (item) {
      observer.observe(item.el);
    });
  }

  setActive(tocItems[0].id);
})();
