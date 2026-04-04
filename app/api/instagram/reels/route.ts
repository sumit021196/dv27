import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'Instagram Access Token not configured' }, { status: 500 });
  }

  try {
    // Official Instagram Basic Display API endpoint
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`;
    
    // Adding a timeout to prevent the entire request from hanging if Instagram is slow
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch from Instagram', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log('Instagram API Data:', JSON.stringify(data, null, 2));

    if (!data.data) {
      console.error('No data found in Instagram response');
      return NextResponse.json({ error: 'No media found', raw: data }, { status: 404 });
    }

    // Filter for VIDEOS (which includes Reels)
    const reels = data.data
      .filter((item: any) => item.media_type === 'VIDEO' || item.media_type === 'REELS')
      .map((item: any) => ({
        id: item.id,
        url: item.media_url,
        permalink: item.permalink,
        caption: item.caption,
        thumbnail: item.thumbnail_url || item.media_url
      }))
      .slice(0, 10); 

    console.log(`Found ${reels.length} reels`);

    return NextResponse.json({ reels });
  } catch (error) {
    console.error('Instagram Fetch Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
