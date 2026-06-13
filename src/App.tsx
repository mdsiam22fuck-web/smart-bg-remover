/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Palette, Image as ImageIcon, Sparkles, X, CheckCircle2, Send, Zap, Wand2, Shield } from 'lucide-react';

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
  
  const [bgColor, setBgColor] = useState('transparent');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setErrorMessage(null);
      
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setBgColor('transparent');
      setProgress(0);
      setStatusText('');
    }
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusText('Processing image...');

    try {
      const formData = new FormData();
      formData.append('image_file', file);
      
      setProgress(50);
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to remove background');
      }

      const imageBlob = await response.blob();
      setProgress(100);
      const url = URL.createObjectURL(imageBlob);
      setResultUrl(url);
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
    
    if (bgColor === 'transparent') {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = `bg-removed-${file?.name || 'image'}.png`;
      a.click();
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `edited-${file?.name || 'image'}.png`;
          a.click();
        }
      };
      img.src = resultUrl;
    }
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Background Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />
        
        {/* Header */}
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20">
                <Sparkles size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
                <span className="text-white">Photo</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Background Remove
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {file && (
                <button
                  onClick={resetAll}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 hidden md:flex"
                >
                  <X size={16} /> New Image
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full relative z-10 flex flex-col justify-center">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
              <Sparkles size={14} />
              <span>Powered by advanced AI</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
              Erase the background.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Keep the focus.</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            {!originalUrl ? (
              /* Upload State */
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-violet-500/30 rounded-3xl bg-slate-900/40 backdrop-blur-xl p-12 text-center cursor-pointer hover:bg-slate-800/60 hover:border-violet-500/60 transition-all duration-300 group shadow-2xl shadow-violet-900/20"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 mb-6 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Image</h3>
                <p className="text-slate-400 mb-8">Remove Background</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <span className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-fuchsia-600 bg-[length:200%_auto] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 w-auto transition-all duration-500 hover:bg-[100%_center] overflow-hidden group">
                  <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[15deg] animate-shine" />
                  <span className="relative z-10 flex items-center gap-2">
                    <ImageIcon size={18} className="animate-pulse" />
                    Select Image
                  </span>
                  <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500 -z-10"></span>
                </span>
              </div>
            ) : (
              /* Editor State */
              <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden flex flex-col md:flex-row">
                {/* Image Preview Area */}
                <div className="w-full md:w-2/3 p-6 md:p-8 bg-black/20 flex flex-col items-center justify-center min-h-[400px] relative">
                  {resultUrl ? (
                    <div className="relative rounded-2xl overflow-hidden flex-1 flex items-center justify-center w-full" style={{ backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor }}>
                      {/* Checkered pattern for transparent background */}
                      {bgColor === 'transparent' && (
                        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                             style={{
                               backgroundImage: 'repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)',
                               backgroundPosition: '0 0, 10px 10px',
                               backgroundSize: '20px 20px'
                             }}
                        />
                      )}
                      <img 
                        src={resultUrl} 
                        alt="Result" 
                        className="max-w-full max-h-[500px] object-contain relative z-10 drop-shadow-2xl" 
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden flex-1 flex items-center justify-center w-full">
                      <img 
                        src={originalUrl} 
                        alt="Original" 
                        className={`max-w-full max-h-[500px] object-contain transition-all duration-500 ${isProcessing ? 'opacity-30 grayscale blur-md scale-95' : 'opacity-100'}`} 
                      />
                      
                      {isProcessing && (
                        <div className="absolute flex flex-col items-center p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 max-w-[85%] text-center">
                          <div className="relative mb-6">
                             <div className="absolute inset-0 bg-violet-600 blur-xl opacity-50 rounded-full animate-pulse"></div>
                             <RefreshCw className="w-12 h-12 text-white relative z-10 animate-spin" />
                          </div>
                          <h4 className="font-bold text-lg text-white mb-3">Removing...</h4>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full mb-4 overflow-hidden shadow-inner cursor-wait">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ease-out relative" 
                              style={{ width: `${progress}%` }} 
                            >
                               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-300">{statusText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Controls Area */}
                <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col border-t md:border-t-0 md:border-l border-white/10">
                  {!resultUrl ? (
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-white mb-3">Step 1: Remove Background</h3>
                      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                        Image uploaded. Click the button below to remove background.
                      </p>
                      {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                          <p>{errorMessage}</p>
                        </div>
                      )}
                      <button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Please wait...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Remove Background
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
                      >
                        <ImageIcon size={18} /> Choose Another Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col h-full">
                      <div className="mb-6 flex items-center font-medium text-emerald-400 bg-emerald-400/10 px-4 py-2.5 rounded-lg border border-emerald-400/20">
                        <CheckCircle2 size={18} className="mr-2" />
                        Image ready!
                      </div>
                      
                      <div className="py-6 border-y border-white/10 flex-1">
                        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                          <Palette size={16} className="text-violet-400" /> Set New Background
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          {COLORS.map((color) => (
                            <button
                              key={color.id}
                              onClick={() => setBgColor(color.value)}
                              className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${bgColor === color.value ? 'border-violet-500 scale-105 shadow-lg shadow-violet-500/30' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                              style={{ 
                                backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                                backgroundImage: color.value === 'transparent' ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)), repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))' : 'none',
                                backgroundPosition: '0 0, 5px 5px',
                                backgroundSize: '10px 10px'
                              }}
                              title={color.label}
                            >
                             {bgColor === color.value && color.value !== 'transparent' && color.value !== '#FFFFFF' && (
                               <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                             )}
                             {bgColor === color.value && color.value === '#FFFFFF' && (
                               <CheckCircle2 size={16} className="text-slate-900" />
                             )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-auto">
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-4 text-sm font-bold shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                        >
                          <Download size={18} />
                          Save Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Eye-catching Showcase Section */}
          {!originalUrl && (
            <div className="mt-32 max-w-5xl mx-auto w-full relative z-10">
              <div className="text-center mb-16">
                <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                  Experience <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">The Power of Remove</span>
                </h3>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Professional-grade AI right in your browser. No complicated tools or expensive software needed anymore.
                </p>
            <div className="mt-10 flex justify-center items-center">
              <div className="relative group inline-flex perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 blur-[24px] opacity-30 group-hover:opacity-70 transition-opacity duration-700 animate-pulse"></div>
                <span className="relative text-3xl md:text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text animate-text-shine z-10 select-none bg-[linear-gradient(110deg,#8b5cf6,45%,#ffffff,55%,#8b5cf6)] bg-[length:200%_auto]">
                  NO DRINK
                </span>
              </div>
            </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Feature Card 1 */}
                <div className="group relative rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden cursor-default">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-600/30 rounded-full blur-[40px] group-hover:bg-fuchsia-600/50 transition-all duration-500"></div>
                  <div className="bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-fuchsia-500/30 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-fuchsia-500/10">
                    <Zap className="text-fuchsia-400" size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">Lightning Fast</h4>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Drop your image and get unbelievable results in just seconds. Our fully optimized AI engine works completely on the fly without waiting.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="group relative rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden cursor-default md:-translate-y-4">
                  <div className="absolute inset-0 border border-violet-500/30 rounded-[2rem] group-hover:border-violet-500/50 transition-colors duration-500"></div>
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-600/30 rounded-full blur-[40px] group-hover:bg-violet-600/60 transition-all duration-500"></div>
                  <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-violet-500/30 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-violet-500/10">
                    <Wand2 className="text-violet-400" size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">Pixel Perfect</h4>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Incredible precision to easily handle difficult edges like fur, hair, and complex details without weird cutoffs or jagged pixels.
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="group relative rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden cursor-default">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/30 rounded-full blur-[40px] group-hover:bg-sky-500/50 transition-all duration-500"></div>
                  <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-sky-500/30 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-sky-500/10">
                    <Shield className="text-sky-400" size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">100% Private</h4>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Every image processing happens securely inside your browser. No files are uploaded to any external or cloud servers ever.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 relative z-20 w-full text-center border-t border-white/5 bg-slate-950/40 backdrop-blur-xl mt-auto">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-slate-400 text-sm font-medium tracking-wide flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-violet-400/80" />
              Seamless extraction. Limitless creativity.
              <Sparkles size={14} className="text-fuchsia-400/80" />
            </p>
            <p className="text-xs text-slate-500/80 font-medium tracking-widest uppercase">
              Transforming pixels with instant remove
            </p>
          </div>
        </footer>

        {/* Global Floating Telegram Button */}
        <a 
          href="https://t.me/+ab_awlOXjnFlMjI1"
          target="_blank"
          rel="noopener noreferrer"
          className="group fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 sm:py-3 sm:px-6 rounded-full bg-gradient-to-r from-[#2AABEE] to-[#229ED9] shadow-[0_4px_30px_rgba(42,171,238,0.5)] transition-all duration-500 hover:scale-[1.15] hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(42,171,238,0.8)] overflow-hidden"
        >
          {/* Shine effect inside the button */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[15deg] animate-shine" />
          
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
          <div className="relative z-10 flex items-center justify-center gap-2.5">
            <svg className="w-7 h-7 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span className="hidden sm:inline-block text-sm font-bold text-white tracking-wide">
              Join Telegram
            </span>
          </div>
          {/* Echo effect */}
          <span className="absolute -inset-1 rounded-full bg-[#2AABEE] opacity-20 animate-ping -z-10 duration-[2000ms]"></span>
          <span className="absolute -inset-2 rounded-full border border-[#2AABEE]/30 rounded-full animate-ping -z-10 duration-[3000ms] delay-500"></span>
        </a>
      </div>
  );
}
