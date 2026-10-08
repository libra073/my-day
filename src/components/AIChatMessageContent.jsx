import React from 'react';

/**
 * Formats inline bold (**text**) safely into React nodes without dangerouslySetInnerHTML.
 */
function renderInlineFormatted(text) {
  if (!text) return null;
  // Match **bold** segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * AIChatMessageContent
 * Renders structured AI & user messages cleanly:
 * - Handles **bold text**
 * - Handles numbered lists (1. 2. 3.)
 * - Handles bullet lists (•, -, *)
 * - Guarantees overflow-wrap: anywhere and word-break: break-word
 * - Preserves spacing, line breaks, emojis, and Tanzanian currency strings
 */
export default function AIChatMessageContent({ text, isUser = false }) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        minWidth: 0,
        lineHeight: 1.6,
        fontSize: '0.92rem',
        color: isUser ? '#FFFFFF' : 'var(--color-text)',
      }}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line -> spacing
        if (!trimmed) {
          return <div key={idx} style={{ height: '0.25rem' }} />;
        }

        // Numbered list item: e.g. "1. " or "2. "
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.45rem',
                paddingLeft: '0.35rem',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: isUser ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-primary-hover)',
                  flexShrink: 0,
                  minWidth: '1.2rem',
                }}
              >
                {numMatch[1]}.
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                {renderInlineFormatted(numMatch[2])}
              </span>
            </div>
          );
        }

        // Bullet list item: e.g. "• ", "- ", "* "
        const bulletMatch = trimmed.match(/^([•\-*])\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                paddingLeft: '0.35rem',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  color: isUser ? '#F5A623' : 'var(--color-primary)',
                  fontWeight: 900,
                  flexShrink: 0,
                  lineHeight: 1.5,
                }}
              >
                •
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                {renderInlineFormatted(bulletMatch[2])}
              </span>
            </div>
          );
        }

        // Regular line with potential inline bold
        return (
          <div key={idx} style={{ minWidth: 0 }}>
            {renderInlineFormatted(line)}
          </div>
        );
      })}
    </div>
  );
}
