import { NextResponse } from 'next/server';
import { TARGET_TAG_PAGES } from '@/lib/seo-keywords';

export async function POST(req: Request) {
  try {
    const host = 'xpig.me';
    const key = '3a59df7b4c6e4e89b2518e0d4a9cfb12';
    const keyLocation = `https://${host}/${key}.txt`;

    let customUrls: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body.urls)) {
        customUrls = body.urls;
      }
    } catch {}

    const defaultUrls = [
      `https://${host}/`,
      `https://${host}/tags`,
      ...TARGET_TAG_PAGES.map((t) => `https://${host}/tag/${t.slug}`),
    ];

    const urlList = Array.from(new Set([...defaultUrls, ...customUrls]));

    const payload = {
      host,
      key,
      keyLocation,
      urlList,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submittedCount: urlList.length,
      urls: urlList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to submit IndexNow ping' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'IndexNow endpoint ready',
    key: '3a59df7b4c6e4e89b2518e0d4a9cfb12',
    documentation: 'Send POST with optional {"urls": ["https://xpig.me/..."]} to trigger instant indexing.',
  });
}
