# Polyvanyi News ⚡️

Сучасний, адаптивний статичний новинний вебсайт про технології, AI та бізнес.
Оптимізовано для деплою на **GitHub Pages**: статичні HTML-сторінки статей для пошуковиків + легка клієнтська головна (Vanilla JS, Tailwind CSS, без бекенду).

## 🚀 Live Demo
👉 **[https://yomaxxxi.github.io/](https://yomaxxxi.github.io/)**

## 📂 Структура проєкту
- `index.html` + `js/app.js` — головна сторінка: тікер, hero, стрічка з фільтром категорій, пошук ⌘K, темна тема.
- `news/<slug>/index.html` — статична сторінка кожної статті (повний текст у HTML, canonical, Open Graph, JSON-LD `NewsArticle` + `BreadcrumbList`).
- `category/<ai|tech|gaming>/index.html`, `news/index.html` — сторінки розділів та архів.
- `data/news.json` — стрічка головної (останні 60 матеріалів, без повного тексту).
- `about/`, `privacy/` — «Про нас» і «Політика конфіденційності».
- `assets/site.css` — Tailwind, зібраний заздалегідь у `../portal_build` (Node.js; CDN більше не використовується).
- `sitemap.xml`, `feed.xml` (RSS), `robots.txt`, `404.html`, `favicon.ico`, `ads.txt` — SEO та монетизація.

Усе, крім `index.html`/`js/app.js`, генерується з `news.db` командою з кореня бота:

```bash
python3 sync_news_portal.py
```

Старі посилання `/?article=<slug>` автоматично перенаправляються на `/news/<slug>/`.

## 🛠 Технологічний стек
- HTML5 & CSS3
- Tailwind CSS 3 (збірка через `portal_build/`, плагін Typography)
- Vanilla JavaScript (ES6+)
- GitHub Pages
