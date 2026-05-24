/* ============================================================
   Little_100 — Personal Homepage Script
   ============================================================ */
(function () {
  'use strict';

  /* ── i18n (loaded from config.js) ─────────────────────── */
  var i18n = SITE_CONFIG.i18n;

  /* ── Language Detection & Persistence ────────────────── */
  var lang = localStorage.getItem('lang');
  if (!lang) {
    lang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (i18n[lang] && i18n[lang][key]) {
        el.textContent = i18n[lang][key];
      }
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }

  function toggleLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('lang', lang);
    applyLang();
    // Update work descriptions
    document.querySelectorAll('.work-item').forEach(function (item) {
      var key = item.getAttribute('data-desc-key');
      if (key && i18n[lang][key]) {
        var descEl = item.querySelector('.work-item__desc');
        if (descEl) descEl.textContent = i18n[lang][key];
      }
    });
    // Re-render categories with updated language
    renderBiliCategories(storedCategories);
  }

  /* ── Age Calculation ─────────────────────────────────── */
  function calcAge() {
    var birth = new Date(SITE_CONFIG.birthYear, SITE_CONFIG.birthMonth - 1, SITE_CONFIG.birthDay);
    var now = new Date();
    var age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
      age--;
    }
    var el = document.getElementById('age-value');
    if (el) el.textContent = age;
  }

  /* ── Preloader ───────────────────────────────────────── */
  var preloaderState = {
    windowLoaded: false,
    githubLoaded: false,
    biliLoaded: false,
    done: false
  };

  function createStars() {
    var container = document.getElementById('preloader-stars');
    if (!container) return;
    for (var i = 0; i < 40; i++) {
      var star = document.createElement('div');
      star.className = 'preloader__star';
      var size = Math.random() > 0.7 ? 3 : Math.random() > 0.5 ? 2 : 1;
      star.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (Math.random() * 100) + '%;' +
        'top:' + (Math.random() * 70) + '%;' +
        'animation-delay:' + (Math.random() * 3) + 's;' +
        'animation-duration:' + (1.5 + Math.random() * 2) + 's;';
      container.appendChild(star);
    }
  }

  var tips = SITE_CONFIG.tips;

  function randomTip() {
    var arr = tips[lang] || tips.en;
    var el = document.getElementById('preloader-tip');
    if (el) el.textContent = arr[Math.floor(Math.random() * arr.length)];
  }

  function markWindowLoaded() { preloaderState.windowLoaded = true; }
  function markGithubLoaded() { preloaderState.githubLoaded = true; }
  function markBiliLoaded() { preloaderState.biliLoaded = true; }

  /* Preloader: Real progress tracking
   * - 3 resources: window (40%), github (30%), bilibili (30%)
   * - Tool icon evolves based on real progress
   * - No fake timers; progress only moves when resources actually load
   */
  function runPreloader() {
    var bar = document.getElementById('preloader-bar');
    var pct = document.getElementById('preloader-percent');
    var stageEl = document.getElementById('preloader-stage');
    var preEl = document.getElementById('preloader');
    createStars();
    randomTip();

    var displayPercent = 0;
    var targetPercent = 0;

    // 3 action scenes: chop(0-39%), mine(40-74%), slay(75-100%)
    var scenes = [
      { pct: 0,  id: 'act-chop',  particleColor: '#8b6c42' },  // wood brown
      { pct: 40, id: 'act-mine',  particleColor: '#4DD0E1' },  // diamond cyan
      { pct: 75, id: 'act-slay',  particleColor: '#c850c0' }   // ender purple
    ];
    var currentSceneId = 'act-chop';

    // Generate tiny particles for each scene
    function initParticlesFx() {
      scenes.forEach(function(s) {
        var container = document.getElementById('particles-' + s.id.split('-')[1]);
        if (!container) return;
        for (var pi = 0; pi < 6; pi++) {
          var dot = document.createElement('div');
          dot.className = 'preloader__particle';
          var px = (Math.random() - 0.3) * 40;
          var py = -(Math.random() * 30 + 5);
          dot.style.cssText =
            'left:45%;top:45%;' +
            'background:' + s.particleColor + ';' +
            '--px:' + px.toFixed(0) + 'px;' +
            '--py:' + py.toFixed(0) + 'px;' +
            'animation-delay:' + (pi * 0.1).toFixed(1) + 's;';
          container.appendChild(dot);
        }
      });
    }
    initParticlesFx();

    function setScene(percent) {
      var targetSceneId = scenes[0].id;
      for (var si = scenes.length - 1; si >= 0; si--) {
        if (percent >= scenes[si].pct) { targetSceneId = scenes[si].id; break; }
      }
      if (targetSceneId === currentSceneId) return;
      var prev = document.getElementById(currentSceneId);
      var next = document.getElementById(targetSceneId);
      if (prev) prev.classList.remove('preloader__act--active');
      if (next) next.classList.add('preloader__act--active');
      currentSceneId = targetSceneId;
    }

    function setStageText(percent) {
      // Map percent to Minecraft-themed stage text
      var key;
      if (percent < 15) key = 'loader.stage.0';       // 采集木头
      else if (percent < 30) key = 'loader.stage.1';   // 合成工具
      else if (percent < 45) key = 'loader.stage.2';   // 深入挖矿
      else if (percent < 60) key = 'loader.stage.3';   // 寻找钻石
      else if (percent < 75) key = 'loader.stage.4';   // 建造传送门
      else if (percent < 90) key = 'loader.stage.5';   // 进入末地
      else key = 'loader.stage.6';                      // 击败末影龙

      if (stageEl && i18n[lang] && i18n[lang][key]) {
        stageEl.textContent = i18n[lang][key];
        stageEl.setAttribute('data-i18n', key);
      }
    }

    function updateSceneByPercent(percent) {
      setScene(percent);
    }

    function calcRealTarget() {
      // Each resource is a chunk of the total
      var p = 0;
      if (preloaderState.windowLoaded) p += 40;
      if (preloaderState.githubLoaded) p += 30;
      if (preloaderState.biliLoaded) p += 30;
      return p;
    }

    // Set initial stage
    setScene(0);
    setStageText(0);

    // Animation loop: smoothly animates toward real target
    var loopId;
    function tick() {
      targetPercent = calcRealTarget();

      // Smoothly approach target
      if (displayPercent < targetPercent) {
        displayPercent = Math.min(displayPercent + 1.5, targetPercent);
      }

      var rounded = Math.round(displayPercent);
      if (bar) bar.style.width = rounded + '%';
      if (pct) pct.textContent = rounded + '%';

      updateSceneByPercent(rounded);
      setStageText(rounded);

      if (rounded >= 100 && !preloaderState.done) {
        preloaderState.done = true;
        cancelAnimationFrame(loopId);
        setTimeout(finishPreloader, 400);
        return;
      }

      loopId = requestAnimationFrame(tick);
    }

    loopId = requestAnimationFrame(tick);

    function finishPreloader() {
      if (preEl) {
        preEl.classList.add('exit');
        setTimeout(function () {
          preEl.classList.add('hidden');
          document.documentElement.classList.remove('is-loading');
          document.documentElement.classList.add('loaded');
          initAfterLoad();
        }, 900);
      }
    }

    // Safety timeout: force finish after 12s
    setTimeout(function () {
      if (!preloaderState.done) {
        preloaderState.windowLoaded = true;
        preloaderState.githubLoaded = true;
        preloaderState.biliLoaded = true;
      }
    }, 12000);
  }

  window.addEventListener('load', markWindowLoaded);

  /* ── Navigation ──────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    var mobileMenu = document.getElementById('mobile-menu');

    // Scroll effect
    var scrollHandler = function () {
      if (nav) {
        if (window.scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Burger toggle
    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          burger.classList.remove('active');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Language toggle
    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', toggleLang);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ── Reveal Animation ────────────────────────────────── */
  function initReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            el.classList.add('visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Count Animation ─────────────────────────────────── */
  function initCounters() {
    var animated = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animated.has(entry.target)) {
          animated.add(entry.target);
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || target === 0) return;
    var duration = 1800;
    var start = performance.now();

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // cubic ease-out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ── Separator Chars ─────────────────────────────────── */
  function initSeparators() {
    var chars = '01010110 10110100 01101001 10010110 ░▒▓█▓▒░ 01110010 10101101';
    var seps = document.querySelectorAll('.separator__chars');
    seps.forEach(function (sep) {
      var str = '';
      for (var i = 0; i < 200; i++) {
        str += Math.random() > 0.5 ? '1' : '0';
        if (i % 8 === 7) str += ' ';
      }
      sep.textContent = str;
    });

    // Slow random mutation
    setInterval(function () {
      seps.forEach(function (sep) {
        var text = sep.textContent.split('');
        for (var j = 0; j < 3; j++) {
          var idx = Math.floor(Math.random() * text.length);
          if (text[idx] === '0') text[idx] = '1';
          else if (text[idx] === '1') text[idx] = '0';
        }
        sep.textContent = text.join('');
      });
    }, 400);
  }

  /* ── Particle Canvas ─────────────────────────────────── */
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var running = true;
    var PARTICLE_COUNT = 60;
    var CONNECT_DIST = 150;
    var REPEL_DIST = 120;
    var isTouchDevice = 'ontouchstart' in window;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    if (!isTouchDevice) {
      canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      canvas.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }

    // Create particles
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1
      });
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Mouse repulsion
        if (!isTouchDevice) {
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_DIST && dist > 0) {
            var force = (REPEL_DIST - dist) / REPEL_DIST * 0.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Bounds
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
        ctx.fill();

        // Connect lines
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var ddx = p.x - p2.x;
          var ddy = p.y - p2.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(74, 222, 128, ' + (1 - d / CONNECT_DIST) * 0.15 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    // Pause when not visible
    var heroObserver = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(draw);
    }, { threshold: 0.05 });
    heroObserver.observe(document.getElementById('hero'));

    draw();
  }

  /* ── GitHub Repos & Work Showcase ────────────────────── */
  var FEATURED = SITE_CONFIG.featured;
  var FEATURED_ORDER = SITE_CONFIG.featuredOrder;

  var FALLBACK_REPOS = FEATURED_ORDER.map(function (name) {
    return { name: name, stargazers_count: 0, html_url: 'https://github.com/' + SITE_CONFIG.githubUsername + '/' + name };
  });

  function fetchGitHubRepos() {
    fetch('https://api.github.com/users/' + SITE_CONFIG.githubUsername + '/repos?per_page=100')
      .then(function (r) {
        if (!r.ok) throw new Error('API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var repoMap = {};
        var totalCount = data.length;
        data.forEach(function (repo) { repoMap[repo.name] = repo; });

        var featured = FEATURED_ORDER.map(function (name) {
          return repoMap[name] || { name: name, stargazers_count: 0, html_url: 'https://github.com/' + SITE_CONFIG.githubUsername + '/' + name };
        });

        renderWorkItems(featured);

        // Update hero stat
        var reposEl = document.getElementById('stat-repos');
        if (reposEl) reposEl.setAttribute('data-count', totalCount);

        markGithubLoaded();
      })
      .catch(function () {
        renderWorkItems(FALLBACK_REPOS);
        var reposEl = document.getElementById('stat-repos');
        if (reposEl) reposEl.setAttribute('data-count', SITE_CONFIG.featuredOrder.length);
        markGithubLoaded();
      });
  }

  function renderWorkItems(repos) {
    var scene = document.getElementById('work-scene');
    if (!scene) return;
    // Remove existing items
    scene.querySelectorAll('.work-item').forEach(function (el) { el.remove(); });
    // Create cards with random Wodniack-style offsets
    repos.forEach(function (repo, idx) {
      var meta = FEATURED[repo.name] || { tags: [], descKey: '' };
      var desc = (i18n[lang] && i18n[lang][meta.descKey]) || repo.description || '';
      var stars = repo.stargazers_count || 0;
      var url = repo.html_url || 'https://github.com/' + SITE_CONFIG.githubUsername + '/' + repo.name;
      var ogImg = 'https://opengraph.githubassets.com/1/' + SITE_CONFIG.githubUsername + '/' + repo.name;

      var item = document.createElement('div');
      item.className = 'work-item';
      item.setAttribute('data-desc-key', meta.descKey);

      // Wodniack random params
      var randomY = (0.5 + Math.random() * 0.5) * (idx % 2 === 0 ? 1 : -1);
      var randomSize = 0.6 + Math.random() * 0.4;
      item.style.setProperty('--y', randomY.toFixed(2));
      item.style.setProperty('--size', randomSize.toFixed(2));
      item.style.setProperty('--progress', '1'); // Start off-screen right

      item.innerHTML =
        '<a href="' + url + '" target="_blank" rel="noopener" class="work-item__link" aria-label="' + repo.name + '"></a>' +
        '<img src="' + ogImg + '" alt="' + repo.name + '" class="work-item__img" loading="lazy">' +
        '<div class="work-item__body">' +
        '<h3 class="work-item__name">' + repo.name + '</h3>' +
        '<p class="work-item__desc">' + desc + '</p>' +
        '<div class="work-item__meta">' +
        '<div class="work-item__tags">' +
        meta.tags.map(function (t) { return '<span class="work-item__tag">' + t + '</span>'; }).join('') +
        '</div>' +
        '<div class="work-item__stars">' +
        '<svg class="icon"><use href="assets/svg/sprite.svg#icon-star"/></svg>' +
        '<span>' + stars + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';

      scene.appendChild(item);
    });

    // Cards are created but showcase is NOT activated yet.
    // User must click the enter button to activate the 3D experience.
    if (window.innerWidth < 768) {
      initWorkMobile();
    } else {
      setupWorkShowcaseButtons();
    }
  }

  /* ── Work 3D Showcase (Scroll-Driven, Wodniack Style + Gate) ──────────── */
  function initWorkShowcase() {
    var section = document.querySelector('.s-work');
    var scene = document.getElementById('work-scene');
    if (!section || !scene) return;

    var items = Array.from(scene.querySelectorAll('.work-item'));
    var letters = Array.from(scene.querySelectorAll('.work-letter'));
    var total = items.length;
    if (total === 0) return;

    var isMobile = window.innerWidth < 768;
    if (isMobile) {
      initWorkMobile();
      return;
    }

    // Gate elements
    var gate = document.getElementById('work-gate');
    var gateSvg = document.getElementById('work-gate-svg');
    var gatePath = document.getElementById('work-gate-path');
    var gateGrid = document.getElementById('work-gate-grid');
    var gateTitle = document.getElementById('work-gate-title');
    var gateTitleInner = gateTitle ? gateTitle.querySelector('.work-gate-title__inner') : null;

    // Build gate mask SVG
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var archWidth = Math.min(vw * 0.2, 340);
    var archHeight = vh * 0.65;
    var r = archWidth / 2;
    var cx = vw / 2;
    var cy = vh / 2;
    var ax = cx - archWidth / 2;
    var ay = cy - archHeight / 2;
    var bx = cx + archWidth / 2;
    var by = cy + archHeight / 2;

    if (gateSvg) {
      gateSvg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);

      // Outer rect + inner arch (evenodd creates the "donut")
      var maskD =
        'M0,0 L' + vw + ',0 L' + vw + ',' + vh + ' L0,' + vh + ' Z ' +
        'M' + ax + ',' + by +
        ' L' + ax + ',' + (ay + r) +
        ' A' + r + ',' + r + ',0,0,1,' + cx + ',' + ay +
        ' A' + r + ',' + r + ',0,0,1,' + bx + ',' + (ay + r) +
        ' L' + bx + ',' + by + ' Z';
      gatePath.setAttribute('d', maskD);

      // Grid lines inside arch area
      var gridD = '';
      var cols = 5;
      var rows = 7;
      for (var gi = 1; gi < cols; gi++) {
        var gx = ax + (archWidth / cols) * gi;
        gridD += 'M' + gx + ',' + (ay + r) + ' L' + gx + ',' + by + ' ';
      }
      for (var gj = 1; gj < rows; gj++) {
        var gy = (ay + r) + ((by - ay - r) / rows) * gj;
        gridD += 'M' + ax + ',' + gy + ' L' + bx + ',' + gy + ' ';
      }
      if (gateGrid) gateGrid.setAttribute('d', gridD);
    }

    // Max scale to fully push mask off-screen
    var maxScale = Math.max(vw, vh) / r * 1.8;

    // Set section height: gate scroll + card scroll
    var scrollHeight = total * 50 + 300; // in vh (extra for gate phase)
    section.style.height = scrollHeight + 'vh';

    // Scroll-driven animation
    var rafId;
    var running = false;
    var GATE_END = 0.15; // Gate opens in first 15% of scroll

    function getProgress() {
      var rect = section.getBoundingClientRect();
      var sectionTop = -rect.top;
      var sectionH = section.offsetHeight - window.innerHeight;
      if (sectionH <= 0) return 0;
      return Math.max(0, Math.min(1, sectionTop / sectionH));
    }

    function update() {
      if (!running) return;
      var globalProgress = getProgress();

      // ── Gate Phase: 0 → GATE_END ──
      var gateP = Math.min(1, globalProgress / GATE_END);
      // Power4.in easing (quartic)
      var gateEased = gateP * gateP * gateP * gateP;
      var gateScale = 1 + (maxScale - 1) * gateEased;

      if (gateSvg) {
        gateSvg.style.transform = 'scale(' + gateScale.toFixed(3) + ')';
      }

      // Fade gate title
      if (gateTitleInner) {
        var titleOpacity = Math.max(0, 1 - gateP * 3); // Fast fade
        var titleScale = 1 + gateP * 0.5;
        gateTitleInner.style.opacity = titleOpacity.toFixed(3);
        gateTitleInner.style.transform = 'scale(' + titleScale.toFixed(3) + ')';
      }

      // Hide gate elements when fully opened
      if (gate) {
        gate.style.visibility = gateP >= 1 ? 'hidden' : 'visible';
      }
      if (gateTitle) {
        gateTitle.style.visibility = gateP >= 0.5 ? 'hidden' : 'visible';
      }

      // Scene scale: start smaller, grow to 1 as gate opens
      var sceneScale = 0.8 + 0.2 * Math.min(1, gateP);
      scene.style.transform = 'scale(' + sceneScale.toFixed(3) + ')';

      // ── Card Phase: GATE_END → 1.0 ──
      var cardGlobalProgress = Math.max(0, (globalProgress - GATE_END) / (1 - GATE_END));
      var stagger = 1 / (total + 2);

      items.forEach(function (item, i) {
        var cardStart = i * stagger;
        var cardEnd = (i + 3) * stagger;
        var cardProgress;

        if (cardGlobalProgress <= cardStart) {
          cardProgress = 1;
        } else if (cardGlobalProgress >= cardEnd) {
          cardProgress = -1;
        } else {
          var t = (cardGlobalProgress - cardStart) / (cardEnd - cardStart);
          var eased;
          if (t < 0.2) {
            eased = t * 2.5 * 0.2;
          } else if (t > 0.8) {
            eased = 0.9 + (t - 0.8) * 2.5 * 0.2;
          } else {
            eased = 0.1 + (t - 0.2) / 0.6 * 0.8;
          }
          cardProgress = 1 - eased * 2;
        }

        item.style.setProperty('--progress', cardProgress.toFixed(4));

        var absP = Math.abs(cardProgress);
        var opacity;
        if (absP > 0.95) {
          opacity = 0;
        } else if (absP > 0.7) {
          opacity = (0.95 - absP) / 0.25;
        } else {
          opacity = 1;
        }
        item.style.setProperty('--item-opacity', opacity.toFixed(3));
      });

      // Letters parallax
      var headProgress = (cardGlobalProgress - 0.5) * 2;
      letters.forEach(function (letter) {
        letter.style.transform = 'translate(-50%, -50%) translateX(' + (headProgress * -80) + 'px)';
        letter.style.opacity = Math.max(0.02, 0.06 - Math.abs(headProgress) * 0.04);
      });

      rafId = requestAnimationFrame(update);
    }

    // Start/stop based on visibility
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        running = true;
        rafId = requestAnimationFrame(update);
      } else {
        running = false;
        cancelAnimationFrame(rafId);
      }
    }, { threshold: 0 });
    observer.observe(section);

    // Store references for cleanup
    workShowcaseState.observer = observer;
    workShowcaseState.rafId = rafId;
  }

  function initWorkMobile() {
    var section = document.querySelector('.s-work');
    if (section) section.classList.add('mobile-mode');
    // Hide gate on mobile
    var gate = document.getElementById('work-gate');
    var gateTitle = document.getElementById('work-gate-title');
    if (gate) gate.style.display = 'none';
    if (gateTitle) gateTitle.style.display = 'none';
  }

  /* ── Work Showcase — Activate / Deactivate ───────────── */
  var workShowcaseState = {
    active: false,
    observer: null,
    rafId: null
  };

  function setupWorkShowcaseButtons() {
    var enterBtn = document.getElementById('work-enter-btn');
    var exitBtn = document.getElementById('work-exit-btn');

    if (enterBtn) {
      enterBtn.addEventListener('click', function (e) {
        e.preventDefault();
        activateWorkShowcase();
      });
    }
    if (exitBtn) {
      exitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        deactivateWorkShowcase();
      });
    }
  }

  function activateWorkShowcase() {
    if (workShowcaseState.active) return;
    var section = document.querySelector('.s-work');
    if (!section) return;

    var isMobile = window.innerWidth < 768;
    if (isMobile) return; // Mobile doesn't use 3D showcase

    workShowcaseState.active = true;
    section.classList.remove('s-work--compact');

    // Let the DOM update, then initialize and scroll
    requestAnimationFrame(function () {
      initWorkShowcase();
      // Smooth scroll to section top
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function deactivateWorkShowcase() {
    if (!workShowcaseState.active) return;
    workShowcaseState.active = false;

    // Cancel running animation
    if (workShowcaseState.rafId) {
      cancelAnimationFrame(workShowcaseState.rafId);
      workShowcaseState.rafId = null;
    }
    // Disconnect observer
    if (workShowcaseState.observer) {
      workShowcaseState.observer.disconnect();
      workShowcaseState.observer = null;
    }

    var section = document.querySelector('.s-work');
    if (!section) return;

    // Reset section
    section.classList.add('s-work--compact');
    section.style.height = '';

    // Reset card positions
    var scene = document.getElementById('work-scene');
    if (scene) {
      scene.style.transform = '';
      scene.querySelectorAll('.work-item').forEach(function (item) {
        item.style.setProperty('--progress', '1');
        item.style.setProperty('--item-opacity', '0');
      });
    }

    // Reset gate elements
    var gate = document.getElementById('work-gate');
    var gateTitle = document.getElementById('work-gate-title');
    var gateSvg = document.getElementById('work-gate-svg');
    var gateTitleInner = gateTitle ? gateTitle.querySelector('.work-gate-title__inner') : null;
    if (gate) { gate.style.visibility = ''; }
    if (gateTitle) { gateTitle.style.visibility = ''; }
    if (gateSvg) { gateSvg.style.transform = ''; }
    if (gateTitleInner) { gateTitleInner.style.opacity = ''; gateTitleInner.style.transform = ''; }

    // Scroll to the next section (bilibili) so user continues downward
    var nextSection = document.getElementById('bilibili');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ── Bilibili Data ───────────────────────────────────── */
  function fetchBiliData() {
    var uid = SITE_CONFIG.bilibiliUid;
    fetch('https://api.bilibili.com/x/web-interface/card?mid=' + uid)
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.code !== 0) throw new Error('Bilibili API Error');
        var data = res.data.card;
        var archive_count = res.data.archive_count;

        // Update stats
        var followerEl = document.getElementById('bili-follower');
        var followingEl = document.getElementById('bili-following');
        var videosEl = document.getElementById('bili-videos');

        if (followerEl) followerEl.setAttribute('data-count', data.fans || SITE_CONFIG.biliFallback.follower);
        if (followingEl) followingEl.setAttribute('data-count', data.attention || SITE_CONFIG.biliFallback.following);
        if (videosEl) videosEl.setAttribute('data-count', archive_count || SITE_CONFIG.biliFallback.videoCount);

        // Hero stats
        var heroFans = document.getElementById('stat-fans');
        var heroVideos = document.getElementById('stat-videos');
        if (heroFans) heroFans.setAttribute('data-count', data.fans || SITE_CONFIG.biliFallback.follower);
        if (heroVideos) heroVideos.setAttribute('data-count', archive_count || SITE_CONFIG.biliFallback.videoCount);

        // Level
        var levelEl = document.querySelector('.bili__level');
        if (levelEl && data.level_info) levelEl.textContent = 'Lv.' + data.level_info.current_level;

        // Categories (API doesn't provide detailed categories, use fallback)
        storedCategories = SITE_CONFIG.biliCategories || storedCategories;
        renderBiliCategories(storedCategories);

        markBiliLoaded();
      })
      .catch(function () {
        // Fallback
        renderBiliCategories(storedCategories);
        var heroFans = document.getElementById('stat-fans');
        var heroVideos = document.getElementById('stat-videos');
        if (heroFans) heroFans.setAttribute('data-count', SITE_CONFIG.biliFallback.follower);
        if (heroVideos) heroVideos.setAttribute('data-count', SITE_CONFIG.biliFallback.videoCount);
        markBiliLoaded();
      });
  }

  var storedCategories = SITE_CONFIG.biliCategories;

  var categoryNames = SITE_CONFIG.biliCategoryNames;

  function renderBiliCategories(cats) {
    var container = document.getElementById('bili-categories');
    if (!container) return;

    var total = 0;
    var keys = Object.keys(cats);
    keys.forEach(function (k) { total += cats[k]; });
    if (total === 0) total = 1;

    container.innerHTML = '';
    keys.forEach(function (key) {
      var count = cats[key];
      var pct = Math.round((count / total) * 100);
      var label = (categoryNames[lang] || categoryNames.en)[key] || key;

      var item = document.createElement('div');
      item.className = 'bili__cat-item';
      item.innerHTML =
        '<div class="bili__cat-name"><span>' + label + '</span><span>' + count + ' (' + pct + '%)</span></div>' +
        '<div class="bili__cat-bar"><div class="bili__cat-bar-fill" data-width="' + pct + '"></div></div>';
      container.appendChild(item);
    });

    // Animate bars on scroll
    var catObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          container.querySelectorAll('.bili__cat-bar-fill').forEach(function (bar) {
            var w = bar.getAttribute('data-width');
            setTimeout(function () {
              bar.style.width = w + '%';
            }, 200);
          });
          catObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    catObserver.observe(container);
  }

  /* ── Post-load Initialization ────────────────────────── */
  function initAfterLoad() {
    initReveal();
    initCounters();
    initParticles();
    initSeparators();
  }

  /* ── Handle window resize for work section ───────────── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var section = document.querySelector('.s-work');
      if (!section) return;
      var isMobile = window.innerWidth < 768;
      if (isMobile && !section.classList.contains('mobile-mode')) {
        // Deactivate 3D showcase if active
        if (workShowcaseState.active) deactivateWorkShowcase();
        initWorkMobile();
      } else if (!isMobile && section.classList.contains('mobile-mode')) {
        section.classList.remove('mobile-mode');
        section.style.height = '';
        // Restore gate visibility
        var gate = document.getElementById('work-gate');
        var gateTitle = document.getElementById('work-gate-title');
        if (gate) gate.style.display = '';
        if (gateTitle) gateTitle.style.display = '';
        // Return to compact (button) mode
        section.classList.add('s-work--compact');
        workShowcaseState.active = false;
      }
    }, 250);
  });

  /* ── Boot ─────────────────────────────────────────────── */
  function boot() {
    applyLang();
    calcAge();
    initNav();
    runPreloader();
    fetchGitHubRepos();
    fetchBiliData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

