import { describe, it, expect } from "vitest";
import { deepEqual } from "./util.js";

describe("deepEqual", () => {
  it("objects equal", () => {
    expect(deepEqual({ a: 1, b: { c: 42 } }, { a: 1, b: { c: 42 } })).toBeTruthy();
  });

  it("objects not equal", () => {
    expect(deepEqual({ a: 1, b: { c: 42 } }, { a: 1, b: { d: 42 } })).toBeFalsy();
  });

  it("objects with arrays equal", () => {
    expect(deepEqual({ a: 1, b: { c: [42, 43] } }, { a: 1, b: { c: [42, 43] } })).toBeTruthy();
  });

  it("objects with arrays not equal", () => {
    expect(deepEqual({ a: 1, b: { c: [42, 43] } }, { a: 1, b: { c: [43, 42] } })).toBeFalsy();
  });
});
