async function checkImage(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`${url}: Status ${res.status}, Size ${(res.headers.get('content-length') / 1024 / 1024).toFixed(2)} MB, Type ${res.headers.get('content-type')}`);
    } catch (e) {
        console.error(`${url}: Failed - ${e.message}`);
    }
}

const urls = [
    "https://bjhuvekaehvyzzptszmq.supabase.co/storage/v1/object/public/products/DSC_9362.jpeg",
    "https://bjhuvekaehvyzzptszmq.supabase.co/storage/v1/object/public/products/DSC_9528.jpeg",
    "https://bjhuvekaehvyzzptszmq.supabase.co/storage/v1/object/public/products/img_1775741897055_qjd4jo.jpeg"
];

urls.forEach(checkImage);
