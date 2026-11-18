/* EternalBlue explainer: chapter router + eight small games. Plain JS, no libraries. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? Math.min(ms, 60) : ms));
  const fmt = (n) => n.toLocaleString('en-US');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  function tween(ms, fn) {
    return new Promise((res) => {
      if (RM) { fn(1); res(); return; }
      const t0 = performance.now();
      function f(now) {
        const t = Math.min(1, (now - t0) / ms);
        fn(ease(t));
        if (t < 1) requestAnimationFrame(f); else res();
      }
      requestAnimationFrame(f);
    });
  }
  function moveTo(el, x0, y0, x1, y1, ms) {
    return tween(ms, (t) => el.setAttribute('transform', `translate(${x0 + (x1 - x0) * t},${y0 + (y1 - y0) * t})`));
  }
  function shuffle(a, rnd = Math.random) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function seeded(seed) { // mulberry32
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function setStatus(el, html, kind) {
    el.innerHTML = html;
    el.classList.toggle('good', kind === 'good');
    el.classList.toggle('bad', kind === 'bad');
  }

  /* =====================================================================
     Chapter router
     ===================================================================== */
  const chapters = $$('.chapter');
  const progress = $('#progress');
  const hooks = {};
  let cur = -1;

  chapters.forEach((ch, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pip';
    b.title = ch.dataset.title;
    b.setAttribute('aria-label', `Go to ${ch.dataset.title}`);
    b.addEventListener('click', () => go(i));
    li.appendChild(b);
    progress.appendChild(li);

    // bottom navigation for each chapter
    const nav = document.createElement('nav');
    nav.className = 'chap-nav';
    nav.setAttribute('aria-label', 'Chapter navigation');
    if (i > 0) {
      nav.insertAdjacentHTML('beforeend', `<button class="btn ghost" type="button" data-go="prev">&larr; Back</button>`);
    }
    nav.insertAdjacentHTML('beforeend', '<span class="spacer"></span>');
    if (i < chapters.length - 1) {
      if (i > 0) nav.insertAdjacentHTML('beforeend', `<button class="btn" type="button" data-go="next">Next: ${chapters[i + 1].dataset.title} &rarr;</button>`);
    } else {
      nav.insertAdjacentHTML('beforeend', `<button class="btn ghost" type="button" data-go="first">Play again</button><a class="btn" href="index.html">All cases &rarr;</a>`);
    }
    if (i > 0) ch.appendChild(nav);
  });

  function go(i, fromHash) {
    i = Math.max(0, Math.min(chapters.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) {
      chapters[cur].hidden = true;
      const lh = hooks[chapters[cur].id];
      if (lh && lh.leave) lh.leave();
    }
    cur = i;
    const ch = chapters[i];
    ch.hidden = false;
    $$('.pip').forEach((p, j) => {
      p.classList.toggle('done', j < i);
      p.classList.toggle('on', j === i);
      if (j === i) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
    });
    $('#count').textContent = `${i + 1} / ${chapters.length}`;
    if (!fromHash && location.hash.slice(1) !== ch.id) {
      try { history.replaceState(null, '', '#' + ch.id); } catch (e) { /* ignore */ }
    }
    window.scrollTo(0, 0);
    const h = ch.querySelector('h1, h2');
    if (h && fromHash !== 'init') h.focus({ preventScroll: true });
    const eh = hooks[ch.id];
    if (eh && eh.enter) eh.enter();
    document.dispatchEvent(new CustomEvent('chapterchange', { detail: { id: ch.id, title: ch.dataset.title || ch.id } }));
  }
  function indexOfHash() {
    const id = location.hash.slice(1);
    const idx = chapters.findIndex((c) => c.id === id);
    return idx < 0 ? 0 : idx;
  }
  window.addEventListener('hashchange', () => go(indexOfHash(), true));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    const d = b.dataset.go;
    if (d === 'next') go(cur + 1);
    else if (d === 'prev') go(cur - 1);
    else if (d === 'first') go(0);
  });
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    else if (e.key === 'ArrowLeft') go(cur - 1);
  });

  /* =====================================================================
     Game 1: the mailroom
     ===================================================================== */
  (function mailroom() {
    const env = $('#mr-env');
    const envLabel = $('#mr-env-label');
    const bubble = $('#mr-bubble');
    const b1 = $('#mr-b1');
    const b2 = $('#mr-b2');
    const log = $('#mr-log');
    const btns = $$('[data-req]');
    const REQ = {
      file: { label: 'FILE?', reply: 'FILE', bubble: ['budget.xlsx?', 'Here you go!'], log: 'You asked for a file. The clerk found it and sent it back.' },
      print: { label: 'PRINT', reply: 'DONE', bubble: ['A print job.', 'Off to the printer!'], log: 'You sent a print job. The clerk passed it to the printer.' },
      stranger: { label: '???', reply: 'OK', bubble: ['No ID? This form', "doesn't need one."], log: 'A stranger sent a package. The clerk opened it anyway, with no password asked.' }
    };
    let busy = false;
    let first = true;

    async function send(kind) {
      if (busy) return;
      busy = true;
      btns.forEach((b) => { b.disabled = true; });
      const r = REQ[kind];
      env.setAttribute('class', kind === 'stranger' ? 'stranger' : '');
      envLabel.textContent = r.label;
      env.style.opacity = 1;
      await moveTo(env, 90, 128, 390, 156, 950);
      await moveTo(env, 390, 156, 500, 196, 450);
      b1.textContent = r.bubble[0];
      b2.textContent = r.bubble[1];
      bubble.style.opacity = 1;
      await wait(1300);
      env.setAttribute('class', 'reply');
      envLabel.textContent = r.reply;
      bubble.style.opacity = 0;
      await moveTo(env, 500, 196, 390, 156, 450);
      await moveTo(env, 390, 156, 90, 128, 900);
      env.style.opacity = 0;
      if (first) { log.innerHTML = ''; first = false; }
      const li = document.createElement('li');
      li.textContent = r.log;
      log.prepend(li);
      while (log.children.length > 4) log.lastElementChild.remove();
      if (kind === 'stranger') {
        const f = $('#fact-stranger');
        $('.locked', f).hidden = true;
        $('.unlocked', f).hidden = false;
        f.classList.remove('lit');
        void f.offsetWidth;
        f.classList.add('lit');
      }
      btns.forEach((b) => { b.disabled = false; });
      busy = false;
    }
    btns.forEach((b) => b.addEventListener('click', () => send(b.dataset.req)));
  })();

  /* =====================================================================
     Game 2: the four-digit stamp
     ===================================================================== */
  (function stamp() {
    const A = $('#st-a');
    const B = $('#st-b');
    const aOut = $('#st-a-out');
    const bOut = $('#st-b-out');
    const digits = $$('#st-digits .digit');
    const stampEl = $('#st-stamp');
    const steps = $('#st-steps');
    const go = $('#st-go');
    const copied = $('#st-copied');
    const tray = $('#st-tray');
    const status = $('#st-status');
    const goalSafe = $('#goal-safe');
    const goalSpill = $('#goal-spill');
    const pad5 = (n) => String(n).padStart(5, '0');
    let busy = false;

    function stepsTemplate(a, b, s) {
      const real = b;
      return [
        `Read the label: <b>${fmt(a)}</b> entries.`,
        `Check the list: the junk starts at entry <b>${fmt(real)}</b>, so that's the real length.`,
        `Stamp the corrected length. The stamp only covers the last four digits, so the label now reads <b>${s}</b>.`,
        `Set out a tray with room for the <b>${fmt(real)}</b> real entries.`,
        `Copy entries into the tray, as many as the label says: <b>${fmt(parseInt(s, 10))}</b>.`
      ];
    }
    function showSteps(list, upto, badFrom) {
      steps.innerHTML = list.map((t, i) => `<li class="${i > upto ? 'dim' : ''} ${badFrom != null && i >= badFrom && i <= upto ? 'bad' : ''}">${t}</li>`).join('');
    }

    function render() {
      const a = +A.value;
      B.max = a;
      if (+B.value > a) B.value = a;
      const b = +B.value;
      aOut.textContent = fmt(a);
      bOut.textContent = fmt(b);
      const d = pad5(a);
      digits.forEach((el, i) => {
        el.textContent = d[i];
        el.classList.remove('inked', 'untouched');
      });
      const p = pad5(b);
      showSteps(stepsTemplate(a, b, d[0] + p.slice(1)), -1);
      copied.classList.remove('anim');
      copied.style.width = '0';
      tray.style.width = '0';
      $('#st-tray-n').textContent = '–';
      $('#st-copy-n').textContent = '–';
      $('#st-spill-n').textContent = '–';
    }

    async function doStamp() {
      if (busy) return;
      busy = true;
      go.disabled = true;
      render();
      const a = +A.value;
      const b = +B.value;
      const da = pad5(a);
      const db = pad5(b);
      const s = da[0] + db.slice(1);
      const sn = parseInt(s, 10);
      const list = stepsTemplate(a, b, s);
      const spill = sn - b;
      showSteps(list, 0); await wait(500);
      showSteps(list, 1); await wait(600);
      stampEl.classList.remove('thunk');
      void stampEl.offsetWidth;
      stampEl.classList.add('thunk');
      await wait(330);
      digits.forEach((el, i) => {
        if (i === 0) { el.classList.add('untouched'); return; }
        el.textContent = s[i];
        el.classList.add('inked');
      });
      await wait(420);
      showSteps(list, 2, spill > 0 ? 2 : null); await wait(650);
      showSteps(list, 3, spill > 0 ? 2 : null);
      const scale = Math.max(sn, b) * 1.04;
      tray.style.width = (b / scale * 100) + '%';
      $('#st-tray-n').textContent = fmt(b);
      await wait(550);
      showSteps(list, 4, spill > 0 ? 2 : null);
      const cut = (b / sn) * 100;
      copied.style.background = spill > 0
        ? `linear-gradient(90deg, var(--blue) 0 ${cut}%, var(--stamp) ${cut}% 100%)`
        : 'var(--blue)';
      copied.classList.add('anim');
      void copied.offsetWidth;
      copied.style.width = (sn / scale * 100) + '%';
      $('#st-copy-n').textContent = fmt(sn);
      await wait(1300);
      $('#st-spill-n').textContent = fmt(spill);
      let msg;
      if (spill > 0) {
        msg = `Overflow! The tray holds ${fmt(b)} entries, but the clerk copies ${fmt(sn)}. ${fmt(spill)} entries spill onto the next desk.`;
        goalSpill.classList.add('done');
      } else if (a < 10000) {
        msg = `Safe. The label was under 10,000, so its first digit was 0, and a missing digit didn't matter.`;
        goalSafe.classList.add('done');
      } else {
        msg = `Safe, by luck. The first digit was already right (${da[0]}), so the stamp's blind spot didn't matter.`;
        goalSafe.classList.add('done');
      }
      if (goalSafe.classList.contains('done') && goalSpill.classList.contains('done')) {
        msg += ' You found the bug: it only bites when the label needs that fifth digit. Next: where does the spill land?';
      }
      setStatus(status, msg, spill > 0 ? 'bad' : 'good');
      go.disabled = false;
      busy = false;
    }

    A.addEventListener('input', () => { if (!busy) render(); });
    B.addEventListener('input', () => { if (!busy) render(); });
    go.addEventListener('click', doStamp);
    render();
  })();

  /* =====================================================================
     Game 3: aim the spill (heap grooming)
     ===================================================================== */
  (function spill() {
    const INITIAL = ['busy', 'empty', 'busy', 'empty', 'empty', 'busy', 'empty', 'empty'];
    const ICONS = {
      busy: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="5" y="7" width="24" height="5" rx="1.5" fill="currentColor"/><rect x="5" y="15" width="24" height="5" rx="1.5" fill="currentColor"/><rect x="5" y="23" width="24" height="5" rx="1.5" fill="currentColor"/></svg>',
      empty: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="6" y="6" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/></svg>',
      yours: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="5" y="6" width="24" height="22" rx="2" fill="currentColor"/><path d="M10 13h14M10 18h9" style="stroke:var(--blue)" stroke-width="2.4" stroke-linecap="round"/><path d="M20 21l4 2-4 2" fill="none" style="stroke:var(--blue)" stroke-width="2"/></svg>',
      tray: '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M4 16h26l-3 11H7z" style="fill:var(--manila-2)" stroke="currentColor" stroke-width="2"/><path d="M9 16V9h16v7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M27 20c3 1 4 4 6 4" style="stroke:var(--stamp)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      hijacked: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="5" y="6" width="24" height="22" rx="2" fill="currentColor"/><path d="M17 10v9" style="stroke:var(--stamp)" stroke-width="3.4" stroke-linecap="round"/><circle cx="17" cy="24" r="2" style="fill:var(--stamp)"/></svg>',
      smashed: '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 8l18 18M26 8L8 26" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>'
    };
    const LABEL = { busy: 'Windows', empty: 'Empty', yours: 'Yours', tray: 'Tray', hijacked: 'Hijacked!', smashed: 'Smashed' };
    const ARIA = { busy: 'used by Windows', empty: 'empty', yours: 'your connection with an instruction card', tray: 'the tray', hijacked: 'your card, overwritten by the spill', smashed: 'smashed by the spill' };
    const wrap = $('#sp-desks');
    const status = $('#sp-status');
    const bsod = $('#sp-bsod');
    const after = $('#sp-after');
    const ctrl = ['#sp-open', '#sp-send', '#sp-reset', '#sp-demo'].map((s) => $(s));
    let state = INITIAL.slice();
    let fails = 0;
    let tries = 0;
    let locked = false;
    let solved = false;

    const desks = state.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'desk';
      b.dataset.i = i;
      b.addEventListener('click', () => clickDesk(i));
      wrap.appendChild(b);
      return b;
    });
    function draw() {
      state.forEach((s, i) => {
        const d = desks[i];
        d.className = 'desk ' + s;
        d.innerHTML = `${ICONS[s]}<span class="desk-l">${LABEL[s]}</span><span class="desk-n">${i + 1}</span>`;
        d.setAttribute('aria-label', `Desk ${i + 1}: ${ARIA[s]}`);
      });
    }
    const firstEmpty = () => state.indexOf('empty');
    function lock(on) { locked = on; ctrl.forEach((b) => { b.disabled = on; }); desks.forEach((d) => { d.disabled = on; }); }

    function openConn(quiet) {
      const i = firstEmpty();
      if (i < 0) { setStatus(status, 'Every desk is taken. Close one of your connections to make a gap.', 'bad'); return; }
      state[i] = 'yours';
      draw();
      if (!quiet) setStatus(status, `Connection opened. It took desk ${i + 1}, the first empty one.`);
    }
    function clickDesk(i) {
      if (locked) return;
      const s = state[i];
      if (s === 'yours') {
        state[i] = 'empty';
        draw();
        setStatus(status, `Connection closed. Desk ${i + 1} is free again.`);
      } else if (s === 'busy') {
        setStatus(status, `Desk ${i + 1} belongs to Windows. You can't move it.`);
      } else if (s === 'empty') {
        setStatus(status, `Desk ${i + 1} is empty. Open a connection to fill the first empty desk.`);
      }
    }
    async function send() {
      const i = firstEmpty();
      if (i < 0) { setStatus(status, 'There is nowhere to put the tray. Close one of your connections first.', 'bad'); return; }
      lock(true);
      tries++;
      state[i] = 'tray';
      draw();
      setStatus(status, `The tray lands on desk ${i + 1}. The clerk starts copying…`);
      await wait(700);
      const t = i + 1;
      desks[i].classList.add('flash');
      if (t < state.length) desks[t].classList.add('flash');
      await wait(850);
      const target = t < state.length ? state[t] : 'none';
      if (target === 'yours') {
        state[t] = 'hijacked';
        draw();
        solved = true;
        setStatus(status, `Direct hit! The spill rewrote the instruction card on desk ${t + 1}. It now says: <b>run the attacker's note</b>.${tries > 1 ? ` (Solved in ${tries} tries.)` : ''}`, 'good');
        after.hidden = false;
        ctrl[2].disabled = false;
        locked = false;
        desks.forEach((d) => { d.disabled = true; });
        ctrl[3].disabled = true; ctrl[0].disabled = true; ctrl[1].disabled = true;
        await wait(400);
        after.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
        return;
      }
      fails++;
      if (target === 'busy') {
        state[t] = 'smashed';
        draw();
        setStatus(status, `The spill hit desk ${t + 1}, which Windows was using…`, 'bad');
        await wait(700);
        bsod.hidden = false;
        $('#sp-restart').disabled = false;
        $('#sp-restart').focus();
        return;
      }
      const where = target === 'none' ? 'off the end of memory, onto nothing useful' : `onto empty desk ${t + 1}`;
      let msg = `The spill landed ${where}. Nothing happened, and the attacker got nothing.`;
      if (fails >= 2) msg += ' Hint: fill every gap first, then close one of your connections that has another of yours right after it.';
      setStatus(status, msg, 'bad');
      await wait(1600);
      state[i] = 'empty';
      draw();
      lock(false);
    }
    function reset(msg) {
      state = INITIAL.slice();
      solved = false;
      bsod.hidden = true;
      draw();
      lock(false);
      setStatus(status, msg || 'Desks reset. Windows is using desks 1, 3 and 6.');
    }
    async function demo() {
      reset('Watch: first, fill every gap with your own connections…');
      lock(true);
      for (let k = 0; k < 5; k++) { await wait(450); openConn(true); }
      await wait(600);
      setStatus(status, 'Now close the connection on desk 4. Desk 5, right after it, is also yours.');
      await wait(900);
      state[3] = 'empty';
      draw();
      await wait(900);
      setStatus(status, 'Finally, send the poisoned list. The tray has only one place to go: desk 4.');
      await wait(1000);
      lock(false);
      await send();
    }

    ctrl[0].addEventListener('click', () => openConn(false));
    ctrl[1].addEventListener('click', send);
    ctrl[2].addEventListener('click', () => { reset(); });
    ctrl[3].addEventListener('click', demo);
    $('#sp-restart').addEventListener('click', () => reset('The computer restarted. Try arranging the desks first.'));
    draw();

    const reply = $('#knock-reply');
    $$('[data-knock]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.knock === 'normal') {
        reply.textContent = 'Door 445: "Hello! This is a normal file-sharing reply." (Nothing looks wrong.)';
        reply.classList.remove('evil');
      } else {
        reply.textContent = 'DoublePulsar: "I\'m here. Send me any program and I\'ll run it with the master keys."';
        reply.classList.add('evil');
      }
    }));
    hooks.spill = { enter() { if (!solved && bsod.hidden) draw(); } };
  })();

  /* =====================================================================
     Game 4: mind the gap
     ===================================================================== */
  (function gap() {
    const SPAN = 136; // days shown: 1 March to 15 July 2017
    const PATCH = 13; // 14 March
    const REAL = 59; // 12 May
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const slider = $('#gap-guess');
    const out = $('#gap-out');
    const pin = $('#gap-pin');
    const chip = $('#gap-chip');
    const real = $('#gap-real');
    const result = $('#gap-result');
    const label = (d) => { const dt = new Date(2017, 2, 1 + d); return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`; };
    function render() {
      const g = +slider.value;
      const day = PATCH + g;
      out.textContent = `${g} day${g === 1 ? '' : 's'} (${label(day)})`;
      pin.style.left = (day / SPAN * 100) + '%';
      const pct = day / SPAN;
      chip.style.transform = pct > 0.86 ? 'translateX(-100%)' : pct < 0.12 ? 'translateX(-10%)' : 'translateX(-50%)';
    }
    slider.addEventListener('input', render);
    $('#gap-lock').addEventListener('click', () => {
      const g = +slider.value;
      real.hidden = false;
      real.classList.remove('show');
      void real.offsetWidth;
      real.classList.add('show');
      const diff = g - REAL;
      let lead;
      if (diff === 0) lead = 'Spot on: 59 days.';
      else if (Math.abs(diff) <= 7) lead = `Close! You said ${g}; the real answer is 59 days.`;
      else if (diff < 0) lead = `It was longer than that: 59 days, not ${g}.`;
      else lead = `It was sooner than that: 59 days, not ${g}.`;
      setStatus(result, `${lead} The fix came out on 14 March and WannaCry struck on 12 May. Two months was plenty of time, yet hundreds of thousands of computers still hadn't installed it, and some ran Windows XP, which hadn't had updates since 2014.`, diff === 0 || Math.abs(diff) <= 7 ? 'good' : null);
    });
    render();
  })();

  /* =====================================================================
     Outbreak town simulation (used by games 5 and 6)
     ===================================================================== */
  const ORGS = ['Hospital', 'Train station', 'Car factory', 'Phone company', 'School', 'Small office'];
  const TRIES = 5;
  const LOCAL = 0.7;
  const TICK = 190;
  const DELAY = 320;

  function Town(svg, ui) {
    let nodes = [];
    let byOrg = [];
    let buildings = [];
    let gen = 0;
    let timer = null;
    let pending = 0;
    let running = false;
    let cfg = {};
    let narrow = null;
    let layerL;

    function drawPC(parent, cx, cy, w, h) {
      const g = svgEl('g', { class: 'pc', transform: `translate(${cx},${cy})` }, parent);
      svgEl('rect', { class: 'scr', x: -w / 2, y: -h / 2, width: w, height: h, rx: 3 }, g);
      svgEl('rect', { class: 'stand', x: -3, y: h / 2, width: 6, height: 4 }, g);
      svgEl('rect', { class: 'stand', x: -8, y: h / 2 + 4, width: 16, height: 3, rx: 1 }, g);
      svgEl('path', { class: 'ico i-check', d: 'M-6 0 L-2 4 L6 -4' }, g);
      const lock = svgEl('g', { class: 'ico i-lock' }, g);
      svgEl('rect', { class: 'i-lock-b', x: -5, y: -2, width: 10, height: 8, rx: 1.5 }, lock);
      svgEl('path', { class: 'i-lock-s', d: 'M-3 -2 V-4.5 A3 3 0 0 1 3 -4.5 V-2' }, lock);
      const z = svgEl('text', { class: 'ico i-z', x: 0, y: 4, 'text-anchor': 'middle' }, g);
      z.textContent = 'zz';
      return g;
    }

    function layout(force) {
      const n = window.innerWidth < 620;
      if (n === narrow && !force) return false;
      narrow = n;
      const W = n ? 420 : 800;
      const cols = n ? 2 : 3;
      const rows = n ? 3 : 2;
      const bw = n ? 195 : 244;
      const bh = 170;
      const gx = n ? 10 : (800 - 3 * 244) / 4;
      const gy = n ? 12 : 20;
      const H = rows * bh + (rows + 1) * gy;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.classList.toggle('narrow', n);
      svg.textContent = '';
      const layerB = svgEl('g', {}, svg);
      layerL = svgEl('g', {}, svg);
      const layerN = svgEl('g', {}, svg);
      nodes = []; byOrg = []; buildings = [];
      ORGS.forEach((name, o) => {
        const c = o % cols;
        const r = Math.floor(o / cols);
        const x = gx + c * (bw + gx);
        const y = gy + r * (bh + gy);
        svgEl('rect', { class: 'b-zone', x, y, width: bw, height: bh, rx: 10 }, layerB);
        const t = svgEl('text', { class: 'b-name', x: x + 12, y: y + 27 }, layerB);
        t.textContent = name;
        const door = { x: x + bw / 2, y: y + bh };
        svgEl('rect', { class: 'b-door', x: door.x - 17, y: door.y - 5, width: 34, height: 10, rx: 2 }, layerB);
        buildings.push({ x, y, bw, bh, door });
        byOrg[o] = [];
        const pad = n ? 10 : 12;
        const cw = (bw - pad * 2) / 5;
        const mw = n ? 26 : 32;
        const mh = n ? 19 : 22;
        for (let i = 0; i < 10; i++) {
          const cx = x + pad + cw * (i % 5 + 0.5);
          const cy = y + (i < 5 ? 70 : 126);
          const node = { org: o, x: cx, y: cy, patched: false, status: 'clean', tries: 0 };
          node.g = drawPC(layerN, cx, cy, mw, mh);
          nodes.push(node);
          byOrg[o].push(node);
        }
      });
      return true;
    }

    function paint(nd) {
      let cls = 'pc';
      if (nd.status === 'infected') cls += ' infected';
      else if (nd.status === 'incoming') cls += ' incoming';
      else if (nd.status === 'asleep') cls += ' asleep';
      else if (nd.patched) cls += ' patched';
      nd.g.setAttribute('class', cls);
    }
    function stats() {
      const s = { enc: 0, patched: 0, asleep: 0, untouched: 0, orgsHit: 0 };
      const hit = new Set();
      nodes.forEach((nd) => {
        if (nd.status === 'infected') { s.enc++; hit.add(nd.org); }
        else if (nd.status === 'asleep') s.asleep++;
        else if (nd.patched) s.patched++;
        else s.untouched++;
      });
      s.orgsHit = hit.size;
      s.ransom = s.enc * 300;
      if (ui.onStats) ui.onStats(s);
      return s;
    }
    function line(a, b, cls) {
      const l = svgEl('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'atk ' + (cls || '') }, layerL);
      setTimeout(() => l.remove(), 800);
    }
    function ring(nd, kind) {
      const c = svgEl('circle', { cx: nd.x, cy: nd.y, r: kind === 'zero' ? 30 : 20, class: 'ring ' + kind }, layerL);
      setTimeout(() => c.remove(), kind === 'zero' ? 1300 : 700);
    }

    function reset(c) {
      gen++;
      clearInterval(timer);
      timer = null;
      running = false;
      pending = 0;
      cfg = Object.assign({ patch: 20, firewall: false, killswitch: false, seeds: 0, seed: null }, c);
      if (layerL) layerL.textContent = '';
      svg.classList.toggle('fw', !!cfg.firewall);
      const rnd = cfg.seed != null ? seeded(cfg.seed) : Math.random;
      nodes.forEach((nd) => { nd.patched = false; nd.status = 'clean'; nd.tries = 0; });
      const k = Math.round(nodes.length * cfg.patch / 100);
      shuffle(nodes.slice(), rnd).slice(0, k).forEach((nd) => { nd.patched = true; });
      if (cfg.seeds) {
        // pre-infected machines, spread across two buildings
        const pool = shuffle(nodes.filter((nd) => !nd.patched && (nd.org === 0 || nd.org === 3)), rnd);
        pool.slice(0, cfg.seeds).forEach((nd) => { nd.status = 'infected'; nd.tries = TRIES; });
      }
      nodes.forEach(paint);
      return stats();
    }

    function finish() {
      clearInterval(timer);
      timer = null;
      running = false;
      const s = stats();
      if (ui.onEnd) ui.onEnd(s, cfg);
    }

    function start() {
      if (running) return;
      if (!cfg.seeds) {
        const cand = nodes.filter((nd) => !nd.patched && nd.status === 'clean');
        if (!cand.length) { finish(); return; }
        const z = pick(cand);
        z.status = 'infected';
        z.tries = TRIES;
        paint(z);
        ring(z, 'zero');
      }
      running = true;
      const my = gen;
      stats();
      timer = setInterval(() => { if (my === gen) tick(my); }, RM ? 80 : TICK);
    }

    function tick(my) {
      const active = nodes.filter((nd) => nd.status === 'infected' && nd.tries > 0);
      if (!active.length) {
        if (!pending) finish();
        return;
      }
      for (const nd of active) {
        nd.tries--;
        let t;
        if (Math.random() < LOCAL) {
          t = pick(byOrg[nd.org].filter((m) => m !== nd));
        } else if (cfg.firewall) {
          const door = buildings[nd.org].door;
          line(nd, door, 'fwb');
          ring(door, 'no');
          continue;
        } else {
          t = pick(nodes.filter((m) => m.org !== nd.org));
        }
        line(nd, t);
        if (t.patched) { ring(t, 'ok'); continue; }
        if (t.status !== 'clean') continue;
        t.status = 'incoming';
        paint(t);
        pending++;
        setTimeout(() => {
          if (my !== gen) return;
          pending--;
          if (cfg.killswitch) { t.status = 'asleep'; t.tries = 0; }
          else { t.status = 'infected'; t.tries = TRIES; }
          paint(t);
          stats();
        }, RM ? 40 : DELAY);
      }
      stats();
    }

    return {
      layout, reset, start,
      get running() { return running; }
    };
  }

  function renderStats(box, s) {
    $$('[data-s]', box).forEach((el) => {
      const k = el.dataset.s;
      el.textContent = k === 'ransom' ? '$' + fmt(s.ransom) : fmt(s[k]);
    });
  }

  /* ---------- Game 5: outbreak ---------- */
  (function outbreak() {
    const svg = $('#ob-svg');
    const slider = $('#ob-patch');
    const out = $('#ob-patch-out');
    const fw = $('#ob-fw');
    const run = $('#ob-run');
    const status = $('#ob-status');
    const box = $('#ob-stats');
    const challenge = $('#ob-challenge');
    let runs = 0;
    const town = Town(svg, {
      onStats: (s) => renderStats(box, s),
      onEnd: (s, cfg) => {
        run.disabled = false;
        run.textContent = 'Release again';
        runs++;
        const total = 60;
        let msg;
        if (cfg.patch >= 100) {
          msg = 'Every computer had the fix, so WannaCry couldn\'t get in anywhere. Nothing was encrypted.';
        } else {
          msg = `WannaCry encrypted <b>${s.enc} of ${total}</b> computers. Ransom demanded: <b>$${fmt(s.ransom)}</b>. `;
          if (cfg.firewall && s.orgsHit <= 1 && s.enc > 2) {
            msg += 'The front doors held, so the worm stayed inside the first building. But inside, nothing stopped it. Many hospitals saw exactly this: one infected machine spread across the whole internal network.';
          } else if (s.enc <= 5) {
            msg += 'The worm burned out quickly, because most doors it knocked on were already fixed. Like vaccines, updates also protect the computers that missed them, by breaking the chain.';
          } else if (s.enc >= 30) {
            msg += 'A chain reaction: every unpatched computer that got infected went on to infect others. Try more updates, or the firewall.';
          } else {
            msg += 'Some chains fizzled when they hit updated computers, but others got through.';
          }
        }
        setStatus(status, msg, s.enc <= 5 ? 'good' : 'bad');
        if (s.enc <= 5 && cfg.patch <= 65) {
          challenge.classList.add('done');
          challenge.querySelector('span:last-child').innerHTML = `<b>Challenge complete!</b> Only ${s.enc} encrypted with ${cfg.patch}% patched. Layers of defence beat any single one.`;
        }
      }
    });
    const cfg = () => ({ patch: +slider.value, firewall: fw.checked });
    function preview() {
      out.textContent = slider.value + '%';
      if (town.running) return;
      town.reset(cfg());
      run.textContent = 'Release WannaCry';
      setStatus(status, runs ? 'Settings changed. Release WannaCry to test them.' : 'Press <b>Release WannaCry</b> to start.');
    }
    slider.addEventListener('input', preview);
    fw.addEventListener('change', preview);
    run.addEventListener('click', () => {
      town.reset(cfg());
      run.disabled = true;
      setStatus(status, 'WannaCry is loose. Watch the red lines: each one is EternalBlue knocking on a door.');
      town.start();
    });
    $('#ob-reset').addEventListener('click', () => { run.disabled = false; town.reset(cfg()); run.textContent = 'Release WannaCry'; setStatus(status, 'Reset. Press <b>Release WannaCry</b> to start.'); });
    let inView = false;
    hooks.outbreak = {
      enter() { inView = true; town.layout(); if (!town.running) { run.disabled = false; town.reset(cfg()); } },
      leave() { inView = false; town.reset(cfg()); run.disabled = false; run.textContent = 'Release WannaCry'; }
    };
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (inView && !town.running && town.layout()) town.reset(cfg()); }, 200);
    });
    town.layout(true);
    town.reset(cfg());
  })();

  /* ---------- Game 6: kill switch ---------- */
  (function killswitch() {
    const svg = $('#ks-svg');
    const status = $('#ks-status');
    const box = $('#ks-stats');
    const run = $('#ks-run');
    const domain = $('#ks-domain');
    const reg = $('#ks-reg');
    const state = $('#ks-state');
    const stateT = $('#ks-state-t');
    const hint = $('#ks-domain-hint');
    let registered = false;
    let ranWithout = false;
    const SCEN = () => ({ patch: 20, seeds: 5, seed: 7, killswitch: registered });
    const town = Town(svg, {
      onStats: (s) => renderStats(box, s),
      onEnd: (s) => {
        run.disabled = false;
        if (!registered) {
          ranWithout = true;
          setStatus(status, `Nobody answered at the address, so every new copy kept going: <b>${s.enc}</b> computers encrypted. Now look at WannaCry's steps above and find the off switch.`, 'bad');
          run.textContent = 'Run WannaCry again';
        } else {
          setStatus(status, `The address answered. Every new copy checked it and quit, so the outbreak stopped at <b>${s.enc}</b> encrypted computers, and <b>${s.asleep}</b> were saved by the switch. The five already encrypted stayed locked.`, 'good');
        }
      }
    });
    domain.addEventListener('click', () => {
      if (registered) return;
      reg.hidden = false;
      hint.textContent = 'Nobody owns it. Anyone could register it.';
      $('#ks-buy').focus();
    });
    $('#ks-buy').addEventListener('click', () => {
      registered = true;
      reg.hidden = true;
      domain.classList.add('reg');
      state.classList.add('on');
      stateT.textContent = 'Address: answers';
      hint.textContent = 'Registered for $10.69. The address now answers every visitor, including WannaCry.';
      run.textContent = 'Run WannaCry again';
      if (!town.running) town.reset(SCEN());
      setStatus(status, ranWithout ? 'You own the address now. Run WannaCry again, with the same five infected computers.' : 'You own the address now. Run WannaCry and see what changes.');
    });
    run.addEventListener('click', () => {
      town.reset(SCEN());
      run.disabled = true;
      setStatus(status, registered ? 'Running, with the address answering…' : 'Running. WannaCry checks the address, and nobody answers…');
      town.start();
    });
    $('#ks-reset').addEventListener('click', () => {
      run.disabled = false;
      town.reset(SCEN());
      setStatus(status, 'Five computers are already infected. Press <b>Run WannaCry</b>.');
    });
    let inView = false;
    hooks.killswitch = {
      enter() { inView = true; town.layout(); if (!town.running) { run.disabled = false; town.reset(SCEN()); } },
      leave() { inView = false; town.reset(SCEN()); run.disabled = false; }
    };
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (inView && !town.running && town.layout()) town.reset(SCEN()); }, 200);
    });
    town.layout(true);
    town.reset(SCEN());
  })();

  /* =====================================================================
     Game 7: NotPetya, find the survivor
     ===================================================================== */
  (function notpetya() {
    const CITIES = ['Copenhagen', 'Maidenhead, UK', 'Rotterdam', 'New Jersey', 'Los Angeles', 'Santos', 'Ghana', 'Lagos', 'Dubai', 'Mumbai', 'Singapore', 'Shanghai'];
    const GHANA = 6;
    const LAGOS = 7;
    const UK = 1;
    const grid = $('#np-grid');
    const status = $('#np-status');
    const runBtn = $('#np-run');
    const day = $('#np-day');
    let phase = 'idle'; // idle | wiping | search | flying | done
    const tiles = CITIES.map((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile';
      b.innerHTML = `<span class="city">${c}</span><span class="st">Online</span>`;
      b.addEventListener('click', () => clickTile(i));
      grid.appendChild(b);
      return b;
    });
    const plane = document.createElement('div');
    plane.className = 'plane';
    plane.hidden = true;
    plane.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="fill:var(--paper-ink)" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
    grid.appendChild(plane);
    const setTile = (i, cls, st) => { tiles[i].className = 'tile ' + cls; tiles[i].querySelector('.st').textContent = st; };
    function center(i) {
      const t = tiles[i];
      return { x: t.offsetLeft + t.offsetWidth / 2 - 19, y: t.offsetTop + t.offsetHeight / 2 - 19 };
    }
    async function fly(from, to) {
      const a = center(from);
      const b = center(to);
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      plane.style.transition = 'none';
      plane.style.transform = `translate(${a.x}px,${a.y}px) rotate(${ang}deg)`;
      void plane.offsetWidth;
      plane.style.transition = '';
      plane.style.transform = `translate(${b.x}px,${b.y}px) rotate(${ang}deg)`;
      await wait(1150);
    }
    async function runAttack() {
      if (phase !== 'idle' && phase !== 'done') return;
      phase = 'wiping';
      runBtn.disabled = true;
      day.hidden = true;
      tiles.forEach((_, i) => setTile(i, '', 'Online'));
      setTile(GHANA, 'offline', 'Power cut');
      setStatus(status, 'Ghana has a power cut today, so its office is offline. Elsewhere, NotPetya is spreading…');
      await wait(1200);
      const order = shuffle(tiles.map((_, i) => i).filter((i) => i !== GHANA));
      for (const i of order) {
        setTile(i, 'wiped', 'Erased');
        await wait(160);
      }
      phase = 'search';
      setStatus(status, 'In minutes, almost every computer is erased, including every copy of the master login list (the "domain controller") that says who may log in. Without one, nothing can be rebuilt. <b>Click the offices to search for a surviving copy.</b>', 'bad');
    }
    async function clickTile(i) {
      if (phase === 'idle') { setStatus(status, 'Everything is running normally. For now. Press <b>Run NotPetya</b>.'); return; }
      if (phase !== 'search') return;
      if (i !== GHANA) {
        tiles[i].classList.remove('shake');
        void tiles[i].offsetWidth;
        tiles[i].classList.add('shake');
        setStatus(status, `${CITIES[i]}: erased. No copy here. Keep looking.`, 'bad');
        return;
      }
      phase = 'flying';
      setTile(GHANA, 'found', 'Copy survived!');
      setStatus(status, 'Found it! The power cut knocked the Ghana office offline <b>before</b> NotPetya arrived, so its copy was never touched. Staff flew the drive to Lagos, where a colleague carried it on to the UK.', 'good');
      await wait(900);
      plane.hidden = false;
      await fly(GHANA, LAGOS);
      await fly(LAGOS, UK);
      plane.hidden = true;
      setTile(UK, 'rebuilt', 'Rebuilding');
      day.hidden = false;
      const order = [UK, 0, 2, 3, 4, 5, LAGOS, 8, 9, 10, 11, GHANA];
      for (let d = 1; d <= 10; d++) {
        day.textContent = `Day ${d}`;
        const upto = Math.round(order.length * d / 10);
        order.slice(0, upto).forEach((k) => setTile(k, 'rebuilt', 'Rebuilt'));
        await wait(330);
      }
      phase = 'done';
      runBtn.disabled = false;
      runBtn.textContent = 'Run it again';
      setStatus(status, 'Back up in about ten days: 4,000 new servers and 45,000 PCs. Maersk put the cost at up to $300 million. A power cut saved the company. The lesson: keep a backup that\'s offline on purpose, not by luck.', 'good');
    }
    runBtn.addEventListener('click', runAttack);
  })();

  /* =====================================================================
     Game 8: break the chain
     ===================================================================== */
  (function chain() {
    const links = $$('#chain .link');
    const boxes = $$('#defences input');
    const verdict = $('#chain-verdict');
    const NAMES = { 'd-firewall': 'Firewall', 'd-smb1': 'SMBv1 off', 'd-update': 'Update', 'd-zones': 'Zones', 'd-admin': 'Admin limits', 'd-backup': 'Backups' };
    function render() {
      const on = Object.fromEntries(boxes.map((b) => [b.id, b.checked]));
      links.forEach((l, i) => {
        const by = boxes.filter((b) => b.checked && +b.dataset.breaks === i).map((b) => NAMES[b.id]);
        l.classList.toggle('broken', by.length > 0);
        l.querySelector('.by').textContent = by.length ? 'Broken: ' + by.join(' + ') : '';
      });
      let cls;
      let head;
      let body;
      const inner = on['d-zones'] || on['d-admin'];
      if (on['d-update'] || on['d-smb1']) {
        cls = 'safe';
        head = 'EternalBlue can\'t get in';
        body = on['d-update']
          ? 'The update fixes the stamp itself. The worm can knock all it likes; the door won\'t open. This is the strongest single defence.'
          : 'With SMBv1 off, the clerk no longer accepts the old packing lists, so the buggy translation never runs.';
        if (!on['d-backup']) body += ' Still keep backups: the next attack might use a different trick, like NotPetya\'s stolen passwords.';
        else body += ' And with backups too, even a different attack couldn\'t destroy your files for good.';
      } else if (on['d-firewall']) {
        cls = 'mid';
        head = 'Safer, but not safe';
        body = 'Strangers on the internet can\'t reach door 445 any more. But one infected laptop plugged in inside the network can still start a chain reaction.';
        if (inner) body += ' Zones and admin limits would keep that chain reaction small.';
        if (on['d-backup']) body += ' And with backups, you could recover.';
      } else if (inner || on['d-backup']) {
        cls = 'mid';
        head = 'You\'ll get hit, but you can limit the damage';
        const parts = [];
        if (inner) parts.push('the worm only takes down part of the network');
        if (on['d-backup']) parts.push('you can restore your files from backups');
        body = 'WannaCry still gets in, but ' + parts.join(', and ') + '. Now try a defence that stops it at the door.';
      } else {
        cls = 'bad';
        head = 'Every link holds';
        body = 'WannaCry walks straight in, spreads everywhere, and your files are gone. Switch on a defence to break a link.';
      }
      verdict.className = 'verdict ' + cls;
      verdict.innerHTML = `<b>${head}</b>${body}`;
    }
    boxes.forEach((b) => b.addEventListener('change', render));
    render();
  })();

  /* ---------- start ---------- */
  go(indexOfHash(), 'init');
})();
