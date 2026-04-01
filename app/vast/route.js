import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Error: ID iklan tidak disertakan pada URL.', { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Error: Supabase URL atau Key belum disetting di Vercel.', { status: 500 });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/vast_ads?id=eq.${id}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      next: { revalidate: 0 } 
    });

    const data = await res.json();

    if (!data || data.length === 0) {
      return new NextResponse('Error: Iklan dengan ID tersebut tidak ditemukan.', { status: 404 });
    }

    const ad = data[0];

    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="${ad.id}">
    <InLine>
      <AdSystem>Vidly Ad Network</AdSystem>
      <AdTitle><![CDATA[${ad.title}]]></AdTitle>
      <Description><![CDATA[${ad.description || ''}]]></Description>
      <Impression id="vidly-track"><![CDATA[https://httpbin.org/status/200]]></Impression>
      <Creatives>
        <Creative sequence="1" id="kreatif-${ad.id}">
          <Linear skipoffset="00:00:05">
            <Duration>00:00:30</Duration>
            <VideoClicks>
              <ClickThrough><![CDATA[${ad.click_link}]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4">
                <![CDATA[${ad.video_url}]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

    return new NextResponse(xmlTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
