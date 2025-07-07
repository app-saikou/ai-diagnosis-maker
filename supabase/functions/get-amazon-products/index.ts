import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import OpenAI from 'npm:openai@4.28.0';

// Denoのネイティブ暗号化APIを使用
const encoder = new TextEncoder();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

// Amazon PA-API設定
const config = {
  accessKey: Deno.env.get('AMAZON_ACCESS_KEY') || '',
  secretKey: Deno.env.get('AMAZON_SECRET_KEY') || '',
  partnerTag: 'kony035-22',
  host: 'webservices.amazon.co.jp',
  region: 'us-west-2',
};

// OpenAI設定
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// HMAC-SHA256の計算
async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
}

// バッファをHex文字列に変換
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// SHA256ハッシュの計算
async function sha256(message: string): Promise<string> {
  const msgBuffer = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return bufferToHex(hashBuffer);
}

// AWSリクエスト署名v4の生成
async function generateSignature(
  method: string,
  path: string,
  payload: string,
  timestamp: string,
): Promise<string> {
  const algorithm = 'AWS4-HMAC-SHA256';
  const service = 'ProductAdvertisingAPI';
  const datetime = timestamp.replace(/[:-]|\.\d{3}/g, '');
  const date = datetime.substr(0, 8);

  // 正規リクエストの作成
  const canonicalRequest = [
    method,
    path,
    '', // クエリ文字列（空）
    `content-type:application/json; charset=utf-8\n` +
    `host:${config.host}\n` +
    `x-amz-date:${datetime}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`,
    '', // 署名済みヘッダー
    'content-type;host;x-amz-date;x-amz-target', // 署名対象ヘッダー
    await sha256(payload),
  ].join('\n');

  // 署名文字列の作成
  const stringToSign = [
    algorithm,
    datetime,
    `${date}/${config.region}/${service}/aws4_request`,
    await sha256(canonicalRequest),
  ].join('\n');

  // 署名キーの生成
  let signingKey = encoder.encode(`AWS4${config.secretKey}`);
  for (const msg of [date, config.region, service, 'aws4_request']) {
    signingKey = await hmacSha256(signingKey, msg);
  }

  // 最終署名の生成
  const signature = await hmacSha256(signingKey, stringToSign);
  return bufferToHex(signature);
}

// AIを使って検索キーワードを生成
async function generateSearchKeywords(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたはAmazonで商品を探すための検索キーワードを提案するアシスタントです。相談結果の内容から、関連する具体的な商品カテゴリーや商品名のキーワードを3つ程度提案してください。一般的で検索ヒット率の高いキーワードを選んでください。"
        },
        {
          role: "user",
          content: `以下の相談結果から、Amazonで検索するのに適切なキーワードを提案してください：\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const suggestedKeywords = completion.choices[0]?.message?.content || '';
    console.log('AI generated keywords:', suggestedKeywords);

    // キーワードを最適化（記号や不要な文字を削除）
    return suggestedKeywords
      .split(/[、,\n]/)
      .map(k => k.trim())
      .filter(k => k.length >= 2)
      .slice(0, 3)
      .join(' ');
  } catch (error) {
    console.error('Error generating keywords:', error);
    // エラー時は元のテキストから基本的なキーワード抽出を行う
    return text
      .split(/\s+/)
      .filter(k => k.length >= 2)
      .slice(0, 3)
      .join(' ');
  }
}

// 環境変数の検証
function validateConfig() {
  const requiredEnvVars = {
    'AMAZON_ACCESS_KEY': config.accessKey,
    'AMAZON_SECRET_KEY': config.secretKey,
    'OPENAI_API_KEY': Deno.env.get('OPENAI_API_KEY'),
  };

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

Deno.serve(async (req) => {
  // プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // 環境変数の検証
    validateConfig();

    const url = new URL(req.url);
    const keywords = url.searchParams.get('keywords');
    console.log('Received keywords:', keywords);

    if (!keywords) {
      return new Response(
        JSON.stringify({
          error: 'キーワードが指定されていません',
          items: []
        }),
        {
          status: 200,
          headers: corsHeaders
        }
      );
    }

    // AIを使って検索キーワードを生成
    const optimizedKeywords = await generateSearchKeywords(keywords);
    console.log('Optimized keywords:', optimizedKeywords);

    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({
      Keywords: optimizedKeywords,
      Resources: [
        'ItemInfo.Title',
        'Images.Primary.Medium',
        'Offers.Listings.Price',
        'DetailPageURL',
      ],
      PartnerTag: config.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.co.jp',
      ItemCount: 3,
      SearchIndex: 'All',
      MinReviewsCount: 3,
      SortBy: 'Relevance',
    });

    const signature = await generateSignature('POST', '/paapi5/searchitems', payload, timestamp);
    const datetime = timestamp.replace(/[:-]|\.\d{3}/g, '');

    console.log('Making request to Amazon API...');
    console.log('Request URL:', `https://${config.host}/paapi5/searchitems`);
    console.log('Request payload:', payload);

    const response = await fetch(`https://${config.host}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Date': datetime,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${datetime.substr(0, 8)}/${config.region}/ProductAdvertisingAPI/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=${signature}`,
        'Host': config.host,
      },
      body: payload,
    });

    console.log('Amazon API response status:', response.status);

    const responseText = await response.text();
    console.log('Amazon API raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse Amazon API response:', error);
      throw new Error('Amazon APIからの応答の解析に失敗しました');
    }

    if (!response.ok) {
      console.error('Amazon API error:', data);
      throw new Error(`Amazon API error: ${response.status} ${response.statusText}`);
    }

    if (!data.ItemsResult?.Items?.length) {
      console.log('No items found in response');
      return new Response(
        JSON.stringify({ items: [] }),
        {
          status: 200,
          headers: corsHeaders
        }
      );
    }

    const items = data.ItemsResult.Items.map((item: any) => ({
      title: item.ItemInfo?.Title?.DisplayValue || '商品名なし',
      image: item.Images?.Primary?.Medium?.URL || '',
      url: item.DetailPageURL || '',
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '価格情報なし',
    }));

    console.log('Processed items:', items);

    return new Response(
      JSON.stringify({ items }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Edge Function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || '商品の取得中にエラーが発生しました',
        items: []
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  }
});