/* Pegasus explainer: chapter router + eight small games. Plain JS, no libraries. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? Math.min(ms, 60) : ms));
  const SVGNS = 'http://www.w3.org/2000/svg';
  function seeded(seed) { // mulberry32
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, rnd = Math.random) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function setStatus(el, html, kind) {
    el.innerHTML = html;
    el.classList.toggle('good', kind === 'good');
    el.classList.toggle('bad', kind === 'bad');
  }
  const ICON = {
    msg: '<path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6L4.5 21l4.3-2.3c1 .2 2.1.3 3.2.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/>',
    lockmsg: '<path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6L4.5 21l4.3-2.3c1 .2 2.1.3 3.2.3 5.5 0 10-3.6 10-8s-4.5-8-10-8zm3 11H9v-3.5h.6V9.6a2.4 2.4 0 0 1 4.8 0v.9h.6zm-1.8-3.5v-.9a1.2 1.2 0 0 0-2.4 0v.9z"/>',
    photo: '<path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 12h14l-4.5-6-3.5 4.5-2.5-3z"/><circle cx="8" cy="9" r="1.6"/>',
    call: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/>',
    link: '<path d="M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 0 0-4.2-4.2l-1.5 1.5 1.4 1.4 1.5-1.5a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 0 0 1.4zm2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 0 0 4.2 4.2l1.5-1.5-1.4-1.4-1.5 1.5a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 0 0-1.4z"/>',
    pass: '<path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1zm5 2v2h2V8zm0 3v2h2v-2zm0 3v2h2v-2z"/>',
    file: '<path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm7 1.5V8h4.5zM12 11v5.2l-2.1-2.1-1.4 1.4L12 19l3.5-3.5-1.4-1.4-2.1 2.1V11z"/>',
    mail: '<path d="M3 6h18v12H3zm2 2v.3l7 4.4 7-4.4V8l-7 4.4z"/>',
    pin: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
    cam: '<path d="M9 4h6l1.5 2H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5zm3 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>',
    mic: '<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.9V21h-2v-3.1A7 7 0 0 1 5 11z"/>',
    person: '<path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z"/>',
    cal: '<path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm-2 7v10h14V9zm2 2h4v4H7z"/>'
  };
  const svgIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

  /* =====================================================================
     Hero: background stars
     ===================================================================== */
  (function heroStars() {
    const g = $('#hero-bg');
    if (!g) return;
    const rnd = seeded(2016);
    for (let i = 0; i < 70; i++) {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', (rnd() * 600).toFixed(1));
      c.setAttribute('cy', (rnd() * 420).toFixed(1));
      c.setAttribute('r', (0.5 + rnd() * 1.3).toFixed(2));
      c.setAttribute('class', 'bg-star');
      g.appendChild(c);
    }
  })();

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
    if (i === 0) return;
    const nav = document.createElement('nav');
    nav.className = 'chap-nav';
    nav.setAttribute('aria-label', 'Chapter navigation');
    nav.insertAdjacentHTML('beforeend', `<button class="btn ghost" type="button" data-go="prev">&larr; Back</button><span class="spacer"></span>`);
    if (i < chapters.length - 1) {
      nav.insertAdjacentHTML('beforeend', `<button class="btn" type="button" data-go="next">Next: ${chapters[i + 1].dataset.title} &rarr;</button>`);
    } else {
      nav.insertAdjacentHTML('beforeend', `<button class="btn ghost" type="button" data-go="first">Play again</button><a class="btn" href="index.html">All cases &rarr;</a>`);
    }
    ch.appendChild(nav);
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
     Game 1: who opens the door?
     ===================================================================== */
  (function doors() {
    const ITEMS = [
      { ic: 'msg', col: '--app-2', app: 'Messages', title: 'Unknown number', body: 'Hi, is this still your number?', what: 'A text message', auto: true, why: 'Your phone reads every incoming text to show a preview like this one, before you open anything.' },
      { ic: 'photo', col: '--app-1', app: 'Chat', title: 'Sam', body: 'Sent you a photo', what: 'A photo in a chat', auto: true, why: 'To draw the little preview, the phone decodes the image the moment it arrives.' },
      { ic: 'call', col: '--app-2', app: 'Phone', title: 'Incoming call', body: 'Unknown caller', what: 'An incoming call', auto: true, why: 'Before it can even ring, the app quietly swaps data with the caller to set up the call.' },
      { ic: 'link', col: '--app-2', app: 'Messages', title: 'Parcel service', body: 'Your parcel is waiting: tap the link', what: 'A link in a text', auto: false, why: 'The website only loads if you tap the link. (Some apps fetch a small preview of links, which is a door of its own.)' },
      { ic: 'pass', col: '--app-8', app: 'Messages', title: 'Ticket', body: 'Concert ticket attached', what: 'A ticket attached to a message', auto: true, why: 'Tickets and passes in a message are opened straight away so the phone can show a preview card.' },
      { ic: 'file', col: '--app-6', app: 'Files', title: 'report.zip', body: 'Tap to download', what: 'A file waiting to download', auto: false, why: 'Nothing happens until you choose to download and open it.' }
    ];
    const list = $('#dr-list');
    const what = $('#dr-what');
    const status = $('#dr-status');
    const next = $('#dr-next');
    const score = $('#dr-score');
    const choices = $$('[data-door]');
    let idx = 0;
    let right = 0;
    let answered = 0;

    const lis = ITEMS.map((it) => {
      const li = document.createElement('li');
      li.className = 'notif wait';
      li.innerHTML = `<span class="ic" style="background:var(${it.col})">${svgIcon(it.ic)}</span><span class="nt"><span>${it.app} &middot; ${it.title}</span></span><span class="nb">${it.body}</span>`;
      list.appendChild(li);
      return li;
    });
    function show() {
      lis.forEach((li, i) => {
        li.classList.toggle('cur', i === idx);
        li.classList.toggle('wait', i > idx);
      });
      what.textContent = ITEMS[idx].what;
      choices.forEach((c) => { c.disabled = false; });
      next.hidden = true;
    }
    function answer(kind) {
      const it = ITEMS[idx];
      const ok = (kind === 'auto') === it.auto;
      if (ok) right++;
      answered++;
      choices.forEach((c) => { c.disabled = true; });
      const tag = document.createElement('span');
      tag.className = 'tag ' + (it.auto ? 'auto' : 'manual');
      tag.textContent = it.auto ? 'Opens itself' : 'Waits';
      lis[idx].querySelector('.nt').appendChild(tag);
      setStatus(status, `${ok ? 'Right.' : 'Not quite.'} ${it.why}`, ok ? 'good' : 'bad');
      score.textContent = `${right} right, ${answered} of ${ITEMS.length} answered`;
      if (idx < ITEMS.length - 1) {
        next.hidden = false;
        next.textContent = 'Next delivery →';
      } else {
        lis[idx].classList.remove('cur');
        what.textContent = 'All six checked';
        setStatus(status, `${ok ? 'Right. ' : ''}<b>4 of the 6 doors open by themselves.</b> Each runs code you never asked to run, on something a stranger sent. If that code has a hidden bug, a stranger can break in without you doing anything. Remember this: it is the key to the whole Pegasus story.`, 'good');
        next.hidden = false;
        next.textContent = 'Play again';
      }
    }
    choices.forEach((c) => c.addEventListener('click', () => answer(c.dataset.door)));
    next.addEventListener('click', () => {
      if (idx < ITEMS.length - 1) { idx++; status.textContent = ''; show(); return; }
      idx = 0; right = 0; answered = 0;
      lis.forEach((li) => { const t = li.querySelector('.tag'); if (t) t.remove(); });
      status.textContent = '';
      score.textContent = `0 of ${ITEMS.length} answered`;
      show();
    });
    show();
  })();

  /* =====================================================================
     Game 2: one tap (Trident)
     ===================================================================== */
  (function oneclick() {
    const choices = $$('[data-oc]');
    const browser = $('#oc-browser');
    const tapBox = $('#oc-tap');
    const prongs = $$('.prong');
    const out = $('#oc-out');
    const again = $('#oc-again');
    let busy = false;

    function outcome(kind, head, body) {
      out.className = 'outcome ' + kind;
      out.innerHTML = `<p class="oh">${head}</p>${body}`;
      out.hidden = false;
    }
    async function pick(kind) {
      if (busy) return;
      busy = true;
      choices.forEach((c) => { c.disabled = true; });
      out.hidden = true;
      tapBox.hidden = true;
      if (kind === 'tap') {
        tapBox.hidden = false;
        prongs.forEach((p) => p.classList.remove('lit'));
        browser.hidden = false;
        for (const p of prongs) {
          await wait(1100);
          p.classList.add('lit');
        }
        await wait(900);
        browser.hidden = true;
        outcome('bad', 'Pegasus is in.', '<p>Three hidden bugs, used one after another, took over the phone in seconds. All you saw was a blank page that closed itself.</p><p>Researchers later named this chain <b>Trident</b>. A fitting name: in Greek myth, Pegasus was a son of Poseidon, whose weapon was a trident.</p><p>That is not what happened to Mansoor, though. Try another choice.</p>');
      } else if (kind === 'ignore') {
        outcome('', 'Safe, for now.', '<p>Ignoring it works this time. But the attackers can simply try again with a better story. Mansoor\'s second message arrived the very next day.</p><p>And nobody learns that an attack happened. There is a better choice.</p>');
      } else {
        outcome('good', 'That\'s what Mansoor did.', '<p>He didn\'t tap. He forwarded the messages to researchers at <b>Citizen Lab</b> in Toronto. They opened the link on a test iPhone and watched the attack unfold, revealing three bugs that Apple didn\'t know about: zero-days.</p><p>Apple fixed all three in iOS 9.3.5 on 25 August 2016, about two weeks after the first message. It was the first time anyone had caught Pegasus in action.</p><p>Mansoor paid a heavy price for his activism: he was arrested in 2017 and sentenced to ten years in prison over his social media posts.</p>');
      }
      again.hidden = false;
      busy = false;
    }
    choices.forEach((c) => c.addEventListener('click', () => pick(c.dataset.oc)));
    again.addEventListener('click', () => {
      choices.forEach((c) => { c.disabled = false; });
      again.hidden = true;
      out.hidden = true;
      tapBox.hidden = true;
    });
  })();

  /* =====================================================================
     Game 3: the call you can't refuse
     ===================================================================== */
  (function zeroclick() {
    const btn = $('#zc-go');
    const idle = $('#zc-idle');
    const ring = $('#zc-ring');
    const logScr = $('#zc-log');
    const row = $('#zc-row');
    const phone = $('#zc-phone');
    const trace = $('#zc-trace');
    const out = $('#zc-out');
    const dec = $('#zc-decline');
    const acc = $('#zc-accept');
    let action = 'none';
    let running = false;
    let gen = 0;

    function line(ts, text, cls) {
      const li = document.createElement('li');
      if (cls) li.className = cls;
      li.innerHTML = `<span class="ts">${ts}</span><span>${text}</span>`;
      trace.appendChild(li);
    }
    function userAct(kind) {
      if (!running || action !== 'none') return;
      action = kind;
      dec.disabled = true;
      acc.disabled = true;
      if (kind === 'decline') {
        line('you', 'You pressed Decline.', 'you');
        ring.querySelector('.sub').textContent = 'Call declined';
      } else {
        line('you', 'You answered. Silence on the line.', 'you');
        ring.querySelector('.sub').textContent = 'Connected… nobody speaks';
      }
    }
    async function run() {
      if (running) return;
      running = true;
      const my = ++gen;
      action = 'none';
      btn.disabled = true;
      out.hidden = true;
      trace.innerHTML = '';
      phone.classList.add('dark');
      idle.hidden = true;
      logScr.hidden = true;
      ring.hidden = false;
      ring.querySelector('.sub').textContent = 'Voice call…';
      dec.disabled = false;
      acc.disabled = false;
      row.classList.remove('gone');
      const steps = [
        [0, '0.0s', 'Call arriving: the app starts setting up the connection'],
        [700, '0.4s', 'Setup data received, crafted by the attacker'],
        [1500, '0.6s', 'Bug triggered in the calling code', 'bad'],
        [2500, '1.2s', 'Pegasus downloading in the background', 'bad'],
        [3700, '2.5s', 'Pegasus installed', 'bad']
      ];
      let tPrev = 0;
      for (const [t, ts, text, cls] of steps) {
        await wait(t - tPrev);
        tPrev = t;
        if (my !== gen) return;
        line(ts, text, cls);
      }
      await wait(900);
      if (my !== gen) return;
      ring.hidden = true;
      phone.classList.remove('dark');
      logScr.hidden = false;
      line('3.1s', 'Erasing the missed call from the call log', 'bad');
      await wait(1100);
      row.classList.add('gone');
      await wait(700);
      const said = {
        none: 'You did nothing, and it made no difference.',
        decline: 'You declined, but the setup data had already been processed before you could react.',
        accept: 'Answering made no difference either.'
      }[action];
      out.className = 'outcome bad';
      out.innerHTML = `<p class="oh">No choice could stop it.</p><p>${said} That's a <b>zero-click</b> attack: the target doesn't have to do anything at all.</p><p>WhatsApp found the bug and shipped a fix in May 2019. It said about 1,400 phones had been targeted in roughly two weeks.</p>`;
      out.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Try again';
      dec.disabled = true;
      acc.disabled = true;
      running = false;
    }
    btn.addEventListener('click', run);
    dec.addEventListener('click', () => userAct('decline'));
    acc.addEventListener('click', () => userAct('accept'));
    hooks.zeroclick = {
      leave() {
        if (!running) return;
        gen++;
        running = false;
        btn.disabled = false;
        ring.hidden = true;
        logScr.hidden = true;
        idle.hidden = false;
        phone.classList.add('dark');
        trace.innerHTML = '<li class="idle">What happens inside the phone will appear here.</li>';
      }
    };
  })();

  /* =====================================================================
     Game 4: a computer made of pixels (FORCEDENTRY)
     ===================================================================== */
  (function picture() {
    const A = [1, 1, 0, 0, 1, 1, 0, 0];
    const B = [1, 0, 1, 0, 1, 0, 1, 0];
    const OPS = {
      AND: (a, b) => a & b,
      OR: (a, b) => a | b,
      XOR: (a, b) => a ^ b
    };
    const LEVELS = [
      { name: 'Level 1', brief: 'Make the result match the target row.', slots: [{ label: 'Result', want: 'AND' }] },
      { name: 'Level 2', brief: 'A different target. Which rule makes it?', slots: [{ label: 'Result', want: 'XOR' }] },
      { name: 'Level 3: an adder', brief: 'Now do arithmetic. Each column adds two digits, A + B, written in binary: 1 + 1 = 10, so the column needs a <b>sum</b> digit and a <b>carry</b> digit. Find a rule for each.', slots: [{ label: 'Sum', want: 'XOR' }, { label: 'Carry', want: 'AND' }], adder: true }
    ];
    const tabs = $('#pc-tabs');
    const brief = $('#pc-brief');
    const board = $('#pc-board');
    const opsBox = $('#pc-ops');
    const status = $('#pc-status');
    let lvl = 0;
    let picks = [];
    const done = new Set();

    const cells = (bits) => bits.map((b) => `<span class="px ${b ? 'on' : ''}"></span>`).join('');
    const apply = (op) => A.map((a, i) => OPS[op](a, B[i]));

    function render() {
      tabs.innerHTML = LEVELS.map((L, i) => `<button type="button" role="tab" aria-selected="${i === lvl}" class="${i === lvl ? 'on' : ''} ${done.has(i) ? 'done' : ''}" data-l="${i}">${L.name}</button>`).join('');
      const L = LEVELS[lvl];
      brief.innerHTML = L.brief;
      let html = '';
      if (L.adder) {
        html += `<div class="sum-cols"><span></span>${A.map((a, i) => `<span>${a}+${B[i]}</span>`).join('')}</div>`;
      }
      html += `<div class="pix-row"><span class="rl">Row A</span>${cells(A)}</div>`;
      html += `<div class="pix-row"><span class="rl">Row B</span>${cells(B)}</div>`;
      L.slots.forEach((s, k) => {
        const p = picks[k];
        const res = p ? apply(p) : A.map(() => 0);
        const ok = p === s.want;
        html += `<div class="pix-sep"></div>`;
        html += `<div class="pix-row res ${ok ? 'ok' : ''}"><span class="rl">${s.label}${p ? ' (' + p + ')' : ''}</span>${cells(res)}</div>`;
        html += `<div class="pix-row target"><span class="rl">${s.label} target</span>${cells(apply(s.want))}</div>`;
      });
      board.innerHTML = html;
      opsBox.innerHTML = L.slots.map((s, k) => `<div class="ops" role="group" aria-label="Rule for ${s.label}"><span class="ol">${s.label} rule:</span>${Object.keys(OPS).map((o) => `<button type="button" class="op ${picks[k] === o ? 'on' : ''}" data-k="${k}" data-op="${o}" aria-pressed="${picks[k] === o}">${o}</button>`).join('')}</div>`).join('');
      const allOk = L.slots.every((s, k) => picks[k] === s.want);
      const anyPick = picks.some(Boolean);
      if (allOk) {
        done.add(lvl);
        tabs.querySelectorAll('button')[lvl].classList.add('done');
        if (lvl === 0) setStatus(status, 'Matched! AND is like a gate that needs two keys. Try level 2.', 'good');
        else if (lvl === 1) setStatus(status, 'Matched! XOR spots differences. Now for the clever part: level 3.', 'good');
        else setStatus(status, 'You built a <b>half adder</b>, one of the basic parts of every computer\'s arithmetic. Chain enough of them and you can calculate anything. The attackers did exactly that, with about 70,000 steps, inside a picture format that was never meant to compute.', 'good');
      } else if (anyPick) {
        setStatus(status, L.slots.length > 1 && picks.filter(Boolean).length < 2 ? 'Now pick a rule for the other row.' : 'Not a match yet. Compare your result with the target, column by column.', null);
      } else {
        setStatus(status, '', null);
      }
    }
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-l]');
      if (!b) return;
      lvl = +b.dataset.l;
      picks = [];
      render();
    });
    opsBox.addEventListener('click', (e) => {
      const b = e.target.closest('[data-op]');
      if (!b) return;
      picks[+b.dataset.k] = b.dataset.op;
      render();
    });
    render();
  })();

  /* =====================================================================
     Game 5: what Pegasus sees
     ===================================================================== */
  (function sees() {
    const APPS = [
      { ic: 'msg', name: 'Messages', col: '--app-2', k: 'Text', v: 'From Dad: "Call me when you land."' },
      { ic: 'lockmsg', name: 'Secure Chat', col: '--app-1', k: 'Encrypted', v: 'To source K: "I have the documents. Not over email."', s: 'End-to-end encrypted, but read on the screen before it was scrambled' },
      { ic: 'mail', name: 'Mail', col: '--app-6', k: 'Email', v: 'Draft: "Port contracts story, final version"' },
      { ic: 'photo', name: 'Photos', col: '--app-3', k: 'Photo', v: 'Copied: whiteboard covered in names and dates' },
      { ic: 'pin', name: 'Maps', col: '--app-4', k: 'Location', v: 'Café on Harbour Street, right now', s: 'Updated every few minutes' },
      { ic: 'cam', name: 'Camera', col: '--app-7', k: 'Camera', v: 'Switched on remotely' },
      { ic: 'mic', name: 'Recorder', col: '--app-8', k: 'Microphone', v: 'Recording the room around the phone' },
      { ic: 'person', name: 'Contacts', col: '--app-5', k: 'Contacts', v: '1,204 contacts copied, sources included' },
      { ic: 'cal', name: 'Calendar', col: '--app-9', k: 'Calendar', v: '"Meet K, 6 pm, back entrance"' }
    ];
    const grid = $('#ws-apps');
    const feed = $('#ws-feed');
    const toggle = $('#ws-on');
    const toggleT = $('#ws-on-t');
    const consoleBox = $('#ws-console');
    const status = $('#ws-status');
    const seen = new Set();
    let pingTimer = null;
    let pingN = 0;

    const now = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };
    function add(k, v, s) {
      const idleLi = feed.querySelector('.idle');
      if (idleLi) idleLi.remove();
      const li = document.createElement('li');
      li.innerHTML = `<span class="fk">${k}</span><span class="fv">${v}${s ? `<small>${s}</small>` : ''}<small>${now()}</small></span>`;
      feed.prepend(li);
      while (feed.children.length > 12) feed.lastElementChild.remove();
    }
    const btns = APPS.map((a, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'app';
      b.innerHTML = `<span class="ai" style="background:var(${a.col})">${svgIcon(a.ic)}</span>${a.name}`;
      b.addEventListener('click', () => {
        if (!toggle.checked) {
          setStatus(status, `Lena opens ${a.name}. Everything looks normal. Now switch Pegasus on.`);
          return;
        }
        add(a.k, a.v, a.s);
        b.classList.add('copied');
        seen.add(i);
        if (seen.size >= 4) setStatus(status, `The operator has seen ${seen.size} of Lena's apps. She noticed nothing: no icon, no warning, no slowdown.`, 'bad');
        else setStatus(status, `Copied to the operator. Try another app.`, 'bad');
      });
      grid.appendChild(b);
      return b;
    });
    function startPings() {
      stopPings();
      pingTimer = setInterval(() => {
        pingN++;
        add('Location', pingN % 2 ? 'Phone moved: walking, Harbour Street' : 'Phone still: Harbour Street', 'Automatic update');
      }, 6000);
    }
    function stopPings() { clearInterval(pingTimer); pingTimer = null; }
    toggle.addEventListener('change', () => {
      const on = toggle.checked;
      toggleT.textContent = on ? 'Pegasus is on' : 'Pegasus is off';
      consoleBox.classList.toggle('live', on);
      if (on) {
        add('Status', 'Phone infected. Collecting in the background.');
        setStatus(status, 'Now tap Lena\'s apps, as she would during her day.', 'bad');
        startPings();
      } else {
        stopPings();
        seen.clear();
        btns.forEach((b) => b.classList.remove('copied'));
        feed.innerHTML = '<li class="idle">Not infected. The operator sees nothing.</li>';
        setStatus(status, '');
      }
    });
    hooks.sees = {
      enter() { if (toggle.checked) startPings(); },
      leave() { stopPings(); }
    };
  })();

  /* =====================================================================
     Game 6: the forensic check
     ===================================================================== */
  (function watched() {
    const grid = $('#fx-grid');
    const btn = $('#fx-run');
    const status = $('#fx-status');
    const cnt = { inf: $('#fx-inf'), att: $('#fx-att'), none: $('#fx-none') };
    const results = shuffle([].concat(Array(23).fill('inf'), Array(14).fill('att'), Array(30).fill('none')), seeded(67));
    const icons = results.map(() => {
      const d = document.createElement('span');
      d.className = 'fx';
      grid.appendChild(d);
      return d;
    });
    let busy = false;
    let gen = 0;
    btn.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      const my = ++gen;
      btn.disabled = true;
      const n = { inf: 0, att: 0, none: 0 };
      Object.values(cnt).forEach((c) => { c.textContent = '0'; });
      icons.forEach((d) => { d.className = 'fx'; });
      setStatus(status, 'Checking logs, phone by phone…');
      for (let i = 0; i < icons.length; i++) {
        if (my !== gen) return;
        icons[i].classList.add('scan');
        await wait(55);
        icons[i].className = 'fx ' + results[i];
        n[results[i]]++;
        cnt[results[i]].textContent = n[results[i]];
      }
      setStatus(status, `Of 67 phones checked, <b>37 showed traces of Pegasus</b>: 23 successfully infected and 14 with signs of an attempted attack. Android phones keep fewer of the logs investigators rely on, so several "no traces" results were really "can't tell".`, 'bad');
      btn.disabled = false;
      btn.textContent = 'Check again';
      busy = false;
    });
    hooks.watched = { leave() { if (busy) { gen++; busy = false; btn.disabled = false; } } };
  })();

  /* =====================================================================
     Game 7: spot the impostors
     ===================================================================== */
  (function hunters() {
    const PROCS = [
      ['SpringBoard', 0, 61], ['backboardd', 0, 64], ['bh', 1, 2187], ['locationd', 0, 88],
      ['mediaserverd', 0, 112], ['imagent', 0, 245], ['roleaccountd', 1, 2203], ['nsurlsessiond', 0, 301],
      ['accountsd', 0, 156], ['cloudd', 0, 340], ['stagingd', 1, 2214], ['fseventsd', 0, 47]
    ];
    const list = $('#hn-list');
    const check = $('#hn-check');
    const reset = $('#hn-reset');
    const count = $('#hn-count');
    const status = $('#hn-status');
    const explain = $('#hn-explain');
    let checked = false;
    const btns = PROCS.map(([name, , pid]) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'proc';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="pid">${pid}</span><span>${name}</span><span class="flag">Flagged</span>`;
      b.addEventListener('click', () => {
        if (checked) return;
        const on = !b.classList.contains('flagged');
        b.classList.toggle('flagged', on);
        b.setAttribute('aria-pressed', String(on));
        update();
      });
      li.appendChild(b);
      list.appendChild(li);
      return b;
    });
    function update() {
      const n = btns.filter((b) => b.classList.contains('flagged')).length;
      count.textContent = `${n} flagged`;
    }
    check.addEventListener('click', () => {
      if (checked) return;
      const n = btns.filter((b) => b.classList.contains('flagged')).length;
      if (!n) { setStatus(status, 'Flag at least one program first. Tap the names that look out of place.'); return; }
      checked = true;
      let hits = 0;
      let wrong = 0;
      btns.forEach((b, i) => {
        const bad = PROCS[i][1] === 1;
        const fl = b.classList.contains('flagged');
        b.classList.remove('flagged');
        const tag = b.querySelector('.flag');
        if (bad && fl) { b.classList.add('hit'); tag.textContent = 'Pegasus'; hits++; }
        else if (bad) { b.classList.add('miss'); tag.textContent = 'Missed'; }
        else if (fl) { b.classList.add('wrong'); tag.textContent = 'Genuine'; wrong++; }
        b.disabled = true;
      });
      let msg = `You caught <b>${hits} of 3</b> impostors.`;
      if (wrong) msg += ` ${wrong} of your flags ${wrong === 1 ? 'was a genuine iOS process' : 'were genuine iOS processes'}, which is why real investigators never rely on names alone.`;
      else if (hits === 3) msg += ' A perfect score, with no false alarms.';
      setStatus(status, msg, hits === 3 && !wrong ? 'good' : null);
      explain.hidden = false;
      check.disabled = true;
    });
    reset.addEventListener('click', () => {
      checked = false;
      btns.forEach((b) => {
        b.className = 'proc';
        b.disabled = false;
        b.setAttribute('aria-pressed', 'false');
        b.querySelector('.flag').textContent = 'Flagged';
      });
      explain.hidden = true;
      check.disabled = false;
      setStatus(status, '');
      update();
    });
  })();

  /* =====================================================================
     Game 8: could you have dodged it? + advice filter
     ===================================================================== */
  (function defend() {
    const Q = [
      { y: '2016 · Trident', t: 'A link in a text message', a: true, r: 'The attack only started if the link was tapped. Mansoor didn\'t tap, and that\'s how it was caught.' },
      { y: '2019 · WhatsApp', t: 'A booby-trapped voice call', a: false, r: 'The break-in happened while the call was being set up, whatever the target did.' },
      { y: '2021 · FORCEDENTRY', t: 'A fake GIF sent by iMessage', a: false, r: 'iMessage processed the file by itself to show a preview.' },
      { y: '2023 · BLASTPASS', t: 'A booby-trapped ticket attachment', a: false, r: 'It was zero-click too. But Lockdown Mode blocked it, and an update fixed it within days.' }
    ];
    const box = $('#qz');
    const status = $('#qz-status');
    let answered = 0;
    let right = 0;
    Q.forEach((q) => {
      const d = document.createElement('div');
      d.className = 'q';
      d.innerHTML = `<p class="qy">${q.y}</p><p class="qt">${q.t}</p><div class="qa"><button type="button" class="qbtn" data-a="1">Yes</button><button type="button" class="qbtn" data-a="0">No</button></div><p class="qr" hidden></p>`;
      d.querySelectorAll('.qbtn').forEach((b) => b.addEventListener('click', () => {
        const yes = b.dataset.a === '1';
        const ok = yes === q.a;
        d.classList.add(ok ? 'right' : 'wrong');
        d.querySelectorAll('.qbtn').forEach((x) => { x.disabled = true; });
        b.classList.add('pick');
        const r = d.querySelector('.qr');
        r.innerHTML = `<b>${q.a ? 'Yes.' : 'No.'}</b> ${q.r}`;
        r.hidden = false;
        answered++;
        if (ok) right++;
        if (answered === Q.length) {
          setStatus(status, `${right} of 4 right. Only the oldest attack needed a tap. For the rest, being careful wasn't enough, which is why updates, restarts and Lockdown Mode matter so much.`, right >= 3 ? 'good' : null);
        }
      }));
      box.appendChild(d);
    });

    const segBtns = $$('.seg button');
    const cards = $$('#dc .dcard');
    segBtns.forEach((b) => b.addEventListener('click', () => {
      segBtns.forEach((x) => x.classList.toggle('on', x === b));
      const who = b.dataset.who;
      cards.forEach((c) => {
        const forAll = c.dataset.for === 'all';
        c.classList.toggle('dim', who === 'all' && !forAll);
        c.classList.toggle('hl', who === 'risk' && !forAll);
      });
    }));
    segBtns[0].click();
  })();

  /* ---------- start ---------- */
  go(indexOfHash(), 'init');
})();
