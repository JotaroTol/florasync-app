import React, { useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Check, User } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

export default function ImageUploader({ value, onChange, label = "Upload Foto", isAvatar = false }) {
  const fileInputRef = useRef(null);
  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
    // reset input value so selecting the same file again works
    e.target.value = '';
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleSaveCrop = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onChange(croppedImage);
      setImageSrc(null); // Close cropper
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
        <Camera size={14} /> {label}
      </label>
      
      {value ? (
        <div className={`relative ${isAvatar ? 'w-24 h-24 rounded-full' : 'w-32 h-32 rounded-lg'} overflow-hidden border border-emerald-500/30 group`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button 
              type="button" 
              onClick={() => onChange('')} 
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`${isAvatar ? 'w-24 h-24 rounded-full' : 'w-full h-20 rounded-lg'} border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group`}
        >
            {isAvatar ? (
              <User size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            ) : (
              <>
                <div className="flex gap-2 mb-1">
                  <Camera size={20} />
                  <ImageIcon size={20} />
                </div>
                <span className="text-xs font-medium text-center">Klik untuk Kamera / Galeri</span>
              </>
            )}
        </div>
      )}
      
      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur-md">
          <div className="flex-1 relative">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          </div>
          <div className="p-4 bg-[#0a1a12] border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-white">
              <span className="text-sm text-gray-400 w-12">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setImageSrc(null)} 
                className="flex-1 px-4 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSaveCrop} 
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? 'Memproses...' : <><Check size={20} /> Simpan Foto</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
}
