
/**
 * Robust image compression utility designed for multi-platform compatibility,
 * specifically addressing Safari/iPhone hangs during image processing.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
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
                // This prevents silent hangs in Safari 14+ when handling high-res images or WebP/AVIF.
                if ('decode' in img) {
                    await img.decode();
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
