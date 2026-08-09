/* ═══════════════════════════════════════════════════════════════
   TAPLINE — behaviour
   No dependencies. Everything degrades to a readable static page.
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

/* ───────────────────────────────────────────────────────────────
   CONFIGURE ME
   Paste your real Shopify product / page URLs here. Until a key has
   a URL, its button says so out loud instead of silently doing nothing.
   ─────────────────────────────────────────────────────────────── */
const LINKS = {
  'full-access':   '',   // e.g. '/products/tapline-method-full-access'
  'supplier-list': '',   // e.g. '/products/tapline-supplier-list'
  'mini-course':   '',   // e.g. '/products/card-programming-mini-course'
  cart:            '',   // e.g. '/cart'
  account:         '',   // e.g. '/account'
  contact:         '',   // e.g. '/pages/contact'
  privacy:         '',   // e.g. '/policies/privacy-policy'
  terms:           '',   // e.g. '/policies/terms-of-service'
  instagram:       ''    // e.g. 'https://instagram.com/yourhandle'
};

const PRODUCT_PRICE = 89;              // used by the payback figure
const LOCALE = 'en-CA';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];


/* ── Scroll: progress bar + sticky header ─────────────────────
   One listener, one rAF frame. Reading scrollHeight on every scroll
   event would thrash layout. */
(() => {
  const bar = $('.scroll-progress i');
  const head = $('#head');
  let ticking = false;

  const paint = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    if (bar) bar.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + '%';
    if (head) head.classList.toggle('stuck', y > 12);
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  }, { passive: true });
  paint();
})();


/* ── Scroll reveal ────────────────────────────────────────────
   Reveal once, then drop the stagger delay so the element never
   inherits it during a later interaction. */
(() => {
  const items = $$('.reveal');
  items.forEach(el => { if (el.dataset.d) el.style.setProperty('--d', el.dataset.d); });

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in', 'done'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      setTimeout(() => e.target.classList.add('done'), 900);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  items.forEach(el => io.observe(el));
})();


/* ── Mobile navigation ────────────────────────────────────────
   Escape closes it, focus returns to the trigger, and body scroll
   is left alone (the panel is short enough not to need a lock). */
(() => {
  const burger = $('#burger');
  const panel = $('#mobile-nav');
  const head = $('#head');
  if (!burger || !panel || !head) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    head.classList.toggle('open', open);
    panel.hidden = !open;
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      burger.focus();
    }
  });

  // Coming back to desktop width must not leave a hidden panel "open".
  matchMedia('(min-width:1041px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
})();


/* ── Hero card: pointer tilt ──────────────────────────────────
   Tying rotation straight to the cursor feels mechanical, so the
   target is eased toward on each frame — cheap spring damping.
   Decorative only: skipped entirely on touch and reduced motion. */
(() => {
  const stage = $('#stage');
  const card = $('#card3d');
  if (!stage || !card || !finePointer.matches || reduced.matches) return;

  const REST = { x: 9, y: -17 };
  let target = { ...REST }, current = { ...REST }, raf = 0, active = false;

  const frame = () => {
    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;
    card.style.setProperty('--rx', current.x.toFixed(2) + 'deg');
    card.style.setProperty('--ry', current.y.toFixed(2) + 'deg');

    const settled = Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05;
    raf = (settled && !active) ? 0 : requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    active = true;
    target = { x: REST.x - py * 20, y: REST.y + px * 26 };
    kick();
  });

  stage.addEventListener('pointerleave', () => { active = false; target = { ...REST }; kick(); });
})();


/* ── Bento spotlight ──────────────────────────────────────────
   Writes to the hovered tile only. Setting the variable on a shared
   parent would recalculate styles for every child on each move. */
(() => {
  if (!finePointer.matches) return;
  $$('.bx').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();


/* ── Magnetic CTA ─────────────────────────────────────────────
   4px of pull. Enough to register as responsive, small enough that
   the button never slides out from under the cursor. */
(() => {
  if (!finePointer.matches || reduced.matches) return;
  const PULL = 4;

  $$('[data-magnet]').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * PULL;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * PULL;
      btn.style.setProperty('--tx', x.toFixed(1) + 'px');
      btn.style.setProperty('--ty', y.toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    });
  });
})();


/* ── Margin calculator ────────────────────────────────────────
   Values update on the same frame as the drag. A count-up animation
   here would put the number behind the user's thumb. */
(() => {
  const qty = $('#s-qty'), price = $('#s-price'), cost = $('#s-cost');
  if (!qty || !price || !cost) return;

  const money = (n, dp = 0) => new Intl.NumberFormat(LOCALE, {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: dp, maximumFractionDigits: dp
  }).format(n).replace(/^CA/, '');

  const out = {
    qty: $('#o-qty'), price: $('#o-price'), cost: $('#o-cost'),
    profit: $('#o-profit'), rev: $('#o-rev'), cogs: $('#o-cogs'),
    margin: $('#o-margin'), payback: $('#o-payback'),
    barRev: $('#bar-rev'), barCost: $('#bar-cost')
  };

  // Paints the filled portion of the track (WebKit has no ::-moz-range-progress).
  const fill = (el) => {
    const pct = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty('--fill', pct + '%');
  };

  const update = () => {
    const q = +qty.value, p = +price.value, c = +cost.value;
    const revenue = q * p;
    const cogs = q * c;
    const profit = revenue - cogs;
    const margin = revenue > 0 ? Math.round(profit / revenue * 100) : 0;
    const unit = p - c;

    out.qty.value = q;
    out.price.value = money(p);
    out.cost.value = money(c, 2);

    out.profit.textContent = money(profit);
    out.rev.textContent = money(revenue);
    out.cogs.textContent = money(cogs);
    out.margin.textContent = margin + '%';
    out.payback.textContent = unit > 0 ? Math.ceil(PRODUCT_PRICE / unit) : '—';

    out.barRev.style.width = '100%';
    out.barCost.style.width = Math.max(revenue > 0 ? cogs / revenue * 100 : 0, 1.2) + '%';

    [qty, price, cost].forEach(fill);
  };

  [qty, price, cost].forEach(el => el.addEventListener('input', update));
  update();

  /* Count-up, but ONLY on the first scroll into view. During a drag the
     number has to track the thumb exactly — an eased count there would
     leave the figure lagging behind the user's own thumb. */
  const ko = out.profit;
  if (ko && 'IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.disconnect();

        const target = (+qty.value) * (+price.value - +cost.value);
        const DURATION = 900;
        let start = 0;

        const step = (now) => {
          if (!start) start = now;
          const t = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - t, 3);          // ease-out cubic
          ko.textContent = money(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
          else update();                                  // hand back to live values
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(ko);
  }
})();


/* ── FAQ accordion ────────────────────────────────────────────
   One panel at a time. grid-template-rows animates the height without
   measuring anything, so it survives content of any length. */
(() => {
  const list = $('#faqList');
  if (!list) return;

  const items = $$('.qa', list).map(qa => ({
    qa, btn: $('.qa-q', qa), panel: $('.qa-a', qa)
  }));

  items.forEach(({ qa, btn, panel }, i) => {
    const id = `qa-panel-${i}`;
    panel.id = id;
    btn.setAttribute('aria-controls', id);

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      items.forEach(o => {
        o.btn.setAttribute('aria-expanded', 'false');
        o.qa.classList.remove('open');
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        qa.classList.add('open');
      }
    });
  });
})();


/* ── Newsletter ───────────────────────────────────────────────
   Validates on submit and on blur — never on keystroke, which flags
   an address as invalid while it's still being typed. */
(() => {
  const form = $('#newsForm');
  if (!form) return;
  const input = $('#news-email', form);
  const msg = $('#newsMsg', form);
  const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const say = (text, isError) => {
    msg.textContent = text;
    msg.classList.toggle('err', !!isError);
    input.setAttribute('aria-invalid', String(!!isError));
  };

  input.addEventListener('blur', () => {
    if (input.value.trim() && !valid(input.value)) say('That address looks incomplete.', true);
  });
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true' && valid(input.value)) say('', false);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid(input.value)) {
      say('Enter a valid email address.', true);
      input.focus();                       // move focus to the field in error
      return;
    }
    // No backend wired up yet — post to your list provider here.
    say('Thanks — you\'re on the list.', false);
    form.reset();
  });
})();


/* ── Commerce links ───────────────────────────────────────────
   Applies configured URLs. Anything still blank announces itself
   rather than looking like a dead button. */
(() => {
  const apply = (attr) => $$(`[data-${attr}]`).forEach(el => {
    const url = LINKS[el.dataset[attr]];
    if (url) {
      el.href = url;
      if (/^https?:/i.test(url)) { el.target = '_blank'; el.rel = 'noopener'; }
    } else {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        toast(`No URL set for “${el.dataset[attr]}” — add it to LINKS in assets/js/app.js.`);
      });
    }
  });
  ['buy', 'link', 'social'].forEach(apply);
})();


/* ── Toast ────────────────────────────────────────────────────
   Enters and exits from the same edge, so the motion reads as one
   object arriving and leaving rather than two effects. */
let toastEl, toastTimer;
function toast(text) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  requestAnimationFrame(() => toastEl.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
}

})();
