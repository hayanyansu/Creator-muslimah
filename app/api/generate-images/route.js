import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { productDescription, productName, designStyle } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Style modifiers based on design style
        const styleModifiers = {
            elegant: 'soft pastel colors, elegant feminine aesthetic, delicate lighting, instagram-worthy, luxury feel',
            modern: 'clean minimalist design, modern aesthetic, neutral tones with subtle color accents, contemporary style',
            bold: 'vibrant colors, bold contrast, eye-catching dynamic composition, energetic mood, high impact'
        };
        const styleGuide = styleModifiers[designStyle] || styleModifiers.elegant;

        // Image prompts for DALL-E 3
        const imageConfigs = [
            {
                type: 'Dengan Model',
                prompt: `Professional product photography of ${productName}. A beautiful confident Indonesian muslim woman wearing elegant hijab, holding and showcasing the product: ${productDescription}. ${styleGuide}, professional studio lighting, high-end fashion photography style, 4K quality, photorealistic`
            },
            {
                type: 'Dengan Model',
                prompt: `Lifestyle product shot of ${productName}. Young modern Indonesian muslimah in casual hijab style, naturally using the product: ${productDescription} in a cozy home setting. ${styleGuide}, warm natural lighting, Instagram aesthetic, candid feel`
            },
            {
                type: 'Product Shot',
                prompt: `Clean product photography of ${productName}. ${productDescription}. Isolated product shot on clean white background, ${styleGuide}, professional commercial photography, perfect lighting, high detail`
            },
            {
                type: 'Flat Lay',
                prompt: `Aesthetic flat lay photography of ${productName}. ${productDescription} arranged beautifully with complementary props like flowers, fabric, or accessories. ${styleGuide}, top-down view, Instagram-worthy composition`
            }
        ];

        const generatedImages = [];

        // Generate images with DALL-E 3
        for (let i = 0; i < imageConfigs.length; i++) {
            try {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'dall-e-3',
                        prompt: imageConfigs[i].prompt,
                        n: 1,
                        size: '1024x1024',
                        quality: 'standard',
                        response_format: 'url'
                    })
                });

                const data = await response.json();

                if (response.ok && data.data?.[0]?.url) {
                    generatedImages.push({
                        type: imageConfigs[i].type,
                        description: imageConfigs[i].prompt,
                        url: data.data[0].url
                    });
                } else {
                    console.error('DALL-E error:', data);
                    generatedImages.push({
                        type: imageConfigs[i].type,
                        description: imageConfigs[i].prompt,
                        url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent(imageConfigs[i].type)}`
                    });
                }
            } catch (imgError) {
                console.error('Image generation error:', imgError);
                generatedImages.push({
                    type: imageConfigs[i].type,
                    description: imageConfigs[i].prompt,
                    url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent(imageConfigs[i].type)}`
                });
            }
        }

        return NextResponse.json({ images: generatedImages });

    } catch (error) {
        console.error('Generate images error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
