"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginContent } from "../content";

const INPUT_CLASS =
  "auth-input h-11 rounded-xl border py-0 pr-11 pl-3.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

type PasswordFieldProps = {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  tabIndex?: number;
};

export function PasswordField({
  id,
  name,
  autoComplete,
  placeholder,
  value,
  onChange,
  visible,
  onVisibleChange,
  tabIndex,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        tabIndex={tabIndex}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
      <button
        type="button"
        tabIndex={tabIndex}
        aria-label={
          visible
            ? loginContent.auth.hidePassword
            : loginContent.auth.showPassword
        }
        aria-pressed={visible}
        onClick={() => onVisibleChange(!visible)}
        className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-(--auth-soft) transition-colors hover:bg-(--auth-muted) hover:text-(--auth-ink)"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
