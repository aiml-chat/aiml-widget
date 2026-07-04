/**
 * Minimal Markdown renderer — only what docs/chat responses need.
 * Handles: headings, bold, italic, inline code, code blocks,
 * links, unordered lists, ordered lists, paragraphs.
 */
export function renderMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${code.trimEnd()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Underscore emphasis only at word boundaries — snake_case identifiers (YOUR_WEBSITE_ID,
  // api_key) must render literally, matching CommonMark's no-intraword-underscore rule.
  html = html.replace(/(^|[\s(])__(?!\s)(.+?)__(?=$|[\s.,;:!?)])/gm, '$1<strong>$2</strong>');

  // Italic *text* or _text_
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/(^|[\s(])_(?!\s)([^_\n]+)_(?=$|[\s.,;:!?)])/gm, '$1<em>$2</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process line by line for lists and paragraphs
  const lines = html.split('\n');
  const result = [];
  let inUl = false, inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    const hMatch = line.match(/^(#{1,3}) (.+)/);
    if (hMatch) {
      closeList();
      const level = Math.min(hMatch[1].length + 2, 6);
      result.push(`<h${level}>${hMatch[2]}</h${level}>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*] (.+)/);
    if (ulMatch) {
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    closeList();

    if (line.trim() === '') {
      // blank line — paragraph break
      result.push('');
    } else {
      result.push(`<p>${line}</p>`);
    }
  }

  closeList();

  function closeList() {
    if (inUl) { result.push('</ul>'); inUl = false; }
    if (inOl) { result.push('</ol>'); inOl = false; }
  }

  return result
    .join('\n')
    .replace(/<\/p>\n<p>/g, '<br>')  // collapse adjacent paragraphs
    .replace(/\n{2,}/g, '\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
