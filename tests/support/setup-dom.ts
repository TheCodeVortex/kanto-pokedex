import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// next/image needs the Next.js image optimizer; a plain <img> keeps tests about our markup.
vi.mock("next/image", () => ({
  default: (
    props: ImgHTMLAttributes<HTMLImageElement> & { preload?: boolean; unoptimized?: boolean },
  ) => {
    // Drop the props that only mean something to next/image.
    const imgProps = { ...props };
    delete imgProps.preload;
    delete imgProps.unoptimized;
    return createElement("img", imgProps);
  },
}));

// next/font is compiled by Next.js at build time; tests only need the CSS variable names.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans", className: "geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono", className: "geist-mono" }),
}));
