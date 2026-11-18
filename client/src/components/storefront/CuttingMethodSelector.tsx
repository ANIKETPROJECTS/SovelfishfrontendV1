import { useId } from "react";
import { normalizeCuttingMethods } from "@shared/cuttingMethods";

interface CuttingMethodSelectorProps {
  methods: unknown;
  selectedMethods: string[];
  onChange: (methods: string[]) => void;
  title?: string;
  compact?: boolean;
  variant?: "default" | "product";
}

export function CuttingMethodSelector({
  methods,
  selectedMethods,
  onChange,
  title = "Choose cutting method",
  compact = false,
  variant = "default",
}: CuttingMethodSelectorProps) {
  const options = normalizeCuttingMethods(methods);
  const radioName = useId();
  const headingId = useId();
  const selectedMethod = selectedMethods.length === 1 && options.includes(selectedMethods[0])
    ? selectedMethods[0]
    : "";
  if (options.length === 0) return null;

  const optionChoices = options.map((method, index) => {
    const checked = selectedMethod === method;
    return (
      <label
        key={method}
        className={`flex min-h-12 min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-semibold transition-colors ${
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
          className="h-4 w-4 shrink-0 accent-[#C8651B]"
        />
        <span className="leading-snug">{method}</span>
      </label>
    );
  });

  if (variant === "product") {
    return (
      <div className="min-w-0 rounded-2xl bg-white p-4 sm:p-5">
        <div id={headingId} className="mb-1 text-lg font-bold text-[#542813] sm:text-xl">
          {title} <span className="text-[#C8651B]" aria-hidden="true">*</span>
        </div>
        <p className="mb-4 text-sm text-[#80634e]">Select one option.</p>
        <fieldset
          aria-required="true"
          aria-labelledby={headingId}
          className="m-0 min-w-0 border-0 p-0"
        >
          <legend className="sr-only">{title} required</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{optionChoices}</div>
        </fieldset>
      </div>
    );
  }

  return (
    <fieldset
      aria-required="true"
      className={compact ? "min-w-0" : "rounded-xl border border-border/50 bg-white p-4"}
    >
      <legend className={compact ? "sr-only" : "px-1 text-sm font-semibold text-foreground"}>
        {title} <span className="text-[#C8651B]" aria-hidden="true">*</span>
        <span className="sr-only"> required</span>
      </legend>
      {!compact && <p className="mb-3 text-xs text-muted-foreground">Select one option.</p>}
      <div className={compact ? "mt-2 flex flex-wrap gap-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        {optionChoices}
      </div>
    </fieldset>
  );
}
