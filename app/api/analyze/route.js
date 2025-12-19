import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { imageBase64, productName, targetMarket, salesStyle, voiceTone } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Step 1: Analyze image and get product description using GPT-4 Vision
        const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Kamu adalah content creator expert untuk produk muslimah Indonesia. 
            Tugas kamu adalah menganalisis gambar produk dan membuat konten marketing yang menarik.
            Target market: ${targetMarket}
            Gaya penjualan: ${salesStyle}
            Nada suara: ${voiceTone}`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analisis gambar produk "${productName}" ini dan berikan response dalam format JSON:
{
  "productDescription": "deskripsi detail produk dalam 2-3 kalimat untuk prompt gambar AI",
  "caption": "caption Instagram menarik 3-5 paragraf sesuai gaya ${salesStyle} dan nada ${voiceTone}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "script": "script narasi video 30-60 detik dalam bahasa Indonesia, sesuai nada ${voiceTone}, untuk voice over"
}

Pastikan caption dan script sangat menarik, relate dengan target ${targetMarket}, dan menggunakan bahasa yang natural.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000
            })
        });

        const visionData = await visionResponse.json();

        if (!visionResponse.ok) {
            console.error('Vision API Error:', visionData);
            return NextResponse.json({ error: visionData.error?.message || 'Vision API failed' }, { status: 500 });
        }

        // Parse the JSON response
        let result;
        try {
            const content = visionData.choices[0].message.content;
            // Extract JSON from markdown code block if present
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
            result = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error('Parse error:', e);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analyze error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
