import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, RefreshCw, Palette, Image as ImageIcon, 
  Sparkles, X, CheckCircle2, Zap, Wand2, Shield, Lock, 
  Clock, ArrowRight, Star, UploadCloud, ChevronDown
} from 'lucide-react';

const COLORS = [
  { id: 'transparent', label: 'Transparent', value: 'transparent' },
  { id: 'white', label: 'White', value: '#FFFFFF' },
  { id: 'black', label: 'Black', value: '#000000' },
  { id: 'red', label: 'Red', value: '#EF4444' },
  { id: 'blue', label: 'Blue', value: '#3B82F6' },
  { id: 'green', label: 'Green', value: '#10B981' },
];

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const [bgColor, setBgColor] = useState('transparent');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'privacy' | 'terms' | 'contact'>('home');

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setBgColor('transparent');
    setProgress(0);
    setStatusText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusText('Processing image precisely...');

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const formData = new FormData();
      formData.append('image_file', file);
      if (bgColor !== 'transparent') {
        formData.append('bg_color', bgColor);
      }

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to process image');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setResultUrl(objectUrl);
      setStatusText('Background removed successfully!');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetAll = () => {
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setErrorMessage(null);
    setStatusText('');
    setProgress(0);
    setBgColor('transparent');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Scroll to results when processing is done
    if (resultUrl) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop, behavior: 'smooth' });
    }
  }, [resultUrl]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { resetAll(); setCurrentView('home'); }}>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 hidden sm:block">
              AI Background Remover
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setCurrentView('contact')} className="text-slate-600 hover:text-indigo-600 font-medium">Contact</button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16">
        {currentView === 'home' ? (
          <>
            {/* HERO SECTION */}
        <section className="px-4 py-16 md:py-24 max-w-7xl mx-auto text-center" id="hero">
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Remove Backgrounds Instantly <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                with AI
              </span>
            </h1>
            <p className="text-[16px] md:text-[18px] text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Upload any image and get a transparent background in seconds. Free, fast and secure.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Forever
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <ImageIcon className="w-4 h-4 text-emerald-500" /> HD Quality
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Lock className="w-4 h-4 text-emerald-500" /> No Signup Required
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Shield className="w-4 h-4 text-emerald-500" /> Secure Processing
              </div>
            </div>
          </div>

          {/* UPLOAD ZONE */}
          <div 
            className={`max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-16 border-2 transition-all duration-300 ${isHovering ? 'border-indigo-500 bg-indigo-50/50 scale-105' : 'border-dashed border-slate-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!originalUrl && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-6 bg-indigo-50 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-[22px] md:text-[36px] font-bold text-slate-900 mb-4">Upload an image</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto text-[16px] md:text-[18px]">
                  Drag and drop your file here, or click the button below to browse your files.
                </p>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  onClick={triggerFileInput}
                  className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[16px] md:text-[18px] font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Upload className="w-6 h-6" />
                  Upload Image
                </button>
                <p className="mt-6 text-sm text-slate-400 font-medium">Supports JPG, PNG, WEBP</p>
              </div>
            )}

            {originalUrl && !resultUrl && (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-md bg-slate-100 flex items-center justify-center min-h-[300px]">
                  <img src={originalUrl} alt="Original uploaded image" className="max-w-full max-h-[400px] object-contain block" />
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 transition-all">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{statusText}</h3>
                      <div className="w-full max-w-xs bg-slate-200 h-2.5 rounded-full overflow-hidden mt-4">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-base font-medium max-w-md w-full text-center">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="animate-spin w-5 h-5" />
                    ) : (
                      <Wand2 className="w-5 h-5" />
                    )}
                    {isProcessing ? 'Processing...' : 'Remove Background'}
                  </button>
                  <button
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-50 text-lg font-bold rounded-xl shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* RESULTS VIEW */}
            {resultUrl && (
              <div id="results-section" className="flex flex-col animate-fade-in-up w-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[22px] md:text-[36px] font-bold text-slate-900">Your Result</h2>
                  <button onClick={resetAll} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload New
                  </button>
                </div>

                {/* Before / After Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 w-full">
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-semibold text-sm mb-3 uppercase tracking-wider">Original image</span>
                    <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner min-h-[300px] flex items-center justify-center p-2 relative">
                      <img src={originalUrl!} alt="Original" className="max-w-full max-h-[400px] object-contain block z-10" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-indigo-600 font-semibold text-sm mb-3 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Background Removed
                    </span>
                    <div 
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center p-2 relative checkerboard-bg"
                    >
                      <img src={resultUrl} alt="Result" className="max-w-full max-h-[400px] object-contain block z-10 drop-shadow-md" style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : 'transparent' }} />
                    </div>
                  </div>
                </div>

                {/* Actions & Customization */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between w-full">
                  <div className="flex-1 w-full flex flex-col">
                    <p className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-indigo-600" />
                      Add Background Color (Optional)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.id}
                          className={`w-12 h-12 rounded-full border-2 transition-all shadow-sm ${
                            bgColor === color.value 
                              ? 'border-indigo-600 scale-110 shadow-md ring-2 ring-indigo-200' 
                              : 'border-slate-300 hover:border-slate-400 border-dashed'
                          }`}
                          style={{
                            backgroundColor: color.value === 'transparent' ? '#f8fafc' : color.value,
                            backgroundImage: color.value === 'transparent' 
                              ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0)' 
                              : 'none',
                            backgroundSize: color.value === 'transparent' ? '12px 12px' : 'auto',
                            backgroundPosition: color.value === 'transparent' ? '0 0, 6px 6px' : '0% 0%'
                          }}
                          onClick={() => setBgColor(color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 w-full md:w-auto">
                    <button
                      onClick={handleDownload}
                      className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[16px] md:text-[18px] font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Download className="w-6 h-6" />
                      Download HD Image
                    </button>
                    {bgColor !== 'transparent' && (
                      <button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="w-full md:w-auto px-6 py-3 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[16px] md:text-[18px] font-bold rounded-xl shadow-sm transition-all"
                      >
                        Apply Background Color
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[22px] md:text-[36px] font-bold text-slate-900 mb-6">How it works</h2>
            <p className="text-[16px] md:text-[18px] text-slate-600 max-w-2xl mx-auto">Skip the complicated photo editing software. Get perfect cutouts in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">Step 1: Upload Image</h3>
              <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">Simply drag and drop your photo into our tool, or browse your files to upload an image. We support JPG, PNG, and WebP.</p>
            </div>
            <div className="text-center flex flex-col items-center relative">
              <div className="hidden md:block absolute top-10 -right-5 transform translate-x-1/2 w-10 text-slate-300">
                 <ArrowRight />
              </div>
              <div className="hidden md:block absolute top-10 -left-5 transform -translate-x-1/2 w-10 text-slate-300">
                 <ArrowRight />
              </div>
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-200">
                <Wand2 className="w-8 h-8" />
              </div>
              <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">Step 2: AI Removes Background</h3>
              <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">Our advanced AI will automatically identify the subject and erase the background in just a few seconds with pixel-perfect accuracy.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">Step 3: Download Result</h3>
              <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed mb-6">Download your new transparent PNG immediately. You can even add a completely new solid color background if needed.</p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-medium shadow-xl">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="tracking-widest text-[18px]">𒆜 𝑴𝒓.𝑺𝒊𝒂𝒎 𒆜</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </section>
        </>
        ) : (
          <section className="px-4 py-16 md:py-24 max-w-4xl mx-auto">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
               {currentView === 'about' && (
                  <div>
                    <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-slate-900 mb-6">About Us</h1>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       We're a team of passionate developers and AI enthusiasts dedicated to making high-quality creative tools accessible to everyone. Our background remover uses state-of-the-art machine learning models to provide professional-grade results without the professional-grade price tag.
                    </p>
                    <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">
                       Our mission is to empower creators, marketers, and businesses of all sizes to work faster and more efficiently. We believe that repetitive tasks like masking and cutting out subjects should be entirely automated, letting you focus on the creative work that matters.
                    </p>
                  </div>
               )}
               {currentView === 'privacy' && (
                  <div>
                    <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-slate-900 mb-6">Privacy Policy</h1>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">1. Data Storage</h3>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       We highly respect your privacy. Any image uploaded to our service is processed securely. We do not permanently store your images on our servers. Images are temporarily held only for the duration of the processing and immediately deleted afterward.
                    </p>
                    <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">2. AI Training</h3>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       We strictly do not use user-uploaded images to train, fine-tune, or improve our AI models. Your creative property remains yours.
                    </p>
                  </div>
               )}
               {currentView === 'terms' && (
                  <div>
                    <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-slate-900 mb-6">Terms of Service</h1>
                    <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">Service Availability</h3>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       Our AI Background Remover is provided "as is" and free of charge. While we strive for 100% uptime, we do not guarantee continuous, uninterrupted access to the service.
                    </p>
                    <h3 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-4">Acceptable Use</h3>
                    <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">
                       You agree not to use the service for uploading illicit or illegal content. We reserve the right to block users who abuse the free API.
                    </p>
                  </div>
               )}
               {currentView === 'contact' && (
                  <div>
                    <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-slate-900 mb-6">Contact Us</h1>
                    <p className="text-[16px] md:text-[18px] text-slate-600 mb-6 leading-relaxed">
                       Have a question, feedback, or a partnership inquiry? We'd love to hear from you.
                    </p>
                    <form className="space-y-4 max-w-lg mt-8" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); setCurrentView('home'); }}>
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                         <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[16px]" placeholder="you@company.com" />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                         <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[16px]" placeholder="How can we help?"></textarea>
                       </div>
                       <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[16px] md:text-[18px] rounded-xl shadow-md transition-all">Send Message</button>
                    </form>
                  </div>
               )}
             </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 pt-20 pb-10 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6 text-white cursor-pointer">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-lg">
                  <Sparkles size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tight">AI Background Remover</span>
              </div>
              <p className="text-slate-400 text-base max-w-sm mb-6 leading-relaxed">
                Empowering creators, designers, and businesses with instant, high-quality image processing entirely for free.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setCurrentView('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setCurrentView('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col justify-between items-center text-center gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} AI Background Remover. All rights reserved.</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 justify-center">
              Crafted with <Sparkles size={12} className="text-indigo-400" /> for creators
            </p>
          </div>
        </div>
      </footer>
       
      {/* Global Styles Addition for Checkerboard */}
      <style>{`
        .checkerboard-bg {
          background-image: 
            linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
            linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
            linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
