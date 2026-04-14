
/**
 * Robust image compression utility designed for multi-platform compatibility,
 * specifically addressing Safari/iPhone hangs during image processing.
 */
import heic2any from 'heic2any';

export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
    // Convert HEIC/HEIF to JPEG first
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
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

    return new Promise((resolve, reject) => {
        // 30s Safety Timeout to prevent UI from hanging on "Saving..." forever
        const timeout = setTimeout(() => {
            reject(new Error("Image processing timed out. The file might be too large or corrupted."));
        }, 30000);

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            try {
                // iPhone/Safari fix: Ensure image is internally decoded before drawing to canvas.
                // However, Safari often silently hangs indefinitely on `img.decode()` for WebP/AVIF images.
                // We race `img.decode()` against a 2-second timeout so it doesn't freeze the whole upload process.
                if ('decode' in img) {
                    try {
                        await Promise.race([
                            img.decode(),
                            new Promise((_, r) => setTimeout(() => r(new Error("decode timeout")), 2000))
                        ]);
                    } catch (decodeErr) {
                        console.warn("img.decode() timed out or failed, proceeding with fallback drawing", decodeErr);
                    }
                }

                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Only resize if width exceeds maxWidth
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.width > 0 && canvas.height > 0 ? canvas.getContext('2d') : null;

                if (!ctx) {
                    throw new Error("Could not initialize canvas context.");
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG for universal compatibility and predictable file size reduce
                canvas.toBlob((blob) => {
                    clearTimeout(timeout);
                    URL.revokeObjectURL(objectUrl);

                    // Explicitly free canvas memory to prevent iOS Safari crash
                    canvas.width = 0;
                    canvas.height = 0;

                    if (blob) {
                        // Create a new File object from the blob
                        // We replace the original extension with .jpg for storage consistency
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error("Image compression failed (Canvas to Blob)."));
                    }
                }, 'image/jpeg', quality);

            } catch (err: any) {
                clearTimeout(timeout);
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`Compression error: ${err.message}`));
            }
        };

        img.onerror = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image for processing. Ensure it's a valid image format (JPG, PNG, WebP, AVIF, HEIC)."));
        };

        // Trigger loading
        img.src = objectUrl;
    });
}

/**
 * Utility to upload a file to a specific Supabase bucket and return the public URL.
 */
export async function uploadToSupabase(
    supabase: any, 
    bucket: string, 
    file: File, 
    folder: string = ""
): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (uploadError) {
        throw new Error(`Upload to ${bucket} failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
}
