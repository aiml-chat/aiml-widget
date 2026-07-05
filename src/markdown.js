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

/**
 * Remove the inline [n] source markers the model emits (e.g. "… approved [1][2][3]."). The backend uses
 * them to build the Sources list shown beneath the answer, but in the visible text they're dead, unlinked,
 * and don't line up with the de-duplicated sources (so an answer can read "[3]" with a single source). We
 * hide them and let the Sources list carry attribution.
 *
 * Only strips a marker that isn't glued to a letter/digit, so genuine bracketed text — arr[3], [2024] —
 * survives (citations always follow a space or punctuation). The trailing-opener pass keeps a marker that
 * streams in split ("… [2" before its "]") from flashing on screen; on a complete buffer it's a no-op.
 */
export function stripCitations(text) {
  if (!text) return text;
  // 1–2 digits only: citations index the top-K retrieved chunks (K≈5), so real markers are [1]–[5].
  // Capping the width leaves longer bracketed numbers — years like [2024], refs like [12345] — untouched.
  return text
    .replace(/[ \t]*(?<![A-Za-z0-9])\[\d{1,2}\](?:[ \t]*\[\d{1,2}\])*/g, '')
    .replace(/[ \t]*(?<![A-Za-z0-9])\[\d{0,2}$/g, '');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
