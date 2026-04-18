import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { uploadToSupabase } from "../../utils/image-utils";

describe("image-utils", () => {
    describe("uploadToSupabase", () => {
        let originalFetch: typeof globalThis.fetch;

        beforeEach(() => {
            originalFetch = globalThis.fetch;
            process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy_key";
        });

        afterEach(() => {
            globalThis.fetch = originalFetch;
        });

        it("should return the public URL on success", async () => {
            const mockFile = new File(["dummy content"], "test.png", { type: "image/png" });
            const mockSupabase = {
                storage: {
                    from: (bucket: string) => ({
                        getPublicUrl: (path: string) => ({ data: { publicUrl: `http://public-url.com/${path}` } })
                    })
                }
            };

            globalThis.fetch = mock(async () => {
                return new Response(JSON.stringify({}), { status: 200, statusText: "OK" });
            });

            const result = await uploadToSupabase(mockSupabase, "test-bucket", mockFile, "token", "folder");
            expect(result).toMatch(/^http:\/\/public-url\.com\/folder\/\d+_[a-z0-9]+\.png$/);
        });

        it("should throw an error on failure", async () => {
            const mockFile = new File(["dummy content"], "test.png", { type: "image/png" });
            const mockSupabase = {};

            globalThis.fetch = mock(async () => {
                return new Response(JSON.stringify({ message: "Upload failed" }), { status: 400, statusText: "Bad Request" });
            });

            expect(uploadToSupabase(mockSupabase, "test-bucket", mockFile)).rejects.toThrow(/Upload to test-bucket failed/);
        });
    });
});
