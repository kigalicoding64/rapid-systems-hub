import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/site/FieldError";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ChoiceCards<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string; description?: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div role="radiogroup" aria-label={name} className={cn("grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-primary bg-accent/50 ring-1 ring-primary" : "hover:border-primary/40",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border",
                  active ? "border-primary" : "border-input",
                )}
                aria-hidden="true"
              >
                {active && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              {o.label}
            </span>
            {o.description && <span className="mt-1.5 block pl-6 text-xs text-muted-foreground">{o.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
