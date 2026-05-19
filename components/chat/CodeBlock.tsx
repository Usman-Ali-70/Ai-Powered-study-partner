'use client';

import { useState, useMemo } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = useMemo(() => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback: auto-highlight or escape simple HTML
    try {
      return hljs.highlightAuto(code).value;
    } catch (e) {
      // Direct string fallback if highlightAuto fails
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <div className="code-block-lang">
          <Code2 size={12} />
          <span>{language || 'code'}</span>
        </div>
        <button onClick={handleCopy} className="code-block-copy" title="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-block-pre">
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
}
