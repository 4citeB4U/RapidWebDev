/* Fixed vector icons: never depend on emoji fonts or encoded icon characters. */
(() => {
  const paths = {
    brain: '<path d="M12 5c-2-4-7-2-6 2-4 0-4 6-1 7-2 4 3 8 7 5V5Zm0 0c2-4 7-2 6 2 4 0 4 6 1 7 2 4-3 8-7 5M7 9l2 2-2 3m10-5-2 2 2 3"/>',
    book: '<path d="M12 5C8 2 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-2-10 1Zm0 0v15"/>',
    cube: '<path d="m12 2 10 6v9l-10 5-10-5V8l10-6Zm0 10L2 8m10 4 10-4M12 12v10"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 10c0 4 18 4 18 0M3 15c0 4 18 4 18 0"/>',
    chart: '<path d="M4 20v-6h3v6H4Zm7 0V8h3v12h-3Zm7 0V3h3v17h-3"/>',
    gear: '<path d="m9 3 1-2h4l1 2 2 1 3-1 2 4-2 2v3l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2V9L2 7l2-4 3 1 2-1Z"/><circle cx="12" cy="11" r="4"/>',
    file: '<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8M8 16h8"/>',
    folder: '<path d="M2 6h8l2 2h10v12H2V6Zm0 0V3h8l2 3"/>'
  };
  const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  const categories = {'cat::core':['book','Vision and intelligence'], 'cat::products':['cube','Solutions and built work'], 'cat::business':['chart','Business and client projects'], 'cat::professional':['gear','Experience and credentials'], 'cat::other':['database','Knowledge and context']};
  function decorate() {
    document.querySelectorAll('#nodes .node:not([data-vector-icon])').forEach(node => {
      node.dataset.vectorIcon = 'true';
      const category = categories[node.dataset.id];
      node.insertAdjacentHTML('afterbegin', icon(node.classList.contains('center') ? 'brain' : category?.[0] || 'file'));
      if (category) {
        const subtitle = node.querySelector('small');
        subtitle.textContent = `${category[1]} · ${subtitle.textContent}`;
      }
    });
    document.querySelectorAll('.fileGlyph:not([data-vector-icon])').forEach(node => {
      const folder = node.textContent.includes('▣');
      node.dataset.vectorIcon = 'true'; node.innerHTML = icon(folder ? 'folder' : 'file');
    });
  }
  new MutationObserver(decorate).observe(document.querySelector('#nodes'), {childList:true});
  new MutationObserver(decorate).observe(document.querySelector('#workspaceBody'), {childList:true,subtree:true});
  decorate();
  document.querySelectorAll('.brainMath').forEach((formula, index) => {
    formula.style.setProperty('--thought-duration', `${15 + Math.random() * 9}s`);
    formula.style.setProperty('--thought-delay', `${-index * 4.7}s`);
  });
})();
