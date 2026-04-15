import { SUPABASE_URL, SUPABASE_KEY } from './supabase/client';

/**
 * Detects if the browser tab became hidden during an async operation.
 * Safari on iPhone suspends JS execution + network when app is backgrounded.
 */
const makeVisibilityChecker = () => {
    let hidden = false;
    const handler = () => { if (document.hidden) hidden = true; };
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handler);
    }
    return {
        wasHidden: () => hidden,
        cleanup: () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', handler);
            }
        }
    };
};

/**
 * Safari-safe: reads a File as a base64 data URL using FileReader.
 *
 * WHY NOT createObjectURL:
 * Safari's blob URL resolver (WebKit) gets stuck after the first product's
 * images are processed. `img.src = blob:` causes `img.onload` to NEVER fire
 * on the 2nd+ product — the network tab shows the blob: request stuck pending.
 *
 * FileReader.readAsDataURL() uses a completely different Safari code path
 * (base64 encode in a worker thread) and does NOT create a blob: URL,
 * so it never appears in the network tab and never gets stuck.
 */
function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') resolve(result);
            else reject(new Error('FileReader returned unexpected type'));
        };
        reader.onerror = () => reject(new Error('FileReader failed to load image'));
        reader.readAsDataURL(file);
    });
}

/**
 * Robust image compression utility.
 * Multi-platform safe — specifically fixes the Safari blob: URL hang
 * that occurs on 2nd+ product uploads.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
    if (typeof window === 'undefined') return file;

    // Convert HEIC/HEIF to JPEG first (iPhone camera format)
    const isHEIC = file.type === 'image/heic' || file.type === 'image/heif'
        || file.name.toLowerCase().endsWith('.heic')
        || file.name.toLowerCase().endsWith('.heif');

    if (isHEIC) {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality });
            const blobToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            file = new File(
                [blobToProcess],
                file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                { type: 'image/jpeg', lastModified: Date.now() }
            );
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            throw new Error('Failed to process HEIC image format.');
        }
    }

    if (!file.type.startsWith('image/')) return file;

    // Skip compression for small files (< 300KB) to avoid Safari canvas overhead
    if (file.size < 300 * 1024) {
        console.log(`[Compress] Skipping — file is ${Math.round(file.size / 1024)}KB (< 300KB)`);
        return file;
    }

    // Safari GPU memory limit: avoid images > 16.7M pixels
    const MAX_PIXELS = 16_000_000;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Image compression timed out. Please try a smaller image.'));
        }, 30_000);

        const img = new Image();

        img.onload = async () => {
            try {
                // img.decode() with timeout — prevents Safari from hanging on decode
                if ('decode' in img) {
                    await Promise.race([
                        img.decode(),
                        new Promise<void>((_, r) =>
                            setTimeout(() => r(new Error('decode timeout')), 3000)
                        )
                    ]).catch((e) => {
                        console.warn('[Compress] img.decode() timed out, continuing anyway:', e.message);
                    });
                }

                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                // Downscale if over Safari pixel limit
                if (width * height > MAX_PIXELS) {
                    const ratio = Math.sqrt(MAX_PIXELS / (width * height));
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                if (width > maxWidth) {
                    height = Math.floor((maxWidth / width) * height);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    canvas.width = 0;
                    canvas.height = 0;
                    clearTimeout(timeout);
                    throw new Error('Canvas context lost (Safari memory pressure?)');
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    // Immediately destroy the canvas to free GPU memory
                    canvas.width = 0;
                    canvas.height = 0;
                    clearTimeout(timeout);

                    // Release the data URL from img.src manually
                    img.src = '';

                    if (blob) {
                        resolve(new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                            { type: 'image/jpeg', lastModified: Date.now() }
                        ));
                    } else {
                        reject(new Error('Safari Canvas toBlob() returned null — image too large?'));
                    }
                }, 'image/jpeg', quality);

            } catch (err: any) {
                clearTimeout(timeout);
                img.src = '';
                reject(new Error(`Compression error: ${err.message}`));
            }
        };

        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load image for compression.'));
        };

        // KEY FIX: Use FileReader (base64 data URL) instead of createObjectURL.
        // This completely bypasses Safari's blob: URL resolver which gets stuck
        // on the 2nd+ product after the first batch of blob URLs is processed.
        readFileAsDataURL(file)
            .then((dataUrl) => { img.src = dataUrl; })
            .catch((e) => {
                clearTimeout(timeout);
                reject(e);
            });
    });
}

/**
 * Upload a file to Supabase Storage via direct REST fetch.
 * Safari-hardened:
 * - No duplex:'half' (unsupported in Safari — silently drops body)
 * - Uses ArrayBuffer (stable on iOS vs FormData)
 * - Wraps arrayBuffer() in a timeout (can hang under blob memory pressure)
 * - Page Visibility detection for tab-suspend error messages
 */
export async function uploadToSupabase(
    supabase: any,
    bucket: string,
    file: File,
    token?: string,
    folder: string = ''
): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const maxRetries = 3;
    let lastError: any = null;

    const visibility = makeVisibilityChecker();

    try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[Upload] Attempt ${attempt}/${maxRetries} → ${fileName}`);

                // Wrap arrayBuffer() in a timeout — can hang under Safari blob memory pressure
                const arrayBuffer = await Promise.race([
                    file.arrayBuffer(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error(
                            'File read timed out — Safari blob memory pressure. Try a smaller image.'
                        )), 15_000)
                    )
                ]);

                const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
                const activeToken = token || SUPABASE_KEY;

                // NOTE: No duplex:'half' — Safari silently drops the body with that option
                const fetchPromise = fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeToken}`,
                        'apikey': SUPABASE_KEY,
                        'Content-Type': file.type || 'application/octet-stream',
                        'x-upsert': 'false',
                    },
                    body: arrayBuffer,
                });

                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error(
                        visibility.wasHidden()
                            ? 'Upload paused: Safari suspended the tab. Keep the screen on during uploads.'
                            : 'Storage upload timed out after 60s.'
                    )), 60_000)
                );

                const response = await Promise.race([fetchPromise, timeoutPromise]);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                    console.error(`[Upload] API error (${response.status}):`, errData);
                    lastError = errData;
                    // Auth errors — don't retry, token is invalid
                    if (response.status === 401 || response.status === 403) break;
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
                console.log(`[Upload] Success → ${publicUrl}`);
                return publicUrl;

            } catch (err: any) {
                console.error(`[Upload] Exception (attempt ${attempt}):`, err.message);
                lastError = err;
                if (attempt === maxRetries) break;
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    } finally {
        visibility.cleanup();
    }

    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}
