import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

export function TagInput({ tags, onTagsChange, placeholder, id }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTags = inputValue.split(',').map(tag => tag.trim()).filter(Boolean);
      let updatedTags = [...tags];
      newTags.forEach(newTag => {
          if (!updatedTags.includes(newTag)) {
              updatedTags.push(newTag);
          }
      });
      if (updatedTags.length !== tags.length) {
          onTagsChange(updatedTags);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-transparent focus-within:ring-1 focus-within:ring-ring transition-colors focus-within:border-transparent min-h-[40px] items-center">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
          {tag}
          <button type="button" onClick={() => removeTag(index)} className="hover:text-primary focus:outline-none flex items-center justify-center rounded-full transition-colors hover:bg-primary/20 p-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground w-full py-0.5 my-0.5"
        placeholder={placeholder || "Thêm thẻ (Enter hoặc phẩy)..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
