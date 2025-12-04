import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for SEO-friendly article URLs
// Generate URL-friendly slug from article title
export function createArticleSlug(title: string, id: string | number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .substring(0, 60); // Limit length
  
  // Use double underscore as separator to distinguish from hyphens in UUIDs
  return `${slug}__${id}`;
}

// Extract ID from slug (gets the part after the double underscore separator)
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('__');
  return parts[parts.length - 1];
}

