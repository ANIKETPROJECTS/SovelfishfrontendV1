import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Fish, Scale } from "lucide-react";

type RequestFields = {
  fishName: string;
  quantity: string;
  unit: "kg" | "pieces";
  requiredDate: string;
};

type RequestErrors = Partial<Record<keyof RequestFields, string>>;

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function CustomFishRequest() {
  const [fields, setFields] = useState<RequestFields>({
    fishName: "",
    quantity: "",
    unit: "kg",
    requiredDate: "",
  });
  const [errors, setErrors] = useState<RequestErrors>({});
  const [preview, setPreview] = useState("");
  const today = getToday();

  const updateField = <K extends keyof RequestFields>(key: K, value: RequestFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setPreview("");
  };

  const handlePreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: RequestErrors = {};
    const fishName = fields.fishName.trim();
    const quantity = Number(fields.quantity);

    if (!fishName) nextErrors.fishName = "Enter the name of the fish you are looking for.";
    if (!fields.quantity) {
      nextErrors.quantity = "Enter a quantity greater than zero.";
    } else if (!Number.isFinite(quantity) || quantity <= 0) {
      nextErrors.quantity = "Quantity must be a number greater than zero.";
    } else if (fields.unit === "pieces" && !Number.isInteger(quantity)) {
      nextErrors.quantity = "Enter a whole number of pieces.";
    }
    if (!fields.requiredDate) {
      nextErrors.requiredDate = "Choose the date you need it by.";
    } else if (fields.requiredDate < today) {
      nextErrors.requiredDate = "Choose today or a future date.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setPreview("");
      return;
    }

    const readableDate = new Date(`${fields.requiredDate}T12:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setPreview(`${fishName} · ${Number(fields.quantity)} ${fields.unit} · needed by ${readableDate}`);
  };

  return (
    <section
      aria-labelledby="custom-fish-request-title"
      className="relative mb-8 overflow-hidden rounded-[1.5rem] border border-[#7B3A14]/20 bg-[#fffaf2]/95 px-5 py-6 shadow-[0_18px_40px_-30px_rgba(65,34,16,0.7)] sm:mb-10 sm:px-8 sm:py-8"
      data-testid="custom-fish-request"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border-[20px] border-[#F0A458]/15 sm:h-56 sm:w-56" aria-hidden="true" />
      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#7B3A14] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            <Fish className="h-3.5 w-3.5" aria-hidden="true" />
            Looking for something specific?
          </div>
          <h2
            id="custom-fish-request-title"
            className="max-w-lg font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-[#7B3A14] sm:text-3xl"
          >
            Tell us your catch.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#70513e] sm:text-base">
            Can&apos;t find the fish you want? Leave the details and see a preview of your request.
          </p>
          <p className="mt-5 flex items-start gap-2 text-xs font-medium leading-relaxed text-[#8B3A0F] sm:text-sm">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#C8651B]/35 text-[11px]" aria-hidden="true">i</span>
            Preview only — this form does not send or save a request.
          </p>
        </div>

        <form noValidate onSubmit={handlePreview} className="grid gap-4" aria-label="Custom fish request preview">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="custom-fish-name" className="mb-1.5 block text-sm font-semibold text-[#4f3021]">
                Fish name <span aria-hidden="true" className="text-[#C8651B]">*</span>
              </label>
              <input
                id="custom-fish-name"
                name="fishName"
                type="text"
                required
                autoComplete="off"
                value={fields.fishName}
                onChange={(event) => updateField("fishName", event.target.value)}
                aria-invalid={Boolean(errors.fishName)}
                aria-describedby={errors.fishName ? "custom-fish-name-error" : "custom-fish-name-hint"}
                placeholder="For example, tiger prawns"
                className="h-12 w-full rounded-xl border border-[#d9c4ae] bg-white px-4 text-sm text-[#4f3021] outline-none transition focus:border-[#C8651B] focus:ring-2 focus:ring-[#C8651B]/20 aria-[invalid=true]:border-[#a33325]"
              />
              <p id="custom-fish-name-hint" className="sr-only">Enter the fish or seafood name.</p>
              {errors.fishName && <p id="custom-fish-name-error" className="mt-1.5 text-xs font-medium text-[#a33325]" role="alert">{errors.fishName}</p>}
            </div>

            <div>
              <label htmlFor="custom-fish-quantity" className="mb-1.5 block text-sm font-semibold text-[#4f3021]">
                Quantity <span aria-hidden="true" className="text-[#C8651B]">*</span>
              </label>
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a16a43]" aria-hidden="true" />
                <input
                  id="custom-fish-quantity"
                  name="quantity"
                  type="number"
                  required
                  min="0.01"
                  step={fields.unit === "pieces" ? "1" : "any"}
                  inputMode="decimal"
                  value={fields.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                  aria-invalid={Boolean(errors.quantity)}
                  aria-describedby={errors.quantity ? "custom-fish-quantity-error" : undefined}
                  placeholder="e.g. 2"
                  className="h-12 w-full rounded-xl border border-[#d9c4ae] bg-white pl-10 pr-3 text-sm text-[#4f3021] outline-none transition focus:border-[#C8651B] focus:ring-2 focus:ring-[#C8651B]/20 aria-[invalid=true]:border-[#a33325]"
                />
              </div>
              {errors.quantity && <p id="custom-fish-quantity-error" className="mt-1.5 text-xs font-medium text-[#a33325]" role="alert">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="custom-fish-unit" className="mb-1.5 block text-sm font-semibold text-[#4f3021]">Unit</label>
              <select
                id="custom-fish-unit"
                name="unit"
                value={fields.unit}
                onChange={(event) => {
                  updateField("unit", event.target.value as RequestFields["unit"]);
                  setErrors((current) => ({ ...current, quantity: undefined }));
                }}
                className="h-12 w-full rounded-xl border border-[#d9c4ae] bg-white px-3.5 text-sm text-[#4f3021] outline-none transition focus:border-[#C8651B] focus:ring-2 focus:ring-[#C8651B]/20"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="custom-fish-date" className="mb-1.5 block text-sm font-semibold text-[#4f3021]">
                Required by <span aria-hidden="true" className="text-[#C8651B]">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a16a43]" aria-hidden="true" />
                <input
                  id="custom-fish-date"
                  name="requiredDate"
                  type="date"
                  required
                  min={today}
                  value={fields.requiredDate}
                  onChange={(event) => updateField("requiredDate", event.target.value)}
                  aria-invalid={Boolean(errors.requiredDate)}
                  aria-describedby={errors.requiredDate ? "custom-fish-date-error" : undefined}
                  className="h-12 w-full rounded-xl border border-[#d9c4ae] bg-white pl-10 pr-3 text-sm text-[#4f3021] outline-none transition focus:border-[#C8651B] focus:ring-2 focus:ring-[#C8651B]/20 aria-[invalid=true]:border-[#a33325]"
                />
              </div>
              {errors.requiredDate && <p id="custom-fish-date-error" className="mt-1.5 text-xs font-medium text-[#a33325]" role="alert">{errors.requiredDate}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C8651B] px-6 text-sm font-semibold text-white transition hover:bg-[#8B3A0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8651B] focus-visible:ring-offset-2 active:translate-y-px"
            >
              Preview request
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-xs leading-relaxed text-[#795f4d]">All fields marked * are required.</p>
          </div>
          <div aria-live="polite" aria-atomic="true">
            {preview && (
              <div className="rounded-xl border border-[#C8651B]/25 bg-[#fff3e5] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B3A0F]">Request preview</p>
                <p className="mt-1 text-sm font-semibold text-[#4f3021]">{preview}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#795f4d]">This is only a preview. Nothing has been sent or saved.</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
