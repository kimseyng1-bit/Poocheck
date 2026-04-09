"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  onImageSelected: (base64: string, mediaType: string, preview: string) => void;
}

export default function UploadZone({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [meta, base64] = dataUrl.split(",");
      const mediaType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      setPreview(dataUrl);
      onImageSelected(base64, mediaType, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-stone-200 shadow">
          <Image
            src={preview}
            alt="업로드된 사진"
            width={400}
            height={300}
            className="w-full object-cover max-h-72"
            unoptimized
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/70 transition"
            aria-label="사진 제거"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={[
            "flex flex-col items-center justify-center gap-3 w-full h-48 rounded-2xl border-2 border-dashed transition-colors",
            dragging
              ? "border-amber-400 bg-amber-50"
              : "border-stone-300 bg-stone-50",
          ].join(" ")}
        >
          <span className="text-4xl">💩</span>
          <p className="text-stone-500 text-sm text-center px-4">
            사진을 여기에 드래그하거나<br />아래 버튼으로 업로드하세요
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow hover:bg-amber-600 active:scale-95 transition"
        >
          <span>📷</span> 카메라 촬영
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-700 text-white font-semibold text-sm shadow hover:bg-stone-800 active:scale-95 transition"
        >
          <span>🖼️</span> 갤러리
        </button>
      </div>

      {/* Camera (mobile — capture) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
