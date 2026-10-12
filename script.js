/* QALANDAR® V3 — multilingual luxury portfolio | vanilla JavaScript */
'use strict';

const FORM_ENDPOINT = 'https://formspree.io/f/xwlvqzez';
const GITHUB_USER = 'kalandardev';
const DICTIONARIES = window.PORTFOLIO_TRANSLATIONS || {};
const SUPPORTED_LANGUAGES = ['en', 'ru', 'de', 'uz'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const listen = (el, type, fn, opts) => el?.addEventListener(type, fn, opts);

let language = 'en';
let githubRepositories = [];
let githubState = 'loading';
let activeFilter = 'all';
let formState = 'idle';
let formErrorText = '';
let roleIndex = 0;

function tr(key) {
  return DICTIONARIES[language]?.[key] ?? DICTIONARIES.en?.[key] ?? key;
}

function applyTranslations() {
  document.documentElement.lang = language;
  document.title = tr('pageTitle');
  const meta = $('#siteDescription');
  if (meta) meta.content = tr('pageDescription');
  $$('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach(el => { el.placeholder = tr(el.dataset.i18nPlaceholder); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.i18nAria)); });
  const role = $('#rotatingRole');
  if (role) role.textContent = tr(`role${roleIndex}`);
  const button = $('#menuToggle');
  if (button) button.setAttribute('aria-label', tr(button.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen'));
  const portrait = $('.hero-art');
  if (portrait) portrait.setAttribute('aria-label', tr('portraitAria'));
  updateFormFeedback();
  renderRepos();
}

function setLanguage(value) {
  language = SUPPORTED_LANGUAGES.includes(value) ? value : 'en';
  try { localStorage.setItem('qalandarLanguage', language); } catch { /* Private browsing. */ }
  const picker = $('#languageSelect');
  if (picker) picker.value = language;
  applyTranslations();
}

try { language = localStorage.getItem('qalandarLanguage') || 'en'; } catch { /* Storage unavailable. */ }
listen($('#languageSelect'), 'change', e => setLanguage(e.target.value));

// Preloader: failsafe prevents the overlay from blocking the page.
const preloader = $('#preloader');
function closePreloader() {
  if (!preloader) return;
  preloader.classList.add('is-done');
  window.setTimeout(() => preloader.remove(), reduceMotion ? 0 : 550);
}
if (reduceMotion) closePreloader();
else {
  listen(window, 'load', () => window.setTimeout(closePreloader, 350), { once: true });
  window.setTimeout(closePreloader, 1800);
}

// Responsive menu.
const menuToggle = $('#menuToggle');
const navList = $('#navList');
function toggleMenu(open) {
  if (!menuToggle || !navList) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', tr(open ? 'menuClose' : 'menuOpen'));
  navList.classList.toggle('is-open', open);
}
listen(menuToggle, 'click', () => toggleMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('.nav-link').forEach(link => listen(link, 'click', () => toggleMenu(false)));
listen(document, 'keydown', event => { if (event.key === 'Escape') toggleMenu(false); });
listen(document, 'click', event => {
  if (navList?.classList.contains('is-open') && !event.target.closest('.nav')) toggleMenu(false);
});
listen(window, 'resize', () => { if (window.innerWidth > 900) toggleMenu(false); });

// Scroll progress, header and top button.
const progress = $('#scrollProgress');
const header = $('#siteHeader');
const backToTop = $('#backToTop');
let scrollPending = false;
function syncScroll() {
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  if (progress) progress.style.width = `${max ? Math.min(100, 100 * scrollY / max) : 0}%`;
  header?.classList.toggle('is-scrolled', scrollY > 20);
  backToTop?.classList.toggle('is-visible', scrollY > 550);
  scrollPending = false;
}
listen(window, 'scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(syncScroll);
  }
}, { passive: true });
listen(window, 'resize', syncScroll);
listen(backToTop, 'click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' }));
syncScroll();

// Section fade-in animations (fallback: everything visible).
function watchReveals(root = document) {
  const elements = $$('.reveal:not(.is-visible)', root);
  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }
  if (!window.portfolioRevealObserver) {
    window.portfolioRevealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        window.portfolioRevealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
  }
  elements.forEach(el => window.portfolioRevealObserver.observe(el));
}
watchReveals();

// Active section in navigation.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.nav-link').forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -55% 0px' });
  $$('main section[id]').forEach(section => observer.observe(section));
}

// Rotating accent words; disabled for reduced motion.
if (!reduceMotion) {
  window.setInterval(() => {
    roleIndex = (roleIndex + 1) % 3;
    const role = $('#rotatingRole');
    if (role) {
      role.classList.remove('role-swapped');
      void role.offsetWidth;
      role.textContent = tr(`role${roleIndex}`);
      role.classList.add('role-swapped');
    }
  }, 3800);
}

// Portrait: on desktop pointer hover; on touch click; keyboard Enter/Space.
const art = $('.hero-art');
function showPortrait() { art?.classList.toggle('show-portrait'); }
listen(art, 'click', showPortrait);
listen(art, 'keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showPortrait();
  }
});

// Projects: live GitHub public repository data. Never expose private repositories.
const repoGrid = $('#workGrid');
const repoStatus = $('#repoStatus');
const projectCount = $('#projectCount');
function safeHttps(input) {
  try { const url = new URL(input); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
function makeNode(tag, className, textValue) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textValue !== undefined) el.textContent = textValue;
  return el;
}
function createRepoCard(repo) {
  const article = makeNode('article', 'work-card repo-card reveal is-visible');
  article.dataset.category = 'github';
  const visual = makeNode('div', 'repo-visual');
  const icon = makeNode('div', 'repo-visual-symbol', '</>');
  icon.setAttribute('aria-hidden', 'true');
  visual.append(icon, makeNode('span', 'visual-marker', tr('repoPublic')));
  const info = makeNode('div', 'work-info');
  const status = makeNode('div', 'work-status');
  status.append(makeNode('span', 'status-pill', repo.name === GITHUB_USER ? tr('repoProfile') : tr('repoPublic')),
                makeNode('span', 'project-number', (repo.language || 'GITHUB').toUpperCase()));
  info.append(status, makeNode('h3', '', repo.name),
    makeNode('p', '', repo.description || (repo.name === GITHUB_USER ? tr('repoProfile') : repo.name)));
  const links = makeNode('div', 'work-links');
  const link = makeNode('a', '', tr('repoView') + ' ↗');
  link.href = safeHttps(repo.html_url) || `https://github.com/${GITHUB_USER}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  links.append(link);
  const website = safeHttps(repo.homepage);
  if (website) {
    const homepage = makeNode('a', 'repo-homepage-link', tr('repoWebsite') + ' ↗');
    homepage.href = website;
    homepage.target = '_blank';
    homepage.rel = 'noopener noreferrer';
    links.append(homepage);
  }
  info.append(links);
  article.append(visual, info);
  return article;
}
function updateFilter() {
  $$('[data-filter]').forEach(button => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $$('.work-card[data-category]', repoGrid).forEach(card => {
    card.hidden = activeFilter !== 'all' && card.dataset.category !== activeFilter;
  });
}
function renderRepos() {
  if (!repoGrid) return;
  $$('.repo-card', repoGrid).forEach(card => card.remove());
  githubRepositories.forEach(repo => repoGrid.append(createRepoCard(repo)));
  if (projectCount) projectCount.textContent = String(1 + githubRepositories.length).padStart(2, '0');
  if (repoStatus) {
    if (githubState === 'loading') repoStatus.textContent = tr('reposLoading');
    else if (githubState === 'error') {
      repoStatus.textContent = tr('reposError') + ' ';
      const link = makeNode('a', '', tr('githubProfileLink') + ' ↗');
      link.href = `https://github.com/${GITHUB_USER}?tab=repositories`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      repoStatus.append(link);
    } else if (!githubRepositories.length) repoStatus.textContent = tr('reposEmpty');
    else repoStatus.textContent = '';
  }
  updateFilter();
}
$$('[data-filter]').forEach(button => listen(button, 'click', () => {
  activeFilter = button.dataset.filter;
  updateFilter();
}));

async function loadGitHubRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid API response');
    githubRepositories = data.filter(repo => !repo.private && !repo.fork && repo.owner?.login?.toLowerCase() === GITHUB_USER && typeof repo.name === 'string');
    githubState = 'loaded';
  } catch (error) {
    console.warn('GitHub public repositories are temporarily unavailable:', error);
    githubState = 'error';
  }
  renderRepos();
}
renderRepos();
loadGitHubRepos();

// Subtle cursor aura, pointer devices only.
const aura = $('#cursorAura');
if (aura && !reduceMotion && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let pending = false;
  let x = -1000, y = -1000;
  listen(window, 'pointermove', e => {
    x = e.clientX;
    y = e.clientY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => {
        aura.style.transform = `translate3d(${x - 290}px,${y - 290}px,0)`;
        aura.classList.add('is-visible');
        pending = false;
      });
    }
  }, { passive: true });
  listen(document, 'mouseleave', () => aura.classList.remove('is-visible'));
}

// Formspree contact form, AJAX with true success/error feedback.
const form = $('#contactForm');
const submit = form?.querySelector('[type="submit"]');
const feedback = $('#formFeedback');
function updateFormFeedback() {
  if (!feedback) return;
  const states = { idle: 'formHint', sending: 'formSending', success: 'formSuccess', missing: 'formMissing', network: 'formNetwork', error: 'formError' };
  feedback.textContent = formState === 'error' && formErrorText ? formErrorText : tr(states[formState] || 'formHint');
  feedback.className = 'form-help' + (formState === 'success' ? ' is-success' : ['missing','error','network'].includes(formState) ? ' is-error' : '');
}
listen(form, 'submit', async event => {
  event.preventDefault();
  if (!form || !submit || submit.disabled) return;
  if (!form.reportValidity() || ['contactName','contactEmail','contactSubject','contactMessage'].some(id => !$('#'+id)?.value.trim())) {
    formState = 'missing';
    updateFormFeedback();
    return;
  }
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  formState = 'sending';
  updateFormFeedback();
  try {
    const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!response.ok) {
      formErrorText = '';
      try {
        const data = await response.json();
        if (Array.isArray(data.errors)) {
          formErrorText = data.errors.map(err => err.message).filter(Boolean).join(' ');
        }
      } catch { /* Use translated fallback. */ }
      formState = 'error';
    } else {
      formState = 'success';
      form.reset();
    }
  } catch {
    formState = 'network';
  } finally {
    submit.disabled = false;
    submit.removeAttribute('aria-busy');
    updateFormFeedback();
  }
});

if ($('#year')) $('#year').textContent = String(new Date().getFullYear());

// Initialize translations after all UI elements and state are declared.
setLanguage(language);
