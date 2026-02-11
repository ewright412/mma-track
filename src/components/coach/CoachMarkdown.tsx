'use client';

import React from 'react';

interface CoachMarkdownProps {
  content: string;
}

export function CoachMarkdown({ content }: CoachMarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  function flushList() {
    if (listItems.length === 0) return;
    const items = listItems.map((item, i) => (
      <li key={i} className="ml-4">
        {renderInline(item)}
      </li>
    ));
    if (listType === 'ol') {
      elements.push(
        <ol key={key++} className="list-decimal pl-4 my-2 space-y-1">
          {items}
        </ol>
      );
    } else {
      elements.push(
        <ul key={key++} className="list-disc pl-4 my-2 space-y-1">
          {items}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-sm font-bold text-white mt-3 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-base font-bold text-white mt-3 mb-1">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-lg font-bold text-white mt-3 mb-1">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Bullet lists
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)/);
    if (numberedMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(numberedMatch[1]);
      continue;
    }

    flushList();

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={key++} />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="my-1">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className="text-sm leading-relaxed">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Split by bold (**text**) and italic (*text*) markers
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(
          <span key={idx++}>{processItalic(remaining.slice(0, boldMatch.index), idx)}</span>
        );
      }
      parts.push(
        <strong key={idx++} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // No more bold — process remaining for italic
    parts.push(<span key={idx++}>{processItalic(remaining, idx)}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function processItalic(text: string, startIdx: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = startIdx;

  while (remaining.length > 0) {
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.slice(0, italicMatch.index));
      }
      parts.push(
        <em key={idx++} className="italic text-gray-300">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
