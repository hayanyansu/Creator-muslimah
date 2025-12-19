'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    productName: '',
    targetMarket: '',
    salesStyle: '',
    voiceTone: '',
    designStyle: 'elegant'
  });
  const [productImage, setProductImage] = useState(null);
  const [productImageBase64, setProductImageBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState(null);
  const [toast, setToast] = useState('');
  const [puterReady, setPuterReady] = useState(false);
  const fileInputRef = useRef(null);

  const targetMarketOptions = [
    'Remaja Muslimah 15-25',
    'Wanita Karir 25-35',
    'Ibu Rumah Tangga 25-45',
    'Mahasiswi',
    'Muslimah Premium 30+'
  ];

  const salesStyleOptions = [
    'Soft Selling',
    'Hard Selling',
    'Storytelling',
    'Edukatif',
    'FOMO'
  ];

  const voiceToneOptions = [
    'Ramah & Hangat',
    'Profesional',
    'Islami Lembut',
    'Energik',
    'Santai & Casual'
  ];

  const designStyleOptions = [
    { value: 'elegant', label: 'Elegant Feminine' },
    { value: 'modern', label: 'Modern Minimalis' },
    { value: 'bold', label: 'Bold Vibrant' }
  ];

  // Load Puter.js
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = () => {
        setPuterReady(true);
        console.log('Puter.js loaded successfully');
      };
      document.head.appendChild(script);
    } else if (window.puter) {
      setPuterReady(true);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProductImage(e.target.result);
      setProductImageBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, designStyle: value }));
    document.documentElement.setAttribute('data-theme', value);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Berhasil disalin! ✓');
  };

  const handleGenerate = async () => {
    if (!productImage || !formData.productName || !formData.targetMarket || !formData.salesStyle || !formData.voiceTone) {
      showToast('Mohon lengkapi semua field!');
      return;
    }

    if (!puterReady || !window.puter) {
      showToast('Puter.js belum siap, tunggu sebentar...');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Step 1: Analyze image and generate caption, hashtags, script using Puter.js
      setLoadingStep('Menganalisis produk & membuat caption...');

      const analyzePrompt = `Kamu adalah content creator expert untuk produk muslimah Indonesia.
Target market: ${formData.targetMarket}
Gaya penjualan: ${formData.salesStyle}
Nada suara: ${formData.voiceTone}

Analisis produk "${formData.productName}" dan berikan response dalam format JSON (HANYA JSON, tanpa text lain):
{
  "productDescription": "deskripsi detail produk dalam 2-3 kalimat untuk prompt gambar AI",
  "caption": "caption Instagram menarik 3-5 paragraf sesuai gaya ${formData.salesStyle} dan nada ${formData.voiceTone}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "script": "script narasi video 30-60 detik dalam bahasa Indonesia, sesuai nada ${formData.voiceTone}, untuk voice over"
}`;

      const analyzeResponse = await window.puter.ai.chat(analyzePrompt, productImageBase64, { model: 'gpt-4o' });

      let analyzeData;
      try {
        const jsonMatch = analyzeResponse.match(/\{[\s\S]*\}/);
        analyzeData = JSON.parse(jsonMatch ? jsonMatch[0] : analyzeResponse);
      } catch (e) {
        console.error('Parse error:', e);
        throw new Error('Gagal parse response AI');
      }

      // Step 2: Generate images using Puter.js DALL-E
      setLoadingStep('Membuat variasi gambar produk...');

      const styleModifiers = {
        elegant: 'soft pastel colors, elegant feminine aesthetic, delicate lighting, instagram-worthy',
        modern: 'clean minimalist design, modern aesthetic, neutral tones with subtle color accents',
        bold: 'vibrant colors, bold contrast, eye-catching dynamic composition, energetic mood'
      };
      const styleGuide = styleModifiers[formData.designStyle] || styleModifiers.elegant;

      const imagePrompts = [
        {
          type: 'Dengan Model',
          prompt: `Professional product photography of ${formData.productName}. A beautiful confident Indonesian muslim woman wearing elegant hijab, showcasing the product ${analyzeData.productDescription}. ${styleGuide}, professional studio lighting, high-end fashion photography style, 4K quality`
        },
        {
          type: 'Dengan Model',
          prompt: `Lifestyle product shot of ${formData.productName}. Young modern Indonesian muslimah in casual hijab style, naturally using the product ${analyzeData.productDescription} in a cozy home setting. ${styleGuide}, warm natural lighting, Instagram aesthetic`
        },
        {
          type: 'Product Shot',
          prompt: `Clean product photography of ${formData.productName}. ${analyzeData.productDescription}. Isolated product shot with beautiful ${styleGuide}, professional commercial photography, minimalist background`
        },
        {
          type: 'Flat Lay',
          prompt: `Aesthetic flat lay photography of ${formData.productName}. ${analyzeData.productDescription} arranged beautifully with complementary props. ${styleGuide}, top-down view, Instagram-worthy composition`
        }
      ];

      const generatedImages = [];
      for (let i = 0; i < imagePrompts.length; i++) {
        setLoadingStep(`Membuat gambar ${i + 1} dari ${imagePrompts.length}...`);
        try {
          const imgElement = await window.puter.ai.txt2img(imagePrompts[i].prompt, { model: 'dall-e-3' });
          generatedImages.push({
            type: imagePrompts[i].type,
            description: imagePrompts[i].prompt,
            url: imgElement.src
          });
        } catch (imgError) {
          console.error('Image generation error:', imgError);
          generatedImages.push({
            type: imagePrompts[i].type,
            description: imagePrompts[i].prompt,
            url: `https://placehold.co/1024x1024/9B7B9B/ffffff?text=${encodeURIComponent(imagePrompts[i].type)}`
          });
        }
      }

      // Step 3: Generate motion prompts
      setLoadingStep('Membuat prompt untuk motion...');

      const motionPrompt = `Buat motion prompt untuk ${generatedImages.length} gambar produk "${formData.productName}".
Gambar-gambar:
${generatedImages.map((img, i) => `${i + 1}. ${img.type}: ${img.description.substring(0, 100)}...`).join('\n')}

Berikan response dalam format JSON array (HANYA JSON):
["motion prompt gambar 1", "motion prompt gambar 2", "motion prompt gambar 3", "motion prompt gambar 4"]

Motion prompts harus dalam Bahasa Inggris, berisi deskripsi gerakan kamera (zoom, pan, dolly) dan timing.`;

      const motionResponse = await window.puter.ai.chat(motionPrompt, { model: 'gpt-4o-mini' });

      let motionPrompts;
      try {
        const jsonMatch = motionResponse.match(/\[[\s\S]*\]/);
        motionPrompts = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
      } catch (e) {
        motionPrompts = generatedImages.map((_, i) =>
          `Slow ${i % 2 === 0 ? 'zoom in' : 'pan right'} over ${(i + 1) * 3} seconds, cinematic motion`
        );
      }

      // Step 4: Generate voice over using Puter.js TTS
      setLoadingStep('Membuat voice over...');

      let audioUrl = '';
      try {
        const audioElement = await window.puter.ai.txt2speech(analyzeData.script, { model: 'tts-1' });
        audioUrl = audioElement.src;
      } catch (ttsError) {
        console.error('TTS error:', ttsError);
        audioUrl = '';
      }

      setResults({
        caption: analyzeData.caption,
        hashtags: analyzeData.hashtags,
        script: analyzeData.script,
        images: generatedImages.map((img, i) => ({
          ...img,
          motionPrompt: motionPrompts[i] || 'Slow zoom in, 3 seconds'
        })),
        audioUrl
      });

    } catch (error) {
      console.error('Error:', error);
      showToast('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const downloadAudio = () => {
    if (results?.audioUrl) {
      const link = document.createElement('a');
      link.href = results.audioUrl;
      link.download = `voiceover-${formData.productName}.mp3`;
      link.click();
    }
  };

  return (
    <>
      <header className="header">
        <h1>✨ Muslimah Content Creator</h1>
        <p>AI-Powered Content Generator untuk Affiliasi Produk Muslimah</p>
        <small style={{ opacity: 0.8, marginTop: '5px', display: 'block' }}>
          🆓 Powered by Puter.js - Gratis Tanpa API Key!
        </small>
      </header>

      <div className="container">
        <div className="main-layout">
          {/* Left Panel - Form Input */}
          <div>
            <div className="card">
              <h2 className="card-title"><span>🎨</span> Style Design</h2>
              <div className="form-group">
                <select
                  className="form-select"
                  name="designStyle"
                  value={formData.designStyle}
                  onChange={handleStyleChange}
                >
                  {designStyleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h2 className="card-title"><span>📸</span> Upload Gambar Produk</h2>
              <div
                className={`upload-area ${productImage ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {productImage ? (
                  <img src={productImage} alt="Product preview" className="upload-preview" />
                ) : (
                  <>
                    <div className="upload-icon">📷</div>
                    <p className="upload-text">
                      <strong>Klik untuk upload</strong> atau drag & drop
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="upload-input"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h2 className="card-title"><span>📝</span> Detail Produk</h2>

              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input
                  type="text"
                  className="form-input"
                  name="productName"
                  placeholder="Contoh: Hijab Voal Premium"
                  value={formData.productName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Market</label>
                <select
                  className="form-select"
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                >
                  <option value="">Pilih target market...</option>
                  {targetMarketOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gaya Penjualan</label>
                <select
                  className="form-select"
                  name="salesStyle"
                  value={formData.salesStyle}
                  onChange={handleInputChange}
                >
                  <option value="">Pilih gaya penjualan...</option>
                  {salesStyleOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nada Suara (Voice Over)</label>
                <select
                  className="form-select"
                  name="voiceTone"
                  value={formData.voiceTone}
                  onChange={handleInputChange}
                >
                  <option value="">Pilih nada suara...</option>
                  {voiceToneOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isLoading || !puterReady}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Generating...
                  </>
                ) : !puterReady ? (
                  <>Loading AI...</>
                ) : (
                  <>✨ Generate Content</>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div>
            {results && (
              <div className="card">
                <h2 className="card-title"><span>🎯</span> Hasil Generate</h2>

                {/* Caption */}
                <div className="result-block">
                  <div className="result-block-title">
                    📝 Caption
                    <button className="copy-btn" onClick={() => copyToClipboard(results.caption)}>
                      Copy
                    </button>
                  </div>
                  <p className="result-text">{results.caption}</p>
                </div>

                {/* Hashtags */}
                <div className="result-block">
                  <div className="result-block-title">
                    #️⃣ Hashtags
                    <button className="copy-btn" onClick={() => copyToClipboard(results.hashtags.map(h => '#' + h).join(' '))}>
                      Copy
                    </button>
                  </div>
                  <div className="hashtags">
                    {results.hashtags.map((tag, i) => (
                      <span key={i} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Generated Images */}
                <div className="result-block">
                  <div className="result-block-title">🖼️ Variasi Gambar</div>
                  <div className="image-grid">
                    {results.images.map((img, i) => (
                      <div key={i} className="image-item">
                        <img src={img.url} alt={img.description} />
                        <span className="image-badge">{img.type}</span>
                        <div className="motion-prompt">
                          <div className="motion-prompt-label">Motion Prompt:</div>
                          <div className="motion-prompt-text">{img.motionPrompt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Script Narration */}
                <div className="result-block">
                  <div className="result-block-title">
                    🎬 Script Narasi
                    <button className="copy-btn" onClick={() => copyToClipboard(results.script)}>
                      Copy
                    </button>
                  </div>
                  <div className="script-box">{results.script}</div>
                </div>

                {/* Voice Over */}
                {results.audioUrl && (
                  <div className="result-block">
                    <div className="result-block-title">🎙️ Voice Over</div>
                    <audio controls className="audio-player" src={results.audioUrl} />
                    <div className="audio-controls">
                      <button className="btn btn-download" onClick={downloadAudio}>
                        ⬇️ Download MP3
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!results && !isLoading && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 30px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🎨</div>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Hasil akan muncul di sini</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Upload gambar produk dan isi detail, lalu klik Generate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner-lg"></div>
            <p className="loading-text">{loadingStep}</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
