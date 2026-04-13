export function getPathFromUrl(url: string, bucket: string): string | null {
    if (!url) return null;
    const marker = `storage/v1/object/public/${bucket}/`;
    if (!url.includes(marker)) return null;
    return url.split(marker)[1];
}
