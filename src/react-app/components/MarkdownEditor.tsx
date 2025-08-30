import { useRef } from "react";
import { Bold, Italic, Link2, Code, List, ListOrdered, Quote, Image } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
}

export default function MarkdownEditor({ value, onChange, preview }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatCommands = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: Link2, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![alt text](', ')') },
  ];

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer - in production, use a proper library like react-markdown
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="list-disc ml-6">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="list-decimal ml-6">$1</li>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 my-6">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 my-4">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-slate-900 my-3">$1</h3>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3">
        <div className="flex items-center space-x-2">
          {formatCommands.map((cmd, index) => (
            <button
              key={index}
              type="button"
              onClick={cmd.action}
              title={cmd.label}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            >
              <cmd.icon className="w-4 h-4" />
            </button>
          ))}
          
          <div className="w-px h-6 bg-slate-300 mx-2" />
          
          <div className="text-xs text-slate-500">
            Supports Markdown formatting
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="relative">
        {preview ? (
          <div className="p-6 min-h-[400px] prose prose-slate max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: value ? renderMarkdown(value) : '<p class="text-slate-500 italic">Nothing to preview yet. Start writing to see your content rendered.</p>' 
              }} 
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start writing your article... Use Markdown for formatting.

Example:
# This is a heading
## This is a subheading

**Bold text** and *italic text*

- Bullet point
- Another point

```
Code block
```

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)"
            className="w-full h-96 p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            
          />
        )}
      </div>

      {/* Footer with tips */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>📝 Use **bold**, *italic*, `code`</span>
            <span>🔗 [link text](url)</span>
            <span>📷 ![alt](image-url)</span>
          </div>
          <div>
            {value.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
