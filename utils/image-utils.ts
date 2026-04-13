
/**
 * Robust image compression utility designed for multi-platform compatibility,
 * specifically addressing Safari/iPhone hangs and memory leaks.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Safari/iPhone Hard Limits: Avoid total pixel count exceeding a reasonable threshold
    // (Safari often crashes or silently fails if images are > 16.7M pixels)
    const MAX_PIXELS = 16000000; 

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Processing timed out. Safari might have paused the tab or the image is too large."));
        }, 45000); // 45s for high-res images

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            try {
                if ('decode' in img) {
                    await img.decode();
                }

                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 1. Check for Safari memory limit (total pixels)
                if (width * height > MAX_PIXELS) {
                    const ratio = Math.sqrt(MAX_PIXELS / (width * height));
                    width *= ratio;
                    height *= ratio;
                }

                // 2. Apply user-requested maxWidth
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
                    // CRITICAL: Clean up canvas memory immediately
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
                        reject(new Error("Safari Canvas failure: Image might be too large for GPU memory. Try a smaller file."));
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
