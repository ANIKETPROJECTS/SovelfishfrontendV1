import { useId } from "react";
import { normalizeCuttingMethods } from "@shared/cuttingMethods";

interface CuttingMethodSelectorProps {
  methods: unknown;
  selectedMethods: string[];
  onChange: (methods: string[]) => void;
  title?: string;
  compact?: boolean;
}

export function CuttingMethodSelector({
  methods,
  selectedMethods,
  onChange,
  title = "Choose cutting method",
  compact = false,
}: CuttingMethodSelectorProps) {
  const options = normalizeCuttingMethods(methods);
  const radioName = useId();
  const selectedMethod = selectedMethods.length === 1 && options.includes(selectedMethods[0])
    ? selectedMethods[0]
    : "";
  if (options.length === 0) return null;

  return (
    <fieldset
      aria-required="true"
      className={compact ? "min-w-0" : "rounded-xl border border-border/50 bg-white p-4"}
    >
      <legend className={compact ? "sr-only" : "px-1 text-sm font-semibold text-foreground"}>
        {title} <span className="text-[#C8651B]" aria-hidden="true">*</span>
        <span className="sr-only"> required</span>
      </legend>
      {!compact && (
        <p className="mb-3 text-xs text-muted-foreground">
          Select one option.
        </p>
      )}
      <div className={compact ? "mt-2 flex flex-wrap gap-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        {options.map((method, index) => {
          const checked = selectedMethod === method;
          return (
            <label
              key={method}
              className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                checked
                  ? "border-[#C8651B] bg-[#FFF5EB] text-[#7B3A14]"
                  : "border-border/50 bg-white text-foreground hover:border-[#E8883A]"
              }`}
            >
              <input
                type="radio"
                name={radioName}
                value={method}
                required={index === 0}
                checked={checked}
                onChange={() => onChange([method])}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#C8651B]"
              />
              <span className="leading-snug">{method}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
