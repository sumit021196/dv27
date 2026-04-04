const token = 'IGAANmI5Vqt4lBZAGJkUnFZAZAVpLOTRvZAlA1dTcyRWtrTWtqX3VERHNzeTV5aWJZAWTRPSzdrNnJjazV6ZA25lMm0yMGh2dUdWMkNxREc4ZADR4Tk9fcVVwZAE5MY2lDajZAEampRLXl4QWJVYldMWGFYbDJaSW5rWmNPVVd1R09KY19VMAZDZD';

async function test() {
  const meUrl = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${token}`;
  const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`;
  try {
    const meRes = await fetch(meUrl);
    const meData = await meRes.json();
    console.log('Account Info:', JSON.stringify(meData, null, 2));

    const response = await fetch(mediaUrl);
    const data = await response.json();
    console.log('API Status:', response.status);
    console.log('Media Counts:', data.data?.length || 0);
    if (data.data) {
        console.log('First Media Type:', data.data[0]?.media_type);
        console.log('Video Count:', data.data.filter(m => m.media_type === 'VIDEO').length);
        console.log('Video Permalinks:', data.data.filter(m => m.media_type === 'VIDEO').map(m => m.permalink));
    } else {
        console.log('Error Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
