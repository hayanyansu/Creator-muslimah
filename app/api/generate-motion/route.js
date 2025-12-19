import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { images, productName, script } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Generate motion prompts for each image using GPT
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Kamu adalah expert dalam membuat prompt untuk AI video generation dan image-to-video tools seperti Runway, Pika, atau Kling AI.
            
Tugas kamu adalah membuat motion prompt yang terstruktur dan saling terhubung untuk serangkaian gambar produk, agar bisa dijadikan video yang kohesif.

Format motion prompt yang baik:
- Deskripsi gerakan kamera (zoom in/out, pan left/right, dolly, etc)
- Deskripsi gerakan subjek (jika ada model)
- Durasi yang disarankan
- Transisi ke shot berikutnya

Semua prompt harus dalam Bahasa Inggris untuk kompatibilitas dengan AI tools.`
                    },
                    {
                        role: 'user',
                        content: `Buat motion prompt untuk ${images.length} gambar produk "${productName}" berikut:

${images.map((img, i) => `Gambar ${i + 1} (${img.type}): ${img.description}`).join('\n\n')}

Script narasi yang akan digunakan:
${script}

Berikan response dalam format JSON array:
["motion prompt gambar 1", "motion prompt gambar 2", ...]

Motion prompts harus:
1. Terstruktur dan saling terhubung sebagai sequence
2. Timing sesuai dengan script narasi
3. Smooth transisi antar shot
4. Cocok untuk video marketing produk muslimah`
                    }
                ],
                max_tokens: 1500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Motion API Error:', data);
            return NextResponse.json({ error: data.error?.message || 'Motion generation failed' }, { status: 500 });
        }

        // Parse the JSON response
        let motionPrompts;
        try {
            const content = data.choices[0].message.content;
            // Extract JSON from markdown code block if present
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
            motionPrompts = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error('Parse error:', e);
            // Fallback to generic motion prompts
            motionPrompts = images.map((img, i) =>
                `Slow ${i % 2 === 0 ? 'zoom in' : 'pan right'} over ${(i + 1) * 3} seconds, smooth cinematic motion, ${i === 0 ? 'opening shot' : i === images.length - 1 ? 'closing shot with fade' : 'transition to next scene'}`
            );
        }

        return NextResponse.json({ motionPrompts });

    } catch (error) {
        console.error('Generate motion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
