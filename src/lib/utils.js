import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names conditionally.
 * Combines clsx (conditional class names) with tailwind-merge (deduplication).
 * Used throughout ClubOS components for dynamic, conflict-free styling.
 *
 * @param {...(string|Object|Array)} inputs - Class name values to merge
 * @returns {string} Merged, deduplicated Tailwind class string
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-accent", "text-white")
 * // returns "px-4 py-2 bg-accent text-white" when isActive is true
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
