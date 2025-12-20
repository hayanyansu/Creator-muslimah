import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { productDescription, productName, designStyle } = await request.json();

        // Perplexity doesn't have image generation
        // Return image prompts that user can copy to other AI image generators

        const styleModifiers = {
            elegant: 'soft pastel colors, elegant feminine aesthetic, delicate lighting, instagram-worthy, luxury feel',
            modern: 'clean minimalist design, modern aesthetic, neutral tones with subtle color accents, contemporary style',
            bold: 'vibrant colors, bold contrast, eye-catching dynamic composition, energetic mood, high impact'
        };
        const styleGuide = styleModifiers[designStyle] || styleModifiers.elegant;

        // Image prompts for DALL-E, Midjourney, or other AI image generators
        const imagePrompts = [
            {
                type: 'Dengan Model',
                description: `Professional product photography of ${productName}. A beautiful confident Indonesian muslim woman wearing elegant hijab, holding and showcasing the product: ${productDescription}. ${styleGuide}, professional studio lighting, high-end fashion photography style, 4K quality, photorealistic`,
                url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent('Dengan Model 1')}`
            },
            {
                type: 'Dengan Model',
                description: `Lifestyle product shot of ${productName}. Young modern Indonesian muslimah in casual hijab style, naturally using the product: ${productDescription} in a cozy home setting. ${styleGuide}, warm natural lighting, Instagram aesthetic, candid feel`,
                url: `https://placehold.co/1024x1024/7B9B9B/ffffff?text=${encodeURIComponent('Dengan Model 2')}`
            },
            {
                type: 'Product Shot',
                description: `Clean product photography of ${productName}. ${productDescription}. Isolated product shot on clean white background, ${styleGuide}, professional commercial photography, perfect lighting, high detail`,
                url: `https://placehold.co/1024x1024/9B9B7B/ffffff?text=${encodeURIComponent('Product Shot')}`
            },
            {
                type: 'Flat Lay',
                description: `Aesthetic flat lay photography of ${productName}. ${productDescription} arranged beautifully with complementary props like flowers, fabric, or accessories. ${styleGuide}, top-down view, Instagram-worthy composition`,
                url: `https://placehold.co/1024x1024/7B7B9B/ffffff?text=${encodeURIComponent('Flat Lay')}`
            }
        ];

        return NextResponse.json({ images: imagePrompts });

    } catch (error) {
        console.error('Generate images error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
