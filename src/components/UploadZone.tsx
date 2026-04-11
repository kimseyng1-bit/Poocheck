"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  onImageSelected: (base64: string, mediaType: string, preview: string) => void;
}

// Compress via Canvas — fixes iOS Safari "string did not match expected pattern"
// error caused by fetch rejecting oversized base64 payloads from high-res
// iPhone camera photos (12–48 MP → 10–20 MB base64).
function compressImage(
  dataUrl: string,
  maxWidth = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

export default function UploadZone({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      // Always compress — reduces payload and normalises to JPEG/base64
      const compressed = await compressImage(raw);
      const base64 = compressed.split(",")[1];
      setPreview(compressed);
      onImageSelected(base64, "image/jpeg", compressed);
    };
    reader.readAsDataURL(file);
  }

  // Android fix: always create a fresh <input> element so that onChange fires
  // reliably after camera capture. Reusing a hidden ref'd input causes Android
  // Chrome to silently drop the result on second+ uses.
  function openCamera() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) processFile(file);
      document.body.removeChild(input);
    };

    // Cleanup if user cancels without selecting
    const cleanup = () => {
      setTimeout(() => {
        if (document.body.contains(input)) document.body.removeChild(input);
      }, 500);
      window.removeEventListener("focus", cleanup);
    };
    window.addEventListener("focus", cleanup);

    input.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
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
            onClick={() => setPreview(null)}
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
          onClick={openCamera}
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

      {/* Gallery picker (ref 방식 — 갤러리는 문제 없음) */}
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
