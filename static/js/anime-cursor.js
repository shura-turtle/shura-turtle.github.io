(() => {
  if (document.querySelector('.anime-cursor')) return;
  const fine = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sprite = document.createElement('div');
  sprite.className = 'anime-cursor';
  sprite.hidden = true;
  sprite.setAttribute('aria-hidden', 'true');
  sprite.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" shape-rendering=\"crispEdges\" fill=\"none\">\n<g transform=\"translate(7 6) scale(.8)\">\n<g class=\"chibi-hair\"><path fill=\"#203953\" d=\"M3 1h3v2h3v2h6V3h3V1h3v7h1v15h-5v-3H7v3H2V8h1z\"/>\n<path fill=\"#48b5e0\" d=\"M4 4h2v2h3V5h6v1h3V4h2v6h1v11h-3V11H6v10H3V10h1z\"/>\n<path fill=\"#f4b7ce\" d=\"M4 4h2v3H4zm14 0h2v3h-2z\"/></g>\n<path fill=\"#ffe5d6\" d=\"M6 9h12v9h-2v2H8v-2H6z\"/>\n<path fill=\"#90d4ec\" d=\"M6 7h12v5h-3V9h-2v4h-3v-3H8v3H6z\"/>\n<g class=\"chibi-eyes\"><path fill=\"#203953\" d=\"M8 13h2v4H8zm6 0h2v4h-2z\"/><path fill=\"#fff\" d=\"M8 13h1v1H8zm6 0h1v1h-1z\"/></g>\n<path fill=\"#ed9db8\" d=\"M6 17h2v1H6zm10 0h2v1h-2zm-5 1h2v1h-2z\"/>\n<path fill=\"#203953\" d=\"M8 20h8v2h2v4H6v-4h2z\"/><path fill=\"#dff6ff\" d=\"M8 21h8v3H8z\"/><path fill=\"#48b5e0\" d=\"M11 22h2v3h-2z\"/>\n<path fill=\"#203953\" d=\"M8 26h3v2H8zm5 0h3v2h-3z\"/>\n</g>\n<path fill=\"#f0fbff\" d=\"M0 0h4v2h2v2h2v2h2v2h2v2h2v4h-5v5H5v-5H3v2H0z\"/>\n<path fill=\"#203953\" d=\"M1 1h2v2h2v2h2v2h2v2h2v2h2v2H8v5H6v-6H4v1H3v2H1z\"/>\n<path fill=\"#48b5e0\" d=\"M3 5h2v2h2v2h2v2H6v3H5v-4H3z\"/>\n</svg>\n";
  document.body.append(sprite);
  let clickTimer = 0;
  function hide() {
    sprite.hidden = true;
    document.documentElement.classList.remove('anime-cursor-active');
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches) { hide(); return; }
    // One combined arrow + character graphic; the arrow tip is the hotspot (1, 1).
    sprite.style.transform = `translate3d(${event.clientX - 1}px, ${event.clientY - 1}px, 0)`;
    sprite.hidden = false;
    document.documentElement.classList.add('anime-cursor-active');
  }, {passive:true});
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || sprite.hidden) return;
    clearTimeout(clickTimer);
    sprite.classList.remove('is-clicking');
    void sprite.offsetWidth;
    sprite.classList.add('is-clicking');
    clickTimer = setTimeout(() => sprite.classList.remove('is-clicking'), 320);
  }, {passive:true});
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); });
  document.addEventListener('visibilitychange', hide);
  window.addEventListener('blur', hide);
  fine.addEventListener('change', hide);
  reduced.addEventListener('change', hide);
})();
