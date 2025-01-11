import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const ComboBox = ({ list, subject, value, onChange, styles, others }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredItems, setFilteredItems] = useState(list.slice(0, 200));
  const scrollRef = useRef(null);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredItems(list.slice(0, 200));
    }
  }, [inputValue, list]);

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue === '') {
      setFilteredItems(list.slice(0, 200));
    } else {
      const newFilteredItems = list
        .filter(item => item && item.label && typeof item.label === 'string' && item.label.toLowerCase().includes(newInputValue.toLowerCase()))
        .slice(0, 200);
      setFilteredItems(newFilteredItems);
    }
  };

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += event.deltaY;
    }
  };

  const handleTouchMove = (event) => {
    if (scrollRef.current) {
      const touch = event.touches[0];
      const newY = touch.clientY;
      
      if (scrollRef.current.lastY) {
        scrollRef.current.scrollTop += scrollRef.current.lastY - newY;
      }
      
      scrollRef.current.lastY = newY;
    }
  };

  const handleTouchEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.lastY = null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !styles ? "bg-[#0e4028] border-2 border-[#0b864a] hover:bg-[#0e5a35]" : styles)}
        >
          <span className="truncate">{value ? list.find((item) => item.value === value)?.label : `Select ${subject}...`}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={handleInputChange}
            placeholder={`Select ${subject}...`}
          />
          <CommandList 
            onWheel={handleWheel} 
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={scrollRef}
          >
            <CommandEmpty>No {subject} found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.length > 0 ? (
                <>
                  {others && (
                    <CommandItem
                      className='cursor-pointer'
                      onSelect={() => {
                        others();
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      Others
                    </CommandItem>
                  )}
                  {filteredItems.map((item, index) => (
                    <CommandItem
                      className='cursor-pointer'
                      key={index}
                      value={item.value}
                      onSelect={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </>
              ) : (
                <CommandEmpty>No items found.</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;

