import { describe, it, expect } from "bun:test";
import { cn } from "../../utils/cn";

describe("cn utility", () => {
    it("merges class names correctly", () => {
        expect(cn("a", "b")).toBe("a b");
        expect(cn("a", false && "b", "c")).toBe("a c");
    });

    it("handles tailwind class conflicts correctly", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
});
