/**
 * TechFlow News Portal - Native Client-Side Single Page Application
 * Optimized for GitHub Pages (zero backend, zero 404s, client-side query routing)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    articles: [],
    categories: [
      { slug: 'all', name: 'Головне' },
      { slug: 'ai', name: 'Штучний Інтелект' },
      { slug: 'tech', name: 'Технології' },
      { slug: 'auto', name: 'Авто' },
      { slug: 'business', name: 'Бізнес' },
      { slug: 'cybersecurity', name: 'Кібербезпека' }
    ],
    currentCategory: 'all',
    currentArticleSlug: null,
    searchQuery: '',
    visibleArticlesCount: 6,
    pageSize: 4,
    theme: 'dark'
  };

  // DOM Elements Cache
  const elements = {};

  // Category Color Badges Mapping
  const categoryColors = {
    ai: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    tech: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    auto: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    business: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    cybersecurity: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  /**
   * Initialize Application
   */
  async function init() {
    cacheDomElements();
    initTheme();
    setupEventListeners();
    await loadData();
    handleRoute();
  }

  /**
   * Cache DOM nodes for quick access
   */
  function cacheDomElements() {
    elements.homeView = document.getElementById('home-view');
    elements.articleView = document.getElementById('article-view');
    elements.breakingTicker = document.getElementById('breaking-ticker-content');
    elements.heroMain = document.getElementById('hero-main');
    elements.heroSidebar = document.getElementById('hero-sidebar');
    elements.categoryTabs = document.getElementById('category-tabs');
    elements.mobileCategoryTabs = document.getElementById('mobile-category-tabs');
    elements.newsFeed = document.getElementById('news-feed');
    elements.loadMoreBtn = document.getElementById('load-more-btn');
    elements.loadMoreContainer = document.getElementById('load-more-container');
    elements.trendingList = document.getElementById('trending-list');
    elements.singleArticleContent = document.getElementById('single-article-content');
    elements.relatedArticles = document.getElementById('related-articles');
    elements.searchModal = document.getElementById('search-modal');
    elements.searchInput = document.getElementById('search-input');
    elements.searchResults = document.getElementById('search-results');
    elements.themeToggleBtn = document.getElementById('theme-toggle-btn');
    elements.mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
    elements.mobileMenu = document.getElementById('mobile-menu');
    elements.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    elements.closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
    elements.openSearchBtn = document.getElementById('open-search-btn');
    elements.closeSearchBtn = document.getElementById('close-search-btn');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toast-message');
    elements.newsletterForm = document.getElementById('newsletter-form');
    elements.currentCategoryTitle = document.getElementById('current-category-title');
    elements.currentCategoryCount = document.getElementById('current-category-count');
  }

  /**
   * Theme Manager (Dark / Light mode) with localStorage persistence
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('techflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      state.theme = savedTheme;
    } else {
      state.theme = prefersDark ? 'dark' : 'light';
    }
    
    applyTheme(state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('techflow_theme', state.theme);
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeIcons();
  }

  function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcons = document.querySelectorAll('.theme-sun-icon');
    const moonIcons = document.querySelectorAll('.theme-moon-icon');

    sunIcons.forEach(icon => icon.classList.toggle('hidden', !isDark));
    moonIcons.forEach(icon => icon.classList.toggle('hidden', isDark));
  }

  /**
   * Fetch data from local data/news.json
   */
  async function loadData() {
    try {
      const response = await fetch('data/news.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      state.articles = data.articles || [];
      
      // Render static components
      renderBreakingTicker();
      renderHero();
      renderCategoryNavigation();
      renderTrendingSidebar();
    } catch (error) {
      console.error('Failed to load news data:', error);
      elements.newsFeed.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="inline-flex p-4 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Не вдалося завантажити стрічку новин</h3>
          <p class="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">Будь ласка, перевірте наявність файлу data/news.json або перезавантажте сторінку.</p>
          <button onclick="location.reload()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">Оновити сторінку</button>
        </div>
      `;
    }
  }

  /**
   * Client-side Routing Engine (URL query params & Popstate listener)
   */
  function handleRoute() {
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('article');
    const categorySlug = params.get('category');
    const searchQuery = params.get('q');

    // Also check hash fallback e.g. #article/slug
    let hashSlug = null;
    if (window.location.hash.startsWith('#article/')) {
      hashSlug = window.location.hash.replace('#article/', '');
    }

    const activeArticleSlug = articleSlug || hashSlug;

    if (activeArticleSlug) {
      showArticleView(activeArticleSlug);
    } else {
      if (categorySlug) {
        state.currentCategory = categorySlug;
      }
      if (searchQuery) {
        state.searchQuery = searchQuery;
      }
      showHomeView();
    }
  }

  function navigateToArticle(slug, pushState = true) {
    if (pushState) {
      const url = new URL(window.location);
      url.searchParams.delete('category');
      url.searchParams.delete('q');
      url.searchParams.set('article', slug);
      url.hash = '';
      window.history.pushState({ article: slug }, '', url);
    }
    showArticleView(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateToCategory(categorySlug, pushState = true) {
    state.currentCategory = categorySlug;
    state.visibleArticlesCount = 6; // reset pagination
    
    if (pushState) {
      const url = new URL(window.location);
      url.searchParams.delete('article');
      url.searchParams.delete('q');
      if (categorySlug === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', categorySlug);
      }
      url.hash = '';
      window.history.pushState({ category: categorySlug }, '', url);
    }

    showHomeView();
    renderFeed();
    updateActiveCategoryTabs();
  }

  function navigateToHome(pushState = true) {
    navigateToCategory('all', pushState);
  }

  /**
   * Switch to Single Article View
   */
  function showArticleView(slug) {
    state.currentArticleSlug = slug;
    const article = state.articles.find(a => a.slug === slug);

    if (!article) {
      renderArticleNotFound(slug);
      return;
    }

    // Hide home, show article container
    elements.homeView.classList.add('hidden');
    elements.articleView.classList.remove('hidden');

    // Update document title & Meta Tags for SEO
    document.title = `${article.title} — Polyvanyi News`;
    updateMetaTags(article);

    // Render Article Details
    renderSingleArticle(article);
    renderRelatedArticles(article);
  }

  /**
   * Switch to Home View
   */
  function showHomeView() {
    state.currentArticleSlug = null;
    elements.articleView.classList.add('hidden');
    elements.homeView.classList.remove('hidden');

    // Reset document title
    document.title = 'Polyvanyi News — Незалежний портал про технології та AI';
    resetMetaTags();

    renderFeed();
    updateActiveCategoryTabs();
  }

  /**
   * Dynamic Meta Tag SEO Injector
   */
  function updateMetaTags(article) {
    setMeta('meta[property="og:title"]', article.title);
    setMeta('meta[property="og:description"]', article.summary);
    setMeta('meta[property="og:image"]', article.image);
    setMeta('meta[property="og:type"]', 'article');
    setMeta('meta[name="twitter:title"]', article.title);
    setMeta('meta[name="twitter:description"]', article.summary);
    setMeta('meta[name="twitter:image"]', article.image);
  }

  function resetMetaTags() {
    setMeta('meta[property="og:title"]', 'Polyvanyi News — Незалежний портал про технології та AI');
    setMeta('meta[property="og:description"]', 'Свіжі новини про штучний інтелект, хардвер, стартапи та кібербезпеку.');
    setMeta('meta[property="og:type"]', 'website');
  }

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  }

  /**
   * Render Breaking News Ticker at the top
   */
  function renderBreakingTicker() {
    const breakingArticles = state.articles.filter(a => a.breaking);
    if (!elements.breakingTicker || breakingArticles.length === 0) return;

    elements.breakingTicker.innerHTML = breakingArticles
      .map(
        a => `
        <a href="?article=${a.slug}" style="color: #ffffff !important; text-decoration: none !important;" class="inline-flex items-center gap-2 text-white hover:text-indigo-300 transition breaking-link px-3 py-1 rounded-lg hover:bg-slate-800/80 group flex-shrink-0" data-slug="${a.slug}">
          <span style="background-color: #ef4444 !important; width: 6px; height: 6px; border-radius: 9999px; display: inline-block; flex-shrink: 0;"></span>
          <span style="color: #ffffff !important; font-weight: 600 !important;">${escapeHtml(a.title)}</span>
        </a>
      `
      )
      .join('<span style="color: #64748b !important;" class="select-none px-1 flex-shrink-0">•</span>');
  }

  /**
   * Render Hero Section (1 Main Feature + 3 Sidebar Highlights)
   */
  function renderHero() {
    if (!elements.heroMain || !elements.heroSidebar) return;

    const featured = state.articles.find(a => a.featured) || state.articles[0];
    const sideHighlights = state.articles
      .filter(a => a.id !== featured.id)
      .slice(0, 3);

    // Left Main Hero Card
    const catColor = categoryColors[featured.category_slug] || 'bg-slate-100 text-slate-800 border-slate-200';
    elements.heroMain.innerHTML = `
      <article class="relative group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-end min-h-[460px] lg:min-h-[520px] transition duration-500 cursor-pointer" data-slug="${featured.slug}">
        <!-- Image with smooth zoom -->
        <div class="absolute inset-0 z-0">
          <img src="${featured.image}" alt="${escapeHtml(featured.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 dark:brightness-75">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>

        <!-- Hero Content Overlay -->
        <div class="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-end">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="px-3.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${catColor}">
              ${escapeHtml(featured.category)}
            </span>
            <span class="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ${featured.reading_time}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 group-hover:text-indigo-300 transition-colors">
            ${escapeHtml(featured.title)}
          </h1>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl mb-6">
            ${escapeHtml(featured.summary)}
          </p>

          <div class="flex items-center justify-between pt-4 border-t border-white/10">
            <div class="flex items-center gap-2.5">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              <div>
                <p class="text-sm font-semibold text-white">${escapeHtml(featured.author.name)}</p>
                <p class="text-xs text-slate-400">${featured.date_formatted}</p>
              </div>
            </div>

            <span class="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
              Читати далі
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </span>
          </div>
        </div>
      </article>
    `;

    // Right Sidebar Highlights (3 Cards)
    elements.heroSidebar.innerHTML = sideHighlights
      .map((item, idx) => {
        const itemCatColor = categoryColors[item.category_slug] || 'bg-slate-100 text-slate-800';
        return `
        <article class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-sm hover:shadow-md cursor-pointer flex gap-4 group" data-slug="${item.slug}">
          <div class="w-24 sm:w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          </div>
          <div class="flex flex-col justify-between flex-grow">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md border ${itemCatColor}">
                  ${escapeHtml(item.category)}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">${item.reading_time}</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                ${escapeHtml(item.title)}
              </h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>${item.date_formatted}</span>
              <span>${item.reading_time}</span>
            </p>
          </div>
        </article>
      `;
      })
      .join('');
  }

  /**
   * Render Category Navigation Tabs (Desktop & Mobile)
   */
  function renderCategoryNavigation() {
    const renderButtons = container => {
      if (!container) return;
      container.innerHTML = state.categories
        .map(cat => {
          const isActive = state.currentCategory === cat.slug;
          return `
          <button 
            type="button"
            data-category="${cat.slug}" 
            class="category-nav-btn px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }">
            ${cat.name}
          </button>
        `;
        })
        .join('');
    };

    renderButtons(elements.categoryTabs);
    renderButtons(elements.mobileCategoryTabs);
  }

  function updateActiveCategoryTabs() {
    document.querySelectorAll('.category-nav-btn').forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const isActive = cat === state.currentCategory;
      if (isActive) {
        btn.className =
          'category-nav-btn px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap bg-indigo-600 text-white shadow-md shadow-indigo-600/20';
      } else {
        btn.className =
          'category-nav-btn px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800';
      }
    });

    // Update section title & count
    const activeCategoryObj = state.categories.find(c => c.slug === state.currentCategory) || state.categories[0];
    if (elements.currentCategoryTitle) {
      elements.currentCategoryTitle.textContent = activeCategoryObj.name;
    }

    const filtered = getFilteredArticles();
    if (elements.currentCategoryCount) {
      elements.currentCategoryCount.textContent = `${filtered.length} матеріалів`;
    }
  }

  /**
   * Filter and paginate articles for the main grid
   */
  function getFilteredArticles() {
    let list = state.articles;

    // Filter by category
    if (state.currentCategory && state.currentCategory !== 'all') {
      list = list.filter(a => a.category_slug === state.currentCategory);
    }

    // Filter by search query if set
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Render Main Article Feed Grid
   */
  function renderFeed() {
    if (!elements.newsFeed) return;

    const filtered = getFilteredArticles();
    const visible = filtered.slice(0, state.visibleArticlesCount);

    if (visible.length === 0) {
      elements.newsFeed.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Новин не знайдено</h3>
          <p class="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">За обраними фільтрами немає доступних публікацій. Спробуйте змінити категорію.</p>
          <button id="reset-feed-filter-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">Показати всі новини</button>
        </div>
      `;

      const resetBtn = document.getElementById('reset-feed-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => navigateToCategory('all'));
      }

      if (elements.loadMoreContainer) elements.loadMoreContainer.classList.add('hidden');
      return;
    }

    elements.newsFeed.innerHTML = visible.map(article => createArticleCard(article)).join('');

    // Toggle Load More button
    if (elements.loadMoreContainer) {
      if (state.visibleArticlesCount < filtered.length) {
        elements.loadMoreContainer.classList.remove('hidden');
      } else {
        elements.loadMoreContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Generate Article Card HTML
   */
  function createArticleCard(article) {
    const catColor = categoryColors[article.category_slug] || 'bg-slate-100 text-slate-800 border-slate-200';
    return `
      <article class="news-card group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer" data-slug="${article.slug}">
        <!-- Thumbnail -->
        <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src="${article.image}" alt="${escapeHtml(article.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${catColor}">
              ${escapeHtml(article.category)}
            </span>
          </div>
          ${
            article.breaking
              ? `<div class="absolute top-4 right-4"><span class="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-600 text-white flex items-center gap-1 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>ТЕРМІНОВО</span></div>`
              : ''
          }
        </div>

        <!-- Body -->
        <div class="p-6 flex flex-col justify-between flex-grow">
          <div>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ${article.reading_time}
              </span>
              <span>•</span>
              <time datetime="${article.date}">${article.date_formatted}</time>
            </div>

            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              ${escapeHtml(article.title)}
            </h3>

            <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6">
              ${escapeHtml(article.summary)}
            </p>
          </div>

          <!-- Footer Meta -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(article.author.name)}</span>
            </div>
            <span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Читати далі →
            </span>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render Trending Articles in Sidebar (Top 5 Ranked)
   */
  function renderTrendingSidebar() {
    if (!elements.trendingList) return;

    const recommended = [...state.articles].slice(0, 5);

    elements.trendingList.innerHTML = recommended
      .map((item, index) => {
        const rank = index + 1;
        const rankColor =
          rank === 1
            ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
            : rank === 2
            ? 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            : rank === 3
            ? 'text-slate-600 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            : 'text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';

        return `
        <li class="trending-item flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer group" data-slug="${item.slug}">
          <span class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm border ${rankColor}">
            0${rank}
          </span>
          <div class="flex-grow">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              ${escapeHtml(item.category)}
            </span>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              ${escapeHtml(item.title)}
            </h4>
            <div class="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>${item.date_formatted}</span>
              <span>•</span>
              <span>${item.reading_time}</span>
            </div>
          </div>
        </li>
      `;
      })
      .join('');
  }

  /**
   * Render Single Article Page View
   */
  function renderSingleArticle(article) {
    if (!elements.singleArticleContent) return;

    const catColor = categoryColors[article.category_slug] || 'bg-slate-100 text-slate-800 border-slate-200';

    // Inject in-article native ad after paragraph 2 or halfway
    let formattedBody = article.content;
    const pTag = '</p>';
    const firstPIndex = formattedBody.indexOf(pTag);
    if (firstPIndex !== -1) {
      const secondPIndex = formattedBody.indexOf(pTag, firstPIndex + pTag.length);
      const insertIndex = secondPIndex !== -1 ? secondPIndex + pTag.length : firstPIndex + pTag.length;

      const inArticleAdHtml = `
        <div class="my-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl" data-ad-slot="in-article-native">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Реклама / Sponsored</span>
            <span class="text-xs text-slate-400">партнерський блок</span>
          </div>
          <div class="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-indigo-200/50 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="font-bold text-slate-900 dark:text-white text-base">Шукаєте надійний хмарний хостинг або GPU сервери для AI?</p>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Отримайте $100 безкоштовних кредитів на запуск LLM та Docker контейнерів за промокодом <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">TECHFLOW2026</span></p>
            </div>
            <a href="https://t.me/polyvanyi_news" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl transition whitespace-nowrap shadow-md">
              Дізнатися більше →
            </a>
          </div>
        </div>
      `;

      formattedBody =
        formattedBody.slice(0, insertIndex) + inArticleAdHtml + formattedBody.slice(insertIndex);
    }

    elements.singleArticleContent.innerHTML = `
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap" aria-label="Breadcrumb">
        <button type="button" class="breadcrumb-home hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">Головна</button>
        <span>/</span>
        <button type="button" class="breadcrumb-category hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium" data-category="${article.category_slug}">${escapeHtml(article.category)}</button>
        <span>/</span>
        <span class="text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs font-normal">${escapeHtml(article.title)}</span>
      </nav>

      <!-- Back Button -->
      <div class="mb-6">
        <button type="button" class="back-to-feed-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Повернутися до новин
        </button>
      </div>

      <!-- Article Header -->
      <header class="mb-8">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span class="px-3.5 py-1 text-xs font-semibold rounded-full border ${catColor}">
            ${escapeHtml(article.category)}
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Час читання: ${article.reading_time}
          </span>
        </div>

        <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.18] tracking-tight mb-6">
          ${escapeHtml(article.title)}
        </h1>

        <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
          ${escapeHtml(article.summary)}
        </p>

        <!-- Author & Date Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div>
              <p class="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
                <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                ${escapeHtml(article.author.name)}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(article.author.role)} • <time datetime="${article.date}">${article.date_formatted}</time></p>
            </div>
          </div>

          <!-- Social Share Buttons -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Поділитися:</span>
            
            <button type="button" class="share-btn share-tg p-2.5 rounded-xl bg-slate-100 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-300 hover:text-sky-500 transition" title="Поділитися у Telegram" data-network="telegram">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </button>

            <button type="button" class="share-btn share-tw p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition" title="Поділитися у X (Twitter)" data-network="twitter">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>

            <button type="button" class="share-btn share-copy p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition" title="Скопіювати посилання" data-network="copy">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Featured Image -->
      <figure class="mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-md">
        <img src="${article.image}" alt="${escapeHtml(article.title)}" class="w-full max-h-[520px] object-cover">
        ${
          article.image_caption
            ? `<figcaption class="p-3.5 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 italic">${escapeHtml(article.image_caption)}</figcaption>`
            : ''
        }
      </figure>

      <!-- Article Body with Prose Styling -->
      <div class="article-body prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-base sm:text-lg">
        ${formattedBody}
      </div>

      <!-- Author Bio Footer Box -->
      <div class="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
        <div class="text-center sm:text-left flex-grow">
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Автор матеріалу</span>
          <h4 class="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${escapeHtml(article.author.name)}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">${escapeHtml(article.author.role)}</p>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">Засновник та головний редактор каналу Polyvanyi News. Огляди штучного інтелекту, практичні гайди та щоденний моніторинг ключових технологічних проривів.</p>
        </div>
        <a href="https://t.me/polyvanyi_news" target="_blank" rel="noopener noreferrer" class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition shadow-md shadow-indigo-600/20 flex items-center gap-2">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          Telegram автора
        </a>
      </div>
    `;

    // Bind dynamic breadcrumb and share events inside article
    const breadcrumbHome = elements.singleArticleContent.querySelector('.breadcrumb-home');
    if (breadcrumbHome) breadcrumbHome.addEventListener('click', () => navigateToHome());

    const breadcrumbCat = elements.singleArticleContent.querySelector('.breadcrumb-category');
    if (breadcrumbCat) {
      breadcrumbCat.addEventListener('click', () => {
        navigateToCategory(article.category_slug);
      });
    }

    const backBtn = elements.singleArticleContent.querySelector('.back-to-feed-btn');
    if (backBtn) backBtn.addEventListener('click', () => navigateToHome());

    // Share buttons
    elements.singleArticleContent.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const network = btn.getAttribute('data-network');
        handleShare(network, article);
      });
    });
  }

  /**
   * Render Related Articles at the bottom of the article page
   */
  function renderRelatedArticles(currentArticle) {
    if (!elements.relatedArticles) return;

    let related = state.articles.filter(
      a => a.category_slug === currentArticle.category_slug && a.id !== currentArticle.id
    );

    // If not enough in same category, supplement with others
    if (related.length < 3) {
      const others = state.articles.filter(
        a => a.id !== currentArticle.id && !related.some(r => r.id === a.id)
      );
      related = [...related, ...others].slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    elements.relatedArticles.innerHTML = related
      .map(
        article => `
      <article class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col justify-between" data-slug="${article.slug}">
        <div class="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src="${article.image}" alt="${escapeHtml(article.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="p-5 flex flex-col justify-between flex-grow">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1.5">
              ${escapeHtml(article.category)}
            </span>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
              ${escapeHtml(article.title)}
            </h4>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span>${article.date_formatted}</span>
            <span>${article.reading_time}</span>
          </div>
        </div>
      </article>
    `
      )
      .join('');
  }

  /**
   * Render Not Found view if slug is invalid
   */
  function renderArticleNotFound(slug) {
    elements.homeView.classList.add('hidden');
    elements.articleView.classList.remove('hidden');

    elements.singleArticleContent.innerHTML = `
      <div class="py-20 text-center">
        <div class="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mb-4">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Статтю не знайдено</h2>
        <p class="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">Матеріал із посиланням <code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-indigo-600 font-mono text-sm">${escapeHtml(slug)}</code> було видалено або переміщено.</p>
        <button id="notfound-home-btn" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">Повернутися на головну</button>
      </div>
    `;

    const homeBtn = document.getElementById('notfound-home-btn');
    if (homeBtn) homeBtn.addEventListener('click', () => navigateToHome());
  }

  /**
   * Handle Social Sharing
   */
  function handleShare(network, article) {
    const url = window.location.href;
    const text = encodeURIComponent(article.title);

    switch (network) {
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            showToast('Посилання успішно скопійовано у буфер!');
          });
        } else {
          showToast('Адресу скопійовано!');
        }
        break;
    }
  }

  /**
   * Toast notification helper
   */
  function showToast(message) {
    if (!elements.toast || !elements.toastMessage) return;
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    elements.toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      elements.toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      elements.toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3200);
  }

  /**
   * Instant Search Modal Logic
   */
  function openSearchModal() {
    if (!elements.searchModal) return;
    elements.searchModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => {
      if (elements.searchInput) {
        elements.searchInput.focus();
      }
    }, 50);
  }

  function closeSearchModal() {
    if (!elements.searchModal) return;
    elements.searchModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.searchResults) elements.searchResults.innerHTML = '';
  }

  function performSearch(query) {
    if (!elements.searchResults) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      elements.searchResults.innerHTML = `
        <div class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
          Введіть ключове слово для пошуку по новинах, технологіях та AI...
        </div>
      `;
      return;
    }

    const matches = state.articles.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      elements.searchResults.innerHTML = `
        <div class="p-8 text-center">
          <p class="font-medium text-slate-800 dark:text-slate-200">Нічого не знайдено за запитом «${escapeHtml(query)}»</p>
          <p class="text-xs text-slate-500 mt-1">Спробуйте інші терміни, наприклад: Claude, Apple, M5, AI, чип</p>
        </div>
      `;
      return;
    }

    elements.searchResults.innerHTML = matches
      .map(
        a => `
      <div class="search-item p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer flex items-center justify-between gap-4" data-slug="${a.slug}">
        <div class="flex items-center gap-3">
          <img src="${a.image}" alt="" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">${escapeHtml(a.category)}</span>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">${escapeHtml(a.title)}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">${escapeHtml(a.summary)}</p>
          </div>
        </div>
        <span class="text-xs text-slate-400 flex-shrink-0">${a.reading_time}</span>
      </div>
    `
      )
      .join('');
  }

  /**
   * Event Listeners Registration
   */
  function setupEventListeners() {
    // Theme toggle buttons
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (elements.mobileThemeToggleBtn) {
      elements.mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Category click delegation
    document.addEventListener('click', e => {
      // Category Navigation Button
      const catBtn = e.target.closest('.category-nav-btn');
      if (catBtn) {
        e.preventDefault();
        const catSlug = catBtn.getAttribute('data-category');
        navigateToCategory(catSlug);
        closeMobileMenu();
        return;
      }

      // Article Card or Link Click
      const articleTrigger = e.target.closest('[data-slug]');
      if (articleTrigger) {
        e.preventDefault();
        const slug = articleTrigger.getAttribute('data-slug');
        navigateToArticle(slug);
        closeSearchModal();
        closeMobileMenu();
        return;
      }

      // Home link / Logo Click
      const homeLink = e.target.closest('.brand-logo-link');
      if (homeLink) {
        e.preventDefault();
        navigateToHome();
        closeMobileMenu();
        return;
      }
    });

    // Load More Button
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        state.visibleArticlesCount += state.pageSize;
        renderFeed();
      });
    }

    // Search Trigger & Modal
    if (elements.openSearchBtn) {
      elements.openSearchBtn.addEventListener('click', openSearchModal);
    }
    if (elements.closeSearchBtn) {
      elements.closeSearchBtn.addEventListener('click', closeSearchModal);
    }
    if (elements.searchModal) {
      elements.searchModal.addEventListener('click', e => {
        if (e.target === elements.searchModal) closeSearchModal();
      });
    }
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', e => {
        performSearch(e.target.value);
      });
    }

    // Keyboard Shortcuts: Cmd+K or Ctrl+K to search, Esc to close
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape') {
        closeSearchModal();
        closeMobileMenu();
      }
    });

    // Mobile Hamburger Menu
    if (elements.mobileMenuBtn) {
      elements.mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    if (elements.closeMobileMenuBtn) {
      elements.closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
    }

    // Newsletter Form Submit
    if (elements.newsletterForm) {
      elements.newsletterForm.addEventListener('submit', e => {
        e.preventDefault();
        const emailInput = elements.newsletterForm.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
          showToast(`Дякуємо! ${emailInput.value} успішно підписано на дайджест.`);
          emailInput.value = '';
        }
      });
    }

    // Popstate event for Browser Back / Forward buttons
    window.addEventListener('popstate', () => {
      handleRoute();
    });
  }

  function openMobileMenu() {
    if (!elements.mobileMenu) return;
    elements.mobileMenu.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeMobileMenu() {
    if (!elements.mobileMenu) return;
    elements.mobileMenu.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  /**
   * Utility to escape HTML and prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Self-bootstrapping on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
