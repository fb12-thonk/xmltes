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

    // TEMPLATE XML FULL STANDAR GOOGLE IMA
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="${ad.id}">
    <InLine>
      <AdSystem>Vidly88 Ad Network</AdSystem>
      <AdTitle><![CDATA[${ad.title}]]></AdTitle>
      <Description><![CDATA[${ad.description || 'Vidly88 Advertisement'}]]></Description>
      
      <!-- Tracker Dummy (Wajib ada biar player gak ngira error) -->
      <Impression id="imp_track"><![CDATA[https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif]]></Impression>
      <Error><![CDATA[https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif]]></Error>
      
      <Creatives>
        <Creative sequence="1" id="creative_1">
          <!-- Tombol Skip Muncul Setelah 20 Detik -->
          <Linear skipoffset="00:00:20">
            
            <!-- Durasi dipatok 1 Jam biar skipoffset pasti jalan berapapun panjang videonya -->
            <Duration>01:00:00</Duration>
            
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif]]></Tracking>
            </TrackingEvents>
            
            <!-- Link Offer: Seluruh layar video otomatis bisa diklik -->
            <VideoClicks>
              <ClickThrough><![CDATA[${ad.click_link}]]></ClickThrough>
            </VideoClicks>
            
            <!-- File Video -->
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
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store, max-age=0' // Cegah Vercel ngasih data XML basi
      },
    });

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handler untuk preflight CORS request dari Video Player
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
