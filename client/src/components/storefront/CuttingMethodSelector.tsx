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
  if (options.length === 0) return null;

  const toggleMethod = (method: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedMethods, method]
        : selectedMethods.filter((selected) => selected !== method),
    );
  };

  return (
    <fieldset className={compact ? "min-w-0" : "rounded-xl border border-border/50 bg-white p-4"}>
      <legend className={compact ? "sr-only" : "px-1 text-sm font-semibold text-foreground"}>
        {title} (optional)
      </legend>
      {!compact && (
        <p className="mb-3 text-xs text-muted-foreground">
          Choose any options you’d like. You can also leave them unselected.
        </p>
      )}
      <div className={compact ? "mt-2 flex flex-wrap gap-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        {options.map((method) => {
          const checked = selectedMethods.includes(method);
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
                type="checkbox"
                checked={checked}
                onChange={(event) => toggleMethod(method, event.currentTarget.checked)}
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
