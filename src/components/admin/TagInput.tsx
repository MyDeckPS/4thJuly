
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags: string[];
  placeholder?: string;
  caseInsensitive?: boolean;
}

const TagInput = ({ 
  tags, 
  onTagsChange, 
  existingTags, 
  placeholder = "Add tags...",
  caseInsensitive = false
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeTag = (tag: string) => {
    return caseInsensitive ? tag.toLowerCase().trim() : tag.trim();
  };

  const findExistingTag = (tag: string) => {
    if (!caseInsensitive) return tag;
    
    const normalizedTag = normalizeTag(tag);
    return existingTags.find(existingTag => 
      normalizeTag(existingTag) === normalizedTag
    ) || tag;
  };

  useEffect(() => {
    if (inputValue.trim() && showSuggestions) {
      const normalizedInput = normalizeTag(inputValue);
      const filtered = existingTags.filter(tag => {
        const normalizedTag = normalizeTag(tag);
        const normalizedExistingTags = tags.map(normalizeTag);
        return normalizedTag.includes(normalizedInput) && 
               !normalizedExistingTags.includes(normalizedTag);
      });
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [inputValue, existingTags, tags, showSuggestions, caseInsensitive]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    const existingTag = findExistingTag(trimmedTag);
    const normalizedExisting = normalizeTag(existingTag);
    const normalizedTags = tags.map(normalizeTag);

    if (!normalizedTags.includes(normalizedExisting)) {
      onTagsChange([...tags, existingTag]);
    }
    
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:border-primary">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="w-3 h-3 cursor-pointer hover:text-destructive"
              onClick={() => removeTag(index)}
            />
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="border-none outline-none flex-1 min-w-[120px] shadow-none focus-visible:ring-0"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
