import { SUPABASE_URL, SUPABASE_KEY } from './supabase/client';

/**
 * Robust image compression utility designed for multi-platform compatibility,
 * specifically addressing Safari/iPhone hangs and memory leaks.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
    // Prevent SSR errors
    if (typeof window === 'undefined') return file;

    // Convert HEIC/HEIF to JPEG first
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
            // Dynamic import for browser-only package
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: quality
            });
            const blobToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            file = new File([blobToProcess], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } catch (error) {
            console.error("HEIC conversion failed:", error);
            throw new Error("Failed to process HEIC image format.");
        }
    }

    // Standard sanity check
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Safari/iPhone Hard Limits: Avoid total pixel count exceeding a reasonable threshold
    // (Safari often crashes or silently fails if images are > 16.7M pixels)
    const MAX_PIXELS = 16000000; 

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Processing timed out. Safari might have paused the tab or the image is too large."));
        }, 45000); 

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            try {
                if ('decode' in img) {
                    await Promise.race([
                        img.decode(),
                        new Promise((_, r) => setTimeout(() => r(new Error("decode timeout")), 2000))
                    ]);
                }
                
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width * height > MAX_PIXELS) {
                    const ratio = Math.sqrt(MAX_PIXELS / (width * height));
                    width *= ratio;
                    height *= ratio;
                }

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = Math.floor(width);
                canvas.height = Math.floor(height);
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    canvas.width = 0; canvas.height = 0;
                    throw new Error("Canvas context vanished (Safari memory pressure?)");
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    canvas.width = 0;
                    canvas.height = 0;
                    
                    clearTimeout(timeout);
                    URL.revokeObjectURL(objectUrl);

                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error("Safari Canvas failure: Image might be too large for GPU memory."));
                    }
                }, 'image/jpeg', quality);

            } catch (err: any) {
                clearTimeout(timeout);
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`Compression Error: ${err.message}`));
            }
        };

        img.onerror = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Invalid image format or load failure."));
        };

        img.src = objectUrl;
    });
}

/**
 * Utility to upload a file to a specific Supabase bucket and return the public URL.
 * Hardened with timeout and retry logic for Safari/iPhone reliability.
 */
export async function uploadToSupabase(
    supabase: any, 
    bucket: string, 
    file: File, 
    token?: string,
    folder: string = ""
): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Supabase Upload] Bypass Active - Attempt ${attempt}/${maxRetries} for ${fileName}`);
            
            // 1. Prepare raw data for Safari stability
            const arrayBuffer = await file.arrayBuffer();

            // 2. Construct direct REST URL
            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;

            // 3. Determine the Auth Token (Prefer passed token, fallback to anon key)
            const activeToken = token || SUPABASE_KEY;

            const fetchPromise = fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${activeToken}`,
                    'apikey': SUPABASE_KEY,
                    'Content-Type': file.type,
                    'x-upsert': 'false'
                },
                body: arrayBuffer,
                // @ts-ignore - Duplex is required for some modern fetch streams
                duplex: 'half'
            });

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Storage upload timed out after 60s")), 60000)
            );

            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                console.error(`[Supabase Upload] API Error:`, errorData);
                lastError = errorData;
                if (response.status === 403 || response.status === 401) break; 
                continue;
            }

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;

        } catch (err: any) {
            console.error(`[Supabase Upload] Fetch Exception:`, err.message);
            lastError = err;
            if (attempt === maxRetries) break;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }

    throw new Error(`Upload to ${bucket} failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown'}`);
}
