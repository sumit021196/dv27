import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient(true);
        const buckets = ['products', 'categories', 'banners'];
        let allFiles: any[] = [];

        for (const bucketName of buckets) {
            const { data: files, error } = await supabase.storage
                .from(bucketName)
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                console.error(`Error listing files in bucket ${bucketName}:`, error);
                continue;
            }

            if (files) {
                const filesWithUrls = files.map(file => {
                    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(file.name);
                    return {
                        ...file,
                        bucket: bucketName,
                        publicUrl: urlData.publicUrl,
                        id: `${bucketName}/${file.name}`
                    };
                });
                allFiles = [...allFiles, ...filesWithUrls];
            }
        }

        // Sort all files by created_at desc
        allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ files: allFiles });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient(true);
        const { searchParams } = new URL(req.url);
        const bucket = searchParams.get('bucket');
        const fileName = searchParams.get('file');

        if (!bucket || !fileName) {
            return NextResponse.json({ error: "Bucket and file name are required" }, { status: 400 });
        }

        const { error } = await supabase.storage.from(bucket).remove([fileName]);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
