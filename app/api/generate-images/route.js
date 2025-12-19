import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { productDescription, productName, designStyle } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Define style modifiers based on design style
        const styleModifiers = {
            elegant: 'soft pastel colors, elegant feminine aesthetic, delicate lighting, instagram-worthy',
            modern: 'clean minimalist design, modern aesthetic, neutral tones with subtle color accents',
            bold: 'vibrant colors, bold contrast, eye-catching dynamic composition, energetic mood'
        };

        const styleGuide = styleModifiers[designStyle] || styleModifiers.elegant;

        // Generate 4 different image variations
        const imagePrompts = [
            {
                type: 'Dengan Model',
                prompt: `Professional product photography of ${productName}. A beautiful confident Indonesian muslim woman wearing elegant hijab, showcasing the product ${productDescription}. ${styleGuide}, professional studio lighting, high-end fashion photography style, 4K quality`
            },
            {
                type: 'Dengan Model',
                prompt: `Lifestyle product shot of ${productName}. Young modern Indonesian muslimah in casual hijab style, naturally using/wearing the product ${productDescription} in a cozy home setting. ${styleGuide}, warm natural lighting, Instagram aesthetic, genuine expression`
            },
            {
                type: 'Product Shot',
                prompt: `Clean product photography of ${productName}. ${productDescription}. Isolated product shot with beautiful ${styleGuide}, professional commercial photography, minimalist background, perfect lighting to highlight product details`
            },
            {
                type: 'Flat Lay',
                prompt: `Aesthetic flat lay photography of ${productName}. ${productDescription} arranged beautifully with complementary props like flowers, fabric, or accessories. ${styleGuide}, top-down view, Instagram-worthy composition, soft shadows`
            }
        ];

        const images = [];

        // Generate each image using DALL-E 3
        for (const imgPrompt of imagePrompts) {
            try {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'dall-e-3',
                        prompt: imgPrompt.prompt,
                        n: 1,
                        size: '1024x1024',
                        quality: 'standard'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('DALL-E Error:', data);
                    // Continue with placeholder if one image fails
                    images.push({
                        type: imgPrompt.type,
                        description: imgPrompt.prompt,
                        url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent(imgPrompt.type)}`
                    });
                    continue;
                }

                images.push({
                    type: imgPrompt.type,
                    description: imgPrompt.prompt,
                    url: data.data[0].url
                });

            } catch (error) {
                console.error('Image generation error:', error);
                images.push({
                    type: imgPrompt.type,
                    description: imgPrompt.prompt,
                    url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent(imgPrompt.type)}`
                });
            }
        }

        return NextResponse.json({ images });

    } catch (error) {
        console.error('Generate images error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
