(function attachStringExtensions() {
  if (typeof String.prototype.toTitle === 'function') return;

  String.prototype.toTitle = function () {
    const s = String(this).trim();
    if (!s) return '';

    const spaced = s
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return spaced
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };
})();
