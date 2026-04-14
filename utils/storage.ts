export function extractBucketAndPathFromUrl(url: string): { bucket: string; path: string } | null {
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return null;

    const storagePath = url.slice(markerIndex + marker.length);
    const [bucket, ...pathParts] = storagePath.split("/");
    const path = pathParts.join("/");
    if (!bucket || !path) return null;

    return { bucket, path };
}
