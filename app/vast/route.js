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

    // ROMBAKAN XML: ID dipalsukan jadi angka 1, ditambah resolusi, dan tracker diubah ke format gambar transparan.
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="1">
    <InLine>
      <AdSystem>Vidly88</AdSystem>
      <AdTitle><![CDATA[${ad.title}]]></AdTitle>
      <Description><![CDATA[${ad.description || 'Vidly Ad'}]]></Description>
      
      <Impression id="track">
        <![CDATA[https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif]]>
      </Impression>
      
      <Creatives>
        <Creative sequence="1" id="1">
          <Linear skipoffset="00:00:15">
            <Duration>00:00:30</Duration>
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

    // Menggunakan tipe data application/xml yang lebih diakui oleh player ketat
    return new NextResponse(xmlTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store, max-age=0' // Mencegah Vercel menyimpan cache versi lama
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
