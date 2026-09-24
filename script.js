/* Shared interactions, adapted from prolon-scheinfasten for the Italian site. */
function toggleFAQ(button) {
  const answer = button.nextElementSibling;
  const open = !answer.classList.contains('active');
  document.querySelectorAll('.faq-question').forEach(q => {
    q.setAttribute('aria-expanded', 'false');
    q.nextElementSibling.classList.remove('active');
    const icon = q.querySelector('.faq-icon');
    if (icon) icon.textContent = '+';
  });
  if (open) {
    answer.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    const icon = button.querySelector('.faq-icon');
    if (icon) icon.textContent = '−';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const menu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('menuOverlay');
  const section = document.getElementById('newsletter');
  const bar = document.getElementById('mobileNewsletterBar');
  const popup = document.getElementById('exitPopup');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let barClicked = false, submitted = false, popupShown = false, lastFocus;
  const track = (name, params) => {
    if (window.loadGA) window.loadGA();
    if (window.gtag) window.gtag('event', name, {page_path: location.pathname, ...params});
  };
  function setMenu(open) {
    if (!menu || !hamburger) return;
    menu.classList.toggle('active', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    if (overlay) overlay.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    updateScroll();
  }
  hamburger?.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
  overlay?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({top:target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 60) - 12, behavior:reduceMotion ? 'auto' : 'smooth'});
  }));
  function updateScroll() {
    if (header) {
      header.style.background = window.scrollY > 100 ? 'rgba(255,255,255,.98)' : 'rgba(255,255,255,.95)';
      header.style.boxShadow = window.scrollY > 100 ? '0 2px 20px rgba(0,0,0,.1)' : 'none';
    }
    if (!bar || !section) return;
    const show = window.innerWidth <= 768 && window.scrollY > 400 && !barClicked && !submitted && !document.body.classList.contains('menu-open') && section.getBoundingClientRect().top >= window.innerHeight;
    bar.hidden = !show;
    bar.classList.toggle('show', show);
  }
  window.addEventListener('scroll', updateScroll, {passive:true});
  window.addEventListener('resize', () => {if (window.innerWidth > 1100) setMenu(false); updateScroll();});
  bar?.addEventListener('click', () => {
    barClicked = true;
    updateScroll();
    window.scrollTo({top:section.offsetTop - (header?.offsetHeight || 60) - 12,behavior:reduceMotion ? 'auto' : 'smooth'});
    track('newsletter_open', {origin:'mobile_bar'});
  });
  const source = section?.querySelector('.newsletter-form-wrap');
  if (source && popup) document.getElementById('popupFormContainer').appendChild(source.cloneNode(true));
  function setPopup(open) {
    if (!popup) return;
    if (open) lastFocus = document.activeElement;
    popup.classList.toggle('active', open);
    popup.inert = !open;
    popup.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('popup-open', open);
    if (open) popup.querySelector('input[type="email"]').focus({preventScroll:true});
    else lastFocus?.focus({preventScroll:true});
  }
  document.addEventListener('mouseout', e => {
    if (popup && window.innerWidth > 768 && e.clientY <= 0 && !e.relatedTarget && !popupShown && !submitted && !document.body.classList.contains('menu-open')) {
      popupShown = true;
      setPopup(true);
    }
  });
  document.getElementById('exitClose')?.addEventListener('click', () => setPopup(false));
  popup?.addEventListener('click', e => {if (e.target === popup) setPopup(false);});
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {setMenu(false); if (popup?.classList.contains('active')) setPopup(false);}
    if (e.key === 'Tab' && popup?.classList.contains('active')) {
      const nodes = [...popup.querySelectorAll('button, input:not([type="hidden"]):not([tabindex="-1"]), a[href]')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
      if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
    }
  });
  document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', () => {
    // Native POST lets Mailchimp show actual validation / confirmation, including with JS disabled.
    // A no-cors fetch cannot tell whether Mailchimp accepted an address.
    submitted = true;
    form.querySelector('.newsletter-notice').hidden = false;
    track('newsletter_submit', {origin:form.closest('#exitPopup') ? 'popup' : 'page'});
    updateScroll();
  }));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || new URL(a.href).hostname !== 'prolon.it') return;
    track('affiliate_click', {affiliate:'prolon',position:a.closest('.hero') ? 'hero' : a.closest('header') ? 'header' : a.closest('.cta') ? 'cta_section' : 'other',link_url:a.href});
  });
  const firstQuestion = document.querySelector('#faq .faq-question');
  if (firstQuestion) toggleFAQ(firstQuestion);
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
      observer.unobserve(entry.target);
    }), {threshold:.1});
    document.querySelectorAll('.benefit-card,.feature,.ingredient-category,.stat').forEach(el => {
      el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease'; observer.observe(el);
    });
  }
  document.querySelectorAll('img[data-src]').forEach(img => {img.src = img.dataset.src;img.removeAttribute('data-src');});
  updateScroll();
});
