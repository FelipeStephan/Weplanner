import { Pencil, Globe, RotateCw } from 'lucide-react';

interface PromptWord {
  text: string;
  type: 'normal' | 'yellow' | 'pink' | 'green' | 'purple' | 'blue' | 'gray' | 'dashed';
}

interface PromptBuilderProps {
  words?: PromptWord[];
  suggestions?: Array<{ label: string; color: string }>;
}

export function PromptBuilder({ words, suggestions }: PromptBuilderProps) {
  const defaultWords: PromptWord[] = words || [
    { text: 'Generate a', type: 'normal' },
    { text: 'fish', type: 'yellow' },
    { text: 'listening to', type: 'normal' },
    { text: 'spotify', type: 'dashed' },
    { text: 'with', type: 'normal' },
    { text: 'headphones', type: 'dashed' },
    { text: 'Illustrated', type: 'blue' },
    { text: ',', type: 'normal' },
    { text: 'drawing', type: 'pink' },
    { text: ',', type: 'normal' },
    { text: 'children book', type: 'pink' },
    { text: ', draw with', type: 'normal' },
    { text: 'H2 Pencils', type: 'gray' },
    { text: 'HQ', type: 'green' },
    { text: '&', type: 'normal' },
    { text: 'messy', type: 'purple' },
  ];

  const defaultSuggestions = suggestions || [
    { label: 'Earphones', color: 'bg-[#dcfce7] text-[#019364]' },
    { label: 'Speakers', color: 'bg-[#fee2e2] text-[#f32c2c]' },
    { label: 'Airpods', color: 'bg-[#dcfce7] text-[#019364]' },
  ];

  const typeStyles: Record<string, string> = {
    normal: '',
    yellow: 'px-2 py-0.5 rounded-md bg-[#fef9c3] text-[#a16207] font-medium',
    pink: 'px-2 py-0.5 rounded-md bg-[#fce7f3] text-[#db2777] font-medium',
    green: 'px-2 py-0.5 rounded-md bg-[#dcfce7] text-[#019364] font-medium',
    purple: 'px-2 py-0.5 rounded-md bg-[#e9d5ff] text-[#7e22ce] font-medium',
    blue: 'px-2 py-0.5 rounded-md bg-[#dbeafe] text-[#2563eb] font-medium',
    gray: 'px-2 py-0.5 rounded-md bg-[#f5f5f5] text-[#525252] font-medium',
    dashed: 'px-2 py-0.5 rounded-md border border-dashed border-[#a3a3a3] text-[#525252] font-medium',
  };

  return (
    <div className="space-y-4">
      {/* Prompt Area */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-sm leading-relaxed mb-4">
          {defaultWords.map((word, i) => (
            <span key={i} className={typeStyles[word.type] || ''}>
              {word.text}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-xs font-medium text-[#525252] hover:bg-[#f5f5f5] transition-colors">
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-xs font-medium text-[#525252] hover:bg-[#f5f5f5] transition-colors">
            <Globe className="h-3 w-3" />
            Impact
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 px-1">
        {defaultSuggestions.map((s, i) => (
          <button
            key={i}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${s.color} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Regenerate */}
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#987dfe] text-white text-sm font-semibold hover:bg-[#7e22ce] transition-colors shadow-sm">
          <RotateCw className="h-4 w-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
