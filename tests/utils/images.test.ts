import { describe, it, expect } from "bun:test";
import { getOptimizedImageUrl, FALLBACK_IMG } from "../../utils/images";

describe("getOptimizedImageUrl", () => {
    it("returns FALLBACK_IMG when url is null or undefined", () => {
        expect(getOptimizedImageUrl(null)).toBe(FALLBACK_IMG);
        expect(getOptimizedImageUrl(undefined)).toBe(FALLBACK_IMG);
        expect(getOptimizedImageUrl("")).toBe(FALLBACK_IMG);
    });

    it("optimizes Cloudinary urls without optimization flags", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
        const expected = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg";
        expect(getOptimizedImageUrl(url)).toBe(expected);
    });

    it("does not alter Cloudinary urls that already have optimization flags", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg";
        expect(getOptimizedImageUrl(url)).toBe(url);
    });

    it("returns non-Cloudinary urls as-is", () => {
        const url = "https://example.com/image.jpg";
        expect(getOptimizedImageUrl(url)).toBe(url);
    });
});
