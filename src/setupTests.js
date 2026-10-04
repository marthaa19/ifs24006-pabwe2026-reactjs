import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

globalThis.URL.createObjectURL = vi.fn(() => "blob:pratinjau");

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});