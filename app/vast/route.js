import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Error: ID iklan tidak disertakan.', { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/vast_ads?id=eq.${id}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      next: { revalidate: 0 } 
    });

    const data = await res.json();
    if (!data || data.length === 0) return new NextResponse('Not found', { status: 404 });
    const ad = data[0];

    // TEMPLATE XML MENIRU EXACTLY STRUKTUR EXOCLICK
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="7675374">
    <InLine>
      <AdSystem>Vidly88</AdSystem>
      <AdTitle/>
      <Impression id="exotr"><![CDATA[https://httpbin.org/status/200]]></Impression>
      
      <Error><![CDATA[https://httpbin.org/status/200]]></Error>
      
      <Creatives>
        <Creative sequence="1" id="117555238">
          <Linear skipoffset="00:00:00.0">
            <Duration>00:00:30.000</Duration>
            
            <TrackingEvents>
              <Tracking event="progress" offset="00:00:10.000"><![CDATA[https://httpbin.org/status/200]]></Tracking>
              <Tracking event="progress" offset="00:00:15.000"><![CDATA[https://httpbin.org/status/200]]></Tracking>
            </TrackingEvents>
            
            <VideoClicks>
              <ClickThrough><![CDATA[${ad.click_link}]]></ClickThrough>
            </VideoClicks>
            
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1280" height="720">
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
        'Cache-Control': 'no-store, max-age=0'
      },
    });

  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
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
