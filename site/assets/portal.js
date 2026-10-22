// The big-screen note: shown on phones by CSS. Closing it is remembered in this browser only,
// and if storage is blocked the note simply shows again on the next visit.
(() => {
  const note = document.querySelector('[data-big-screen]');
  if (!note) return;
  const key = 'learn-all-big-screen-closed';
  let closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) { /* storage blocked: show the note */ }
  if (closed) note.hidden = true;
  note.querySelector('button').addEventListener('click', () => {
    note.hidden = true;
    try { localStorage.setItem(key, '1'); } catch (e) { /* not saved: the note returns next visit */ }
    // Keep keyboard focus on the page, since the button has just gone.
    document.querySelector('h1').focus({ preventScroll: true });
  });
})();
