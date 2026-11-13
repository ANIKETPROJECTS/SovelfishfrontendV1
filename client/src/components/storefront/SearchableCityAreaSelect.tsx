import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CityAreaOption } from "@shared/cityAreaPricing";

interface SearchableCityAreaSelectProps {
  id: string;
  value: string;
  options: readonly CityAreaOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  popoverClassName?: string;
  testId?: string;
}

export function SearchableCityAreaSelect({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Choose an area or city",
  searchPlaceholder = "Search area or city...",
  className,
  popoverClassName,
  testId,
}: SearchableCityAreaSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          data-testid={testId}
          className={cn(
            "w-full justify-between border-border bg-white px-3 text-left text-sm font-normal",
            className,
          )}
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption?.name ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        avoidCollisions={false}
        className={cn("w-[var(--radix-popover-trigger-width)] overflow-hidden p-0", popoverClassName)}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList
            className="max-h-[112px] overflow-y-scroll overflow-x-hidden [scrollbar-color:#C8651B_#F3F4F6] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8651B] [&::-webkit-scrollbar-track]:bg-[#F3F4F6]"
          >
            <CommandEmpty>No areas found.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.id ?? option.name}
                value={option.name}
                onSelect={() => {
                  onValueChange(option.name);
                  setOpen(false);
                }}
                className="min-h-9"
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selectedOption?.name === option.name ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{option.name}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
