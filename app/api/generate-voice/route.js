import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { script, voiceTone } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ audioUrl: '', error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Map voice tone to OpenAI TTS voice
        const voiceMap = {
            'Ramah & Hangat': 'nova',
            'Profesional': 'onyx',
            'Islami Lembut': 'shimmer',
            'Energik': 'alloy',
            'Santai & Casual': 'echo'
        };

        const voice = voiceMap[voiceTone] || 'nova';

        // Generate voice over using OpenAI TTS
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: script,
                voice: voice,
                response_format: 'mp3'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('TTS Error:', errorData);
            return NextResponse.json({ audioUrl: '', error: errorData.error?.message || 'TTS generation failed' });
        }

        // Get the audio as array buffer
        const audioBuffer = await response.arrayBuffer();

        // Convert to base64 data URL
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

        return NextResponse.json({ audioUrl });

    } catch (error) {
        console.error('Generate voice error:', error);
        return NextResponse.json({ audioUrl: '', error: error.message });
    }
}
