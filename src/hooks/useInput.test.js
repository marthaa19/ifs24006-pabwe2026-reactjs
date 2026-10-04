import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal bawaan", () => {
    const { result } = renderHook(() => useInput());

    expect(result.current[0]).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const { result } = renderHook(() => useInput("halo"));

    expect(result.current[0]).toBe("halo");
  });

  it("mengubah nilai lewat handleChange", () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      result.current[1]({ target: { value: "nilai baru" } });
    });

    expect(result.current[0]).toBe("nilai baru");
  });

  it("mengubah nilai lewat setValue", () => {
    const { result } = renderHook(() => useInput("lama"));

    act(() => {
      result.current[2]("diganti");
    });

    expect(result.current[0]).toBe("diganti");
  });
});