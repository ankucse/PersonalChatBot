import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

const extractCodeString = (content) => {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(item => (typeof item === 'string' ? item : '')).join('');
  }
  return '';
};

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span> Code
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs md:text-sm font-mono text-slate-200 overflow-x-auto selection:bg-brand-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg md:text-xl font-bold text-slate-850 dark:text-slate-100 mt-3 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base md:text-lg font-semibold text-brand-600 dark:text-brand-300 mt-2 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-2 text-slate-700 dark:text-slate-300 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-2 text-slate-700 dark:text-slate-300 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-slate-700 dark:text-slate-300">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-950/20 px-4 py-2.5 rounded-r-lg my-3 text-slate-700 dark:text-slate-300 italic text-sm">
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children, ...props }) => {
    const codeString = extractCodeString(children).replace(/\n$/, '');
    if (inline) {
      return (
        <code className={`px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 dark:bg-slate-800 dark:text-brand-300 font-mono text-xs md:text-sm border border-slate-200 dark:border-slate-700/60 ${className || ''}`} {...props}>
          {children}
        </code>
      );
    }
    return <CodeBlock code={codeString} />;
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-slate-100 dark:bg-slate-900/80 px-3.5 py-2 text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-sm">
      {children}
    </td>
  ),
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-3">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
