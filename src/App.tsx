import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Upload, Video, Smile, UserPlus, Zap, 
  ChevronLeft, Download, Share2, Settings, Star,
  Check, X, RefreshCw, Scissors, User, Plus, Trash2,
  ChevronRight, ShieldCheck, ShoppingBag
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  User as UserType, AdminSettings, Style, Category,
  MUSTACHES, BEARDS, VIRAL_EFFECTS, EMOTIONS, BeforeAfterPair
} from './types';

const BeforeAfterSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-xl border-4 border-white cursor-ew-resize select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
      </div>
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-lg flex items-center justify-center"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center -ml-0.5 border border-stone-100">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-stone-300 rounded-full" />
            <div className="w-0.5 h-3 bg-stone-300 rounded-full" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <p className="text-[8px] font-black tracking-widest uppercase text-white/80">До / После</p>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [screen, setScreen] = useState<'home' | 'camera' | 'editor' | 'result' | 'admin' | 'paywall'>('home');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [baseProcessedImage, setBaseProcessedImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('mustache');
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [styleImages, setStyleImages] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'prices' | 'images' | 'slider'>('images');
  const [error, setError] = useState<string | null>(null);
  const [otherPersonImage, setOtherPersonImage] = useState<string | null>(null);
  const [beforeAfterPairs, setBeforeAfterPairs] = useState<BeforeAfterPair[]>([]);
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherPersonInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchUser();
    fetchSettings();
    fetchBeforeAfter();
  }, []);

  const fetchBeforeAfter = async () => {
    try {
      const res = await fetch('/api/before-after');
      const data = await res.json();
      setBeforeAfterPairs(data);
    } catch (e) {
      console.error("Failed to fetch before-after pairs", e);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.error("Failed to fetch user", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setAdminSettings(data.settings);
      setStyleImages(data.images);
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setScreen('home');
      };
      reader.readAsDataURL(file);
    }
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSelectedImage(dataUrl);
        stopCamera();
        setScreen('home');
      }
    }
  };

  const startCamera = async () => {
    setScreen('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      setError("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const applyStyle = async (style: Style) => {
    if (!selectedImage) return;
    
    const cost = style.category === 'premium' ? (adminSettings?.viral_cost ?? style.cost) : (adminSettings?.viral_cost ?? 1);
    
    if (cost > (user?.tries_left || 0)) {
      setScreen('paywall');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // 1. Spend tries
      const spendRes = await fetch('/api/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, type: `style_${style.id}` })
      });
      if (!spendRes.ok) throw new Error("Failed to spend tries");
      const updatedUser = await spendRes.json();
      setUser(updatedUser);

      // 2. Call Gemini API from frontend
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-2.5-flash-image";

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: selectedImage.split(',')[1], mimeType: "image/png" } },
            { text: style.prompt }
          ]
        }
      });

      let resultImage = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          resultImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!resultImage) throw new Error("No image generated");
      
      setProcessedImage(resultImage);
      setBaseProcessedImage(resultImage);
      setScreen('home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEmotion = async (emotionName: string) => {
    const baseImage = baseProcessedImage || selectedImage;
    if (!baseImage) return;
    const cost = 1;
    
    if (cost > (user?.tries_left || 0)) {
      setScreen('paywall');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // 1. Spend tries
      const spendRes = await fetch('/api/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cost, type: `emotion_${emotionName}` })
      });
      if (!spendRes.ok) throw new Error("Failed to spend tries");
      const updatedUser = await spendRes.json();
      setUser(updatedUser);

      // 2. Call Gemini API from frontend
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-2.5-flash-image";

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: baseImage.split(',')[1], mimeType: "image/png" } },
            { text: `Modify the face in this image to show a '${emotionName}' emotion. If there is a beard or mustache, keep it. Maintain the person's identity and the style of the facial hair.` }
          ]
        }
      });

      let resultImage = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          resultImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!resultImage) throw new Error("No image generated");
      
      setProcessedImage(resultImage);
      setScreen('home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyOtherBeard = async (otherImg: string) => {
    if (!selectedImage) return;
    const cost = 1;
    
    if (cost > (user?.tries_left || 0)) {
      setScreen('paywall');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // 1. Spend tries
      const spendRes = await fetch('/api/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cost, type: 'other_beard' })
      });
      if (!spendRes.ok) throw new Error("Failed to spend tries");
      const updatedUser = await spendRes.json();
      setUser(updatedUser);

      // 2. Call Gemini API from frontend
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-2.5-flash-image";

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: selectedImage.split(',')[1], mimeType: "image/png" } },
            { text: `Extract the beard/mustache from the second image provided and apply it to the face in the first image. Make it look natural.` },
            { inlineData: { data: otherImg.split(',')[1], mimeType: "image/png" } }
          ]
        }
      });

      let resultImage = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          resultImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!resultImage) throw new Error("No image generated");
      
      setProcessedImage(resultImage);
      setBaseProcessedImage(resultImage);
      setScreen('home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtherPersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        applyOtherBeard(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    if (user?.has_paid === 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        if (ctx) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height - 40);
          ctx.rotate(-7 * Math.PI / 180);
          ctx.font = 'bold 30px sans-serif';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
          ctx.textAlign = 'center';
          ctx.fillText('Сделано в "Бородач AI"', 0, 0);
          ctx.restore();
        }
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `beardify_${Date.now()}.png`;
        link.click();
      };
      img.src = processedImage;
    } else {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `beardify_${Date.now()}.png`;
      link.click();
    }
  };

  const shareImage = async () => {
    setShowShareModal(true);
  };

  const handleSocialShare = async (network: string) => {
    if (!processedImage) return;
    try {
      let imageToShare = processedImage;
      
      if (user?.has_paid === 0) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            if (ctx) {
              ctx.save();
              ctx.translate(canvas.width / 2, canvas.height - 40);
              ctx.rotate(-7 * Math.PI / 180);
              ctx.font = 'bold 30px sans-serif';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
              ctx.textAlign = 'center';
              ctx.fillText('Сделано в "Бородач AI"', 0, 0);
              ctx.restore();
            }
            imageToShare = canvas.toDataURL('image/png');
            resolve(null);
          };
          img.src = processedImage;
        });
      }

      const blob = await (await fetch(imageToShare)).blob();
      const file = new File([blob], 'beardify.png', { type: 'image/png' });
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Мой новый образ в Бородач ⭐',
          text: 'Смотри, как я выгляжу с бородой! Сделано в @BeardifyBot',
        });
      } else {
        const link = document.createElement('a');
        link.href = imageToShare;
        link.download = `beardify_${Date.now()}.png`;
        link.click();
      }
    } catch (e: any) {
      if (e.name !== 'AbortError' && !e.message?.toLowerCase().includes('cancel')) {
        console.error("Sharing failed", e);
      }
    }
    setShowShareModal(false);
  };

  const buyTries = async (amount: number) => {
    try {
      const res = await fetch('/api/buy-tries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      setUser(data);
      setScreen('home');
    } catch (e) {
      console.error("Failed to buy tries", e);
    }
  };

  const renderDashboard = () => (
    <div className="flex flex-col min-h-screen bg-stone-50 max-w-md mx-auto relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center gap-3">
          {adminSettings?.logo_url ? (
            <img src={adminSettings.logo_url} className="w-40 h-40 object-contain" alt="Logo" />
          ) : (
            <div className="w-40 h-40 bg-amber-100 rounded-2xl flex items-center justify-center">
              <RefreshCw className="text-amber-600" size={80} />
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <p className="text-sm font-black text-amber-900">{user?.tries_left} звёзд</p>
            </div>
            <p className="text-sm font-black text-amber-900 tracking-tight">
              {user?.tries_left} примерок <span className="text-amber-600">FREE</span>
            </p>
          </div>
          <button 
            onClick={() => setScreen('paywall')}
            className="flex items-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md w-full justify-center"
          >
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            Полный доступ
          </button>
        </div>
      </div>

      {/* Main Image Frame */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[400px]">
        {processedImage ? (
          <div className="relative w-full aspect-[3/4] bg-white rounded-[40px] overflow-hidden shadow-xl border-4 border-white flex items-center justify-center group">
            <img src={processedImage} className="w-full h-full object-cover" alt="Result" />
            
            {user?.has_paid === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rotate-[-7deg] opacity-[0.16] pointer-events-none select-none">
                <p className="text-lg font-black text-stone-900 whitespace-nowrap border-[3px] border-stone-900 px-3 py-1.5 rounded-lg">Сделано в "Бородач AI"</p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                <RefreshCw className="animate-spin mb-4" size={48} />
                <p className="font-black uppercase tracking-widest text-sm">Барбер работает...</p>
              </div>
            )}
          </div>
        ) : selectedImage ? (
          <div className="relative w-full aspect-[3/4] bg-white rounded-[40px] overflow-hidden shadow-xl border-4 border-white flex items-center justify-center group">
            <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
            {isProcessing && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                <RefreshCw className="animate-spin mb-4" size={48} />
                <p className="font-black uppercase tracking-widest text-sm">Барбер работает...</p>
              </div>
            )}
          </div>
        ) : beforeAfterPairs.length > 0 ? (
          <div className="w-full space-y-6 pt-4">
            <p className="text-center text-sm font-black text-stone-900 uppercase tracking-[0.25em]">Найди свой идеальный стиль</p>
            <BeforeAfterSlider 
              before={beforeAfterPairs[currentSliderIndex].before_url} 
              after={beforeAfterPairs[currentSliderIndex].after_url} 
            />
            <div className="flex justify-center gap-2">
              {beforeAfterPairs.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSliderIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSliderIndex === idx ? 'w-6 bg-stone-900' : 'bg-stone-300'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] bg-white rounded-[40px] overflow-hidden shadow-xl border-4 border-white flex items-center justify-center group">
            <div className="flex flex-col items-center text-stone-300">
              <User size={80} strokeWidth={1} />
              <p className="mt-4 font-bold uppercase tracking-widest text-xs">Загрузи фото</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="bg-white rounded-t-[40px] shadow-2xl p-6 pb-10 border-t border-stone-100">
        {!selectedImage && !processedImage ? (
          <div className="space-y-6">
            <p className="text-center text-sm font-bold text-stone-600 leading-relaxed px-2">
              Примерь усы и бороду за секунды с помощью AI. <span className="text-amber-600">Попробуй бесплатно!</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-3 bg-stone-900 text-white h-32 rounded-3xl hover:bg-stone-800 transition-all"
              >
                <Camera size={32} />
                <span className="text-xs font-black uppercase tracking-widest">Камера</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-stone-100 text-stone-900 h-32 rounded-3xl hover:border-amber-500 transition-all"
              >
                <Upload size={32} />
                <span className="text-xs font-black uppercase tracking-widest">Галерея</span>
              </button>
            </div>
          </div>
        ) : processedImage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={downloadImage}
                className="flex flex-col items-center justify-center gap-2 bg-stone-900 text-white h-20 rounded-2xl font-black uppercase tracking-[0.05em] text-[10px] hover:brightness-90 active:scale-95 transition-all"
              >
                <Download size={18} /> Скачать
              </button>
              <button 
                onClick={() => { setProcessedImage(null); setBaseProcessedImage(null); }}
                className="flex flex-col items-center justify-center gap-2 bg-amber-500 text-white h-20 rounded-2xl font-black uppercase tracking-[0.05em] text-[10px] hover:brightness-90 active:scale-95 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5">
                  <rect x="6" y="4" width="12" height="4" rx="1" />
                  <path d="M10 8v10a2 2 0 0 0 4 0V8" />
                </svg>
                Сбрить
              </button>
              <button 
                onClick={shareImage}
                className="flex flex-col items-center justify-center gap-2 bg-stone-100 text-stone-900 h-20 rounded-2xl font-black uppercase tracking-[0.05em] text-[10px] border border-stone-200 hover:brightness-90 active:scale-95 transition-all"
              >
                <Share2 size={18} /> Поделиться
              </button>
            </div>

            {processedImage && user?.has_paid === 0 && (
              <button 
                onClick={() => setScreen('paywall')}
                className="w-full h-12 bg-amber-100 text-amber-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-amber-200 shadow-sm hover:bg-amber-200 transition-all"
              >
                <Star size={14} className="fill-amber-500 text-amber-500" />
                Убрать ватермарк
              </button>
            )}

            {/* Emotions under processed image */}
            <div className="pt-4 border-t border-stone-100 mt-4">
              <p className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 text-center">Примерить эмоцию (1 ⭐)</p>
              <div className="grid grid-cols-3 gap-2">
                {EMOTIONS.map(e => (
                  <button 
                    key={e.id} 
                    onClick={() => applyEmotion(e.name)} 
                    className="group relative aspect-square bg-stone-900 rounded-2xl overflow-hidden hover:bg-stone-800 transition-all border border-stone-800"
                  >
                    {styleImages[e.id] ? (
                      <img src={styleImages[e.id]} className="w-full h-full object-contain p-2 invert opacity-70 group-hover:opacity-100 transition-opacity" alt={e.name} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-stone-700 rounded-xl flex items-center justify-center">
                        <Smile size={24} className="text-stone-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent transition-opacity pb-2">
                      <span className="text-[9px] font-black text-white uppercase text-center leading-none px-1">{e.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { setProcessedImage(null); setBaseProcessedImage(null); setSelectedImage(null); }}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] text-stone-400 hover:text-stone-600 transition-colors bg-stone-50 mt-4"
            >
              Новое фото
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              {(['mustache', 'beard', 'premium'] as Category[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {cat === 'mustache' ? 'Усы' : cat === 'beard' ? 'Борода' : 'Премиум ⭐'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
              {activeCategory === 'mustache' && MUSTACHES.map((s, idx) => {
                const isLocked = user?.has_paid === 0 && idx >= 3;
                return (
                  <button 
                    key={s.id} 
                    onClick={() => isLocked ? setScreen('paywall') : applyStyle(s)} 
                    className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all ${isLocked ? 'bg-stone-200 border-stone-300 grayscale' : 'bg-stone-100 border-stone-200 hover:border-amber-500'}`}
                  >
                    {styleImages[s.id] ? (
                      <img src={styleImages[s.id]} className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity" alt={s.name} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center">
                        <Scissors size={20} className="text-stone-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-tight">{s.name}</span>
                    </div>
                    {isLocked && (
                      <div className="absolute top-1 right-1 bg-stone-900/80 p-1 rounded-md">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                      </div>
                    )}
                  </button>
                );
              })}
              {activeCategory === 'beard' && BEARDS.map((s, idx) => {
                const isLocked = user?.has_paid === 0 && idx >= 3;
                return (
                  <button 
                    key={s.id} 
                    onClick={() => isLocked ? setScreen('paywall') : applyStyle(s)} 
                    className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all ${isLocked ? 'bg-stone-200 border-stone-300 grayscale' : 'bg-stone-100 border-stone-200 hover:border-amber-500'}`}
                  >
                    {styleImages[s.id] ? (
                      <img src={styleImages[s.id]} className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity" alt={s.name} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center">
                        <Scissors size={20} className="text-stone-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-tight">{s.name}</span>
                    </div>
                    {isLocked && (
                      <div className="absolute top-1 right-1 bg-stone-900/80 p-1 rounded-md">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                      </div>
                    )}
                  </button>
                );
              })}
              {activeCategory === 'premium' && (
                <>
                  {VIRAL_EFFECTS.map(s => (
                    <button key={s.id} onClick={() => applyStyle(s)} className="group relative aspect-square bg-amber-50 rounded-2xl overflow-hidden border border-amber-200 hover:border-amber-500 transition-all">
                      {styleImages[s.id] ? (
                        <img src={styleImages[s.id]} className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity" alt={s.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-amber-200 rounded-2xl flex items-center justify-center">
                          <Zap size={20} className="text-amber-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-tight">{s.name}</span>
                      </div>
                      <span className="absolute top-1 right-1 bg-amber-500 text-white text-[7px] px-1.5 py-0.5 rounded font-black z-10 shadow-sm">
                        1 try
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedImage(null)}
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 text-center"
            >
              Выбрать другое фото
            </button>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
      <input type="file" ref={otherPersonInputRef} onChange={handleOtherPersonUpload} accept="image/*" className="hidden" />
      
      {user?.is_admin === 1 && (
        <button 
          onClick={() => setScreen('admin')}
          className="fixed bottom-4 left-4 p-2 bg-white/50 backdrop-blur-sm rounded-full text-stone-300 hover:text-stone-600 transition-all z-50 border border-stone-100 shadow-sm"
          title="Админ-панель"
        >
          <Settings size={16} />
        </button>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-stone-900">Поделиться</h3>
              <button onClick={() => setShowShareModal(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSocialShare('vk')} className="flex flex-col items-center justify-center gap-2 bg-[#0077FF]/10 text-[#0077FF] h-24 rounded-2xl hover:bg-[#0077FF]/20 transition-colors">
                <div className="w-10 h-10 bg-[#0077FF] rounded-full flex items-center justify-center text-white font-bold text-xl">K</div>
                <span className="text-[10px] font-black uppercase tracking-widest">ВКонтакте</span>
              </button>
              <button onClick={() => handleSocialShare('tg')} className="flex flex-col items-center justify-center gap-2 bg-[#229ED9]/10 text-[#229ED9] h-24 rounded-2xl hover:bg-[#229ED9]/20 transition-colors">
                <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.45 3.96-1.46.09 0 .28.02.39.11.09.08.12.19.13.28.01.04.01.12 0 .14z"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Телеграм</span>
              </button>
              <button onClick={() => handleSocialShare('wa')} className="flex flex-col items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] h-24 rounded-2xl hover:bg-[#25D366]/20 transition-colors">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 21.488l-3.111.816.816-3.111a9.964 9.964 0 0 1-1.38-5.162c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10a9.964 9.964 0 0 1-6.325-2.543zm5.025-7.394c-.276-.138-1.633-.806-1.886-.898-.253-.092-.437-.138-.621.138-.184.276-.713.898-.874 1.082-.161.184-.322.207-.598.069-.276-.138-1.166-.43-2.221-1.372-.821-.733-1.376-1.638-1.537-1.914-.161-.276-.017-.425.121-.563.124-.124.276-.322.414-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.621-1.496-.851-2.049-.224-.539-.453-.466-.621-.475-.161-.009-.345-.009-.529-.009-.184 0-.483.069-.736.345-.253.276-.966.944-.966 2.301s.989 2.669 1.127 2.853c.138.184 1.944 2.967 4.71 4.129 2.766 1.162 2.766.782 3.272.736.506-.046 1.633-.667 1.863-1.311.23-.644.23-1.197.161-1.311-.069-.115-.253-.184-.529-.322z"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Ватсап</span>
              </button>
              <button onClick={() => handleSocialShare('email')} className="flex flex-col items-center justify-center gap-2 bg-stone-100 text-stone-600 h-24 rounded-2xl hover:bg-stone-200 transition-colors">
                <div className="w-10 h-10 bg-stone-400 rounded-full flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0 1.1.9 2 2 2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Эл. Почта</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCamera = () => (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex-1 relative overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
          <div className="w-full h-full border-2 border-white/30 rounded-[40px]" />
        </div>
      </div>
      <div className="h-40 bg-stone-900 flex items-center justify-around px-8">
        <button 
          onClick={() => { stopCamera(); setScreen('home'); }}
          className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-white"
        >
          <X />
        </button>
        <button 
          onClick={takePhoto}
          className="w-20 h-20 rounded-full bg-white border-4 border-stone-800 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full border-2 border-stone-900" />
        </button>
        <div className="w-12 h-12" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderPaywall = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-stone-50">
      <div className="w-full max-w-lg bg-white rounded-[40px] p-6 sm:p-8 shadow-2xl border border-stone-100">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Star className="text-amber-600 fill-amber-600" size={32} />
        </div>
        <h2 className="text-3xl font-black text-stone-900 mb-6 text-center uppercase tracking-tighter">ПОЛНЫЙ ДОСТУП</h2>
        
        <div className="mb-8 overflow-hidden rounded-2xl border border-stone-100 shadow-sm bg-stone-50/50">
          <div className="bg-stone-900 px-4 py-3">
            <p className="text-[11px] font-black text-white uppercase tracking-widest text-center">Выбери свой запас звёзд для новых образов ✨</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse min-w-[300px]">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-100/50">
                  <th className="px-4 py-2 text-left font-black text-stone-400 uppercase tracking-tighter">Пакет</th>
                  <th className="px-4 py-2 text-center font-black text-stone-400 uppercase tracking-tighter">Цена</th>
                  <th className="px-4 py-2 text-center font-black text-stone-400 uppercase tracking-tighter">За 1 ⭐</th>
                  <th className="px-4 py-2 text-center font-black text-stone-400 uppercase tracking-tighter">Примерок</th>
                </tr>
              </thead>
              <tbody className="text-stone-600 font-bold">
                <tr className="border-b border-stone-50">
                  <td className="px-4 py-3 text-left">10 ⭐</td>
                  <td className="px-4 py-3 text-center text-stone-900">59 ₽</td>
                  <td className="px-4 py-3 text-center text-stone-400">5.9 ₽</td>
                  <td className="px-4 py-3 text-center">10</td>
                </tr>
                <tr className="border-b border-stone-50 bg-amber-50/30">
                  <td className="px-4 py-3 text-left">25 ⭐</td>
                  <td className="px-4 py-3 text-center text-stone-900">119 ₽</td>
                  <td className="px-4 py-3 text-center text-amber-600">4.76 ₽</td>
                  <td className="px-4 py-3 text-center">25</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-left">50 ⭐</td>
                  <td className="px-4 py-3 text-center text-stone-900">199 ₽</td>
                  <td className="px-4 py-3 text-center text-emerald-600">3.98 ₽</td>
                  <td className="px-4 py-3 text-center">50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="space-y-4">
            <p className="text-stone-900 font-black text-center uppercase tracking-tight text-sm">Открой все возможности приложения без ограничений!</p>
            <div className="space-y-3">
              {[
                "12 стилей усов и бороды",
                "Премиум-модели усов и бороды",
                "Ultra-реалистичная примерка",
                "Скачивание без водяного знака",
                "Делись в Telegram и соцсетях"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 p-4 border-2 border-stone-100 rounded-3xl bg-white shadow-sm">
            <button 
              onClick={() => buyTries(10)}
              className="group relative w-full h-16 bg-stone-100 border-2 border-stone-200 rounded-2xl px-4 flex items-center justify-between hover:border-amber-400 hover:bg-amber-50 transition-all"
            >
              <div className="text-left">
                <span className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">ПОПУЛЯРНЫЙ</span>
                <p className="text-sm font-black text-stone-900">10 <span className="text-base">⭐</span> <span className="text-xs font-bold text-stone-500 ml-1">(10 примерок)</span></p>
              </div>
              <div className="bg-stone-900 text-white px-3 py-1.5 rounded-xl font-black text-sm group-hover:bg-amber-500 transition-colors">
                59 ₽
              </div>
              <span className="absolute -bottom-2.5 right-4 bg-amber-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">Беру!</span>
            </button>

            <button 
              onClick={() => buyTries(25)}
              className="group relative w-full h-20 bg-stone-900 border-2 border-stone-800 rounded-2xl px-4 flex items-center justify-between hover:scale-[1.02] transition-all shadow-xl"
            >
              <div className="text-left">
                <span className="absolute -top-2.5 left-4 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">ВЫГОДНЫЙ</span>
                <p className="text-sm font-black text-white">25 <span className="text-base">⭐</span> <span className="text-xs font-bold text-stone-300 ml-1">(25 примерок)</span></p>
              </div>
              <div className="bg-white text-stone-900 px-3 py-1.5 rounded-xl font-black text-sm group-hover:bg-amber-400 transition-colors">
                119 ₽
              </div>
              <span className="absolute -bottom-2.5 right-4 bg-indigo-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">Беру!</span>
            </button>

            <button 
              onClick={() => buyTries(50)}
              className="group relative w-full h-16 bg-stone-100 border-2 border-stone-200 rounded-2xl px-4 flex items-center justify-between hover:border-amber-400 hover:bg-amber-50 transition-all"
            >
              <div className="text-left">
                <span className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">ЛУЧШАЯ ЦЕНА</span>
                <p className="text-sm font-black text-stone-900">50 <span className="text-base">⭐</span> <span className="text-xs font-bold text-stone-500 ml-1">(50 примерок)</span></p>
              </div>
              <div className="bg-stone-900 text-white px-3 py-1.5 rounded-xl font-black text-sm group-hover:bg-amber-500 transition-colors">
                199 ₽
              </div>
              <span className="absolute -bottom-2.5 right-4 bg-emerald-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">Беру!</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 px-2">
            {[
              { icon: Zap, text: "Мгновенное пополнение" },
              { icon: ShieldCheck, text: "Без подписки" },
              { icon: ShoppingBag, text: "Разовая покупка" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <item.icon size={14} />
                </div>
                <p className="text-[8px] font-bold text-stone-400 uppercase leading-tight">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setScreen('home')}
          className="w-full text-stone-400 font-bold uppercase tracking-widest text-xs py-2"
        >
          Назад
        </button>
      </div>
    </div>
  );

  const renderAdmin = () => {
    const handleAdminImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setStyleImages(prev => ({ ...prev, [id]: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    const generateStylePreview = async (id: string, prompt: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const model = "gemini-2.5-flash-image";
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: prompt }] }
        });

        let resultImage = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            resultImage = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
        if (resultImage) {
          setStyleImages(prev => ({ ...prev, [id]: resultImage }));
        } else {
          throw new Error("Failed to generate preview");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="flex flex-col min-h-screen bg-stone-50 p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setScreen('home')} className="p-2 text-stone-600 bg-white rounded-2xl shadow-sm">
            <ChevronLeft />
          </button>
          <h2 className="font-black text-stone-900 uppercase tracking-widest">Админ Панель</h2>
          <div className="w-10" />
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'images' ? 'bg-stone-900 text-white' : 'bg-white text-stone-400'}`}
          >
            Картинки
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'prices' ? 'bg-stone-900 text-white' : 'bg-white text-stone-400'}`}
          >
            Цены
          </button>
          <button 
            onClick={() => setActiveTab('slider')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'slider' ? 'bg-stone-900 text-white' : 'bg-white text-stone-400'}`}
          >
            Слайдер
          </button>
        </div>

        <div className="space-y-6 pb-20">
          {activeTab === 'prices' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Настройки цен</p>
                <div className="space-y-4">
                  {adminSettings && Object.entries(adminSettings).filter(([k]) => k !== 'logo_url').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-700 capitalize">{key.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={value as number} 
                          onChange={(e) => setAdminSettings({...adminSettings, [key]: parseInt(e.target.value)})}
                          className="w-16 bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 text-center font-bold"
                        />
                        <span className="text-xs text-stone-400">примерок</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'images' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Логотип приложения</p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setAdminSettings(prev => prev ? { ...prev, logo_url: ev.target?.result as string } : null);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="w-40 h-40 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden"
                  >
                    {adminSettings?.logo_url ? (
                      <img src={adminSettings.logo_url} className="w-full h-full object-contain" alt="Logo" />
                    ) : (
                      <Upload className="text-stone-300" size={48} />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Загрузить лого</p>
                    <p className="text-[9px] text-stone-400">Будет отображаться в шапке приложения</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Усы и Бороды</p>
                <div className="grid grid-cols-2 gap-4">
                  {[...MUSTACHES, ...BEARDS, ...VIRAL_EFFECTS].map(s => (
                    <div key={s.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-stone-500 truncate">{s.name}</p>
                        <button 
                          onClick={() => generateStylePreview(s.id, s.previewPrompt)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Сгенерировать превью"
                        >
                          <Zap size={12} />
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleAdminImageUpload(s.id, e as any);
                          input.click();
                        }}
                        className="w-full aspect-square bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden"
                      >
                        {styleImages[s.id] ? (
                          <img src={styleImages[s.id]} className="w-full h-full object-cover" alt={s.name} />
                        ) : (
                          <Upload className="text-stone-300" size={24} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Эмоции</p>
                <div className="grid grid-cols-2 gap-4">
                  {EMOTIONS.map(e => (
                    <div key={e.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-stone-500 truncate">{e.name}</p>
                        <button 
                          onClick={() => generateStylePreview(e.id, e.previewPrompt)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Сгенерировать превью"
                        >
                          <Zap size={12} />
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (event) => handleAdminImageUpload(e.id, event as any);
                          input.click();
                        }}
                        className="w-full aspect-square bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden"
                      >
                        {styleImages[e.id] ? (
                          <img src={styleImages[e.id]} className="w-full h-full object-cover" alt={e.name} />
                        ) : (
                          <Upload className="text-stone-300" size={24} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black text-stone-400 uppercase tracking-widest">До / После Слайдер</p>
                  <button 
                    onClick={() => setBeforeAfterPairs([...beforeAfterPairs, { id: Date.now(), before_url: '', after_url: '' }])}
                    className="p-2 bg-stone-900 text-white rounded-xl"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {beforeAfterPairs.map((pair, idx) => (
                    <div key={pair.id} className="p-4 bg-stone-50 rounded-3xl border border-stone-100 relative">
                      <button 
                        onClick={() => setBeforeAfterPairs(beforeAfterPairs.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-stone-400 uppercase text-center">До</p>
                          <button 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const newPairs = [...beforeAfterPairs];
                                    newPairs[idx].before_url = ev.target?.result as string;
                                    setBeforeAfterPairs(newPairs);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="w-full aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden"
                          >
                            {pair.before_url ? (
                              <img src={pair.before_url} className="w-full h-full object-cover" alt="Before" />
                            ) : (
                              <Upload className="text-stone-300" size={20} />
                            )}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-stone-400 uppercase text-center">После</p>
                          <button 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const newPairs = [...beforeAfterPairs];
                                    newPairs[idx].after_url = ev.target?.result as string;
                                    setBeforeAfterPairs(newPairs);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="w-full aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden"
                          >
                            {pair.after_url ? (
                              <img src={pair.after_url} className="w-full h-full object-cover" alt="After" />
                            ) : (
                              <Upload className="text-stone-300" size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={async () => {
              await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: adminSettings, images: styleImages })
              });
              await fetch('/api/admin/before-after', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pairs: beforeAfterPairs })
              });
              setScreen('home');
            }}
            className="fixed bottom-6 left-6 right-6 h-14 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl z-30"
          >
            Сохранить всё
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-stone-900">
      <AnimatePresence mode="wait">
        {screen === 'home' && <motion.div key="home" className="min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderDashboard()}</motion.div>}
        {screen === 'camera' && <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderCamera()}</motion.div>}
        {screen === 'paywall' && <motion.div key="paywall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPaywall()}</motion.div>}
        {screen === 'admin' && <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAdmin()}</motion.div>}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-6 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between z-50">
          <p className="font-bold text-sm">{error}</p>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}
    </div>
  );
}
