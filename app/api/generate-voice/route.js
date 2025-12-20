import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Perplexity doesn't have TTS
        // Return empty audioUrl - voice generation is not available
        return NextResponse.json({
            audioUrl: '',
            message: 'Voice generation not available with Perplexity API. Use the script to generate voice with other TTS tools like ElevenLabs, Google TTS, or OpenAI TTS.'
        });

    } catch (error) {
        console.error('Generate voice error:', error);
        return NextResponse.json({ audioUrl: '', error: error.message });
    }
}
