import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { imageBase64, productName, targetMarket, salesStyle, voiceTone } = await request.json();

        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Grok API key not configured' }, { status: 500 });
        }

        // Prepare the prompt for Grok
        const systemPrompt = `Kamu adalah content creator expert untuk produk muslimah Indonesia. 
Tugas kamu adalah membuat konten marketing yang menarik.
Target market: ${targetMarket}
Gaya penjualan: ${salesStyle}
Nada suara: ${voiceTone}

PENTING: Berikan response dalam format JSON yang valid (HANYA JSON, tanpa text lain).`;

        const userPrompt = `Analisis produk "${productName}" dan berikan response dalam format JSON:
{
  "productDescription": "deskripsi detail produk dalam 2-3 kalimat untuk prompt gambar AI",
  "caption": "caption Instagram menarik 3-5 paragraf sesuai gaya ${salesStyle} dan nada ${voiceTone}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "script": "script narasi video 30-60 detik dalam bahasa Indonesia, sesuai nada ${voiceTone}, untuk voice over"
}

Pastikan caption dan script sangat menarik, relate dengan target ${targetMarket}, dan menggunakan bahasa yang natural.`;

        // Call Grok API
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Grok API Error:', data);
            return NextResponse.json({ error: data.error?.message || 'Grok API failed' }, { status: 500 });
        }

        // Parse the JSON response
        let result;
        try {
            const content = data.choices[0].message.content;
            // Extract JSON from markdown code block if present
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
            const jsonStr = jsonMatch[1] ? jsonMatch[1].trim() : content;
            // Try to find JSON object
            const objMatch = jsonStr.match(/\{[\s\S]*\}/);
            result = JSON.parse(objMatch ? objMatch[0] : jsonStr);
        } catch (e) {
            console.error('Parse error:', e);
            // Fallback response
            result = {
                productDescription: `${productName} - produk berkualitas untuk ${targetMarket}`,
                caption: `✨ ${productName} - Produk pilihan untuk ${targetMarket}! Dapatkan sekarang dengan harga spesial. 💕`,
                hashtags: ['muslimah', 'hijabstyle', productName.toLowerCase().replace(/\s+/g, ''), 'ootdmuslimah', 'affiliatemarketing'],
                script: `Hai ${targetMarket}! Kenalin nih, ${productName}. Produk yang wajib kamu punya. Yuk order sekarang!`
            };
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analyze error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
