// Vercel Edge Function - هذا بروكسي سريع جداً وخاص بموقعك
export const config = {
  runtime: 'edge',
};

// البروكسي عام، لذا يُسمح فقط بنطاقات البيانات التي يستهلكها الموقع.
// بدون هذا القيد يتحول إلى مفتاح SSRF يقرأ أي عنوان يمرره أي زائر.
const ALLOWED_HOSTS = ['kick.com', 'www.kick.com', 'botrix.live', 'discord.com', 'www.discord.com'];

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return json({ error: 'Endpoint is required' }, 400);
  }

  let target: URL;
  try {
    target = new URL(endpoint);
  } catch {
    return json({ error: 'Invalid endpoint' }, 400);
  }

  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.includes(target.hostname)) {
    return json({ error: 'Endpoint not allowed' }, 403);
  }

  try {
    // الخادم الخاص بك (Vercel) هو من سيقوم بالطلب الآن وليس المتصفح
    const apiResponse = await fetch(target, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return json({ error: `Kick API request failed: ${errorText}` }, apiResponse.status);
    }

    const data = await apiResponse.json();

    // إرجاع البيانات الصافية للمتصفح مع تفعيل الكاش في سيرفرات Vercel
    return json(data, 200, { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' }); // كاش لمدة دقيقة

  } catch (error: any) {
    return json({ error: `Internal Server Error: ${error.message}` }, 500);
  }
}
