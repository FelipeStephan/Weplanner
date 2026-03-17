export function getRichTextPlainText(value?: string) {
  if (!value) return '';

  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = value;
    return (container.textContent || container.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li|h1|h2|h3|h4|h5|h6)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isRichTextEmpty(value?: string) {
  return getRichTextPlainText(value).length === 0;
}

export function toDisplayRichTextHtml(value?: string) {
  if (!value) return '';

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (looksLikeHtml) {
    return value;
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
}
