'use client';

import { useState, useRef } from 'react';

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

    setIsLoading(true);
    setResults(null);

    try {
      // Step 1: Analyze and generate caption, hashtags, script
      setLoadingStep('Menganalisis produk & membuat caption...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: productImageBase64,
          productName: formData.productName,
          targetMarket: formData.targetMarket,
          salesStyle: formData.salesStyle,
          voiceTone: formData.voiceTone
        })
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error);

      // Step 2: Generate image prompts
      setLoadingStep('Membuat prompt gambar...');
      const imagesRes = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDescription: analyzeData.productDescription,
          productName: formData.productName,
          designStyle: formData.designStyle
        })
      });
      const imagesData = await imagesRes.json();
      if (!imagesRes.ok) throw new Error(imagesData.error);

      // Step 3: Generate motion prompts
      setLoadingStep('Membuat prompt untuk motion...');
      const motionRes = await fetch('/api/generate-motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imagesData.images,
          productName: formData.productName,
          script: analyzeData.script
        })
      });
      const motionData = await motionRes.json();
      if (!motionRes.ok) throw new Error(motionData.error);

      setResults({
        caption: analyzeData.caption,
        hashtags: analyzeData.hashtags,
        script: analyzeData.script,
        images: imagesData.images.map((img, i) => ({
          ...img,
          motionPrompt: motionData.motionPrompts[i] || 'Slow zoom in, 3 seconds'
        })),
        audioUrl: '' // Perplexity doesn't have TTS
      });

    } catch (error) {
      console.error('Error:', error);
      showToast('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <>
      <header className="header">
        <h1>✨ Muslimah Content Creator</h1>
        <p>AI-Powered Content Generator untuk Affiliasi Produk Muslimah</p>
        <small style={{ opacity: 0.8, marginTop: '5px', display: 'block' }}>
          🔍 Powered by Perplexity AI (Sonar)
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Generating...
                  </>
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

                {/* Image Prompts */}
                <div className="result-block">
                  <div className="result-block-title">🖼️ Prompt Gambar AI</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    Copy prompt ini ke DALL-E, Midjourney, atau AI image generator lainnya
                  </p>
                  <div className="image-grid">
                    {results.images.map((img, i) => (
                      <div key={i} className="image-item" style={{ aspectRatio: 'auto', padding: '15px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>{img.type}</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
                          {img.description.length > 150 ? img.description.substring(0, 150) + '...' : img.description}
                        </p>
                        <button
                          className="copy-btn"
                          style={{ display: 'block', marginBottom: '10px' }}
                          onClick={() => copyToClipboard(img.description)}
                        >
                          📋 Copy Prompt
                        </button>
                        <div className="motion-prompt">
                          <div className="motion-prompt-label">Motion Prompt:</div>
                          <div className="motion-prompt-text">{img.motionPrompt}</div>
                          <button
                            className="copy-btn"
                            style={{ marginTop: '5px', fontSize: '0.7rem' }}
                            onClick={() => copyToClipboard(img.motionPrompt)}
                          >
                            Copy
                          </button>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                    💡 Gunakan script ini di ElevenLabs, Google TTS, atau tool voice AI lainnya untuk generate voice over
                  </p>
                </div>
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
