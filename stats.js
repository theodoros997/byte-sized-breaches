/* Anonymous visit counts with GoatCounter (https://www.goatcounter.com). See SECURITY.md.
   No cookies and no third-party script: each count is one small image request to GoatCounter.
   Counting is skipped when the browser sends Do Not Track or Global Privacy Control,
   and when the page is opened locally. */
(() => {
  'use strict';
  const CODE = 'theodoros997'; // the "yourname" in yourname.goatcounter.com
  const ENDPOINT = 'https://' + CODE + '.goatcounter.com/count';

  const off = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true ||
    !/^https?:$/.test(location.protocol) ||
    /^(localhost|127\.|\[::1\]$)/.test(location.hostname);

  // Where the visitor came from, sent once, only when it's another site.
  let ref = '';
  try { if (document.referrer && new URL(document.referrer).origin !== location.origin) ref = document.referrer; } catch (e) { /* ignore */ }

  function send(params) {
    if (off) return;
    const q = new URLSearchParams(params);
    if (ref) { q.set('r', ref); ref = ''; }
    q.set('rnd', Math.random().toString(36).slice(2));
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = ENDPOINT + '?' + q.toString();
  }

  const page = location.pathname.replace(/index\.html$/, '');

  // Case pages: one count per chapter reached (the router fires "chapterchange").
  let last = '';
  document.addEventListener('chapterchange', (e) => {
    const p = page + '#' + e.detail.id;
    if (p === last) return;
    last = p;
    send({ p, t: document.title + ' / ' + e.detail.title });
  });

  // Pages without chapters (the hub): one count per visit.
  if (!document.querySelector('.chapter')) {
    send({ p: page, t: document.title });
  }

  // Ko-fi button clicks, counted as events so you can see which page they came from.
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href*="ko-fi.com/"]')) {
      send({ p: 'kofi-click' + page, t: 'Ko-fi click', e: 'true' });
    }
  });
})();
