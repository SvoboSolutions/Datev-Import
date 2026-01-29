import type { ButtonHTMLAttributes } from "react";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={`bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition ${
        props.className ?? ""
      }`}
    />
  );
}
