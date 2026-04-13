
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
        // Safari iOS 16/17 Fix: Adding crossOrigin anonymous helps WebKit safely process blobs
        img.crossOrigin = "anonymous";

        // Use FileReader instead of URL.createObjectURL for better iOS compatibility
        // object URLs can sometimes hang or fail to resolve in background tabs/workers on iOS
        const reader = new FileReader();

        img.onload = async () => {
            try {
                // Wait a tiny bit on iOS to ensure image is ready in memory
                await new Promise(r => setTimeout(r, 100));

                // Remove img.decode() entirely. It's notoriously buggy on iOS Safari and causes
                // silent hangs on image processing, particularly with larger files or formats like WEBP.
                // The browser will synchronously decode when we call drawImage anyway.

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

                    // Deallocate canvas memory to prevent silent Out-Of-Memory crashes on iOS Safari
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
                reject(new Error(`Compression error: ${err.message}`));
            }
        };

        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load image for processing. Ensure it's a valid image format (JPG, PNG, WebP, AVIF, HEIC)."));
        };

        reader.onload = (e) => {
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                clearTimeout(timeout);
                reject(new Error("Failed to read image file."));
            }
        };

        reader.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to read file for processing."));
        };

        // Trigger loading
        reader.readAsDataURL(file);
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
