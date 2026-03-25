"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { type Model } from "@/lib/categories";

interface WeightResult {
  receiptWeight: number | null;
  unit: string;
  expectedWeight: number;
  difference: number;
  isOverweight: boolean;
  summary: string;
  receiptDetails: string;
}

export default function WeightCheckPage() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [expectedWeight, setExpectedWeight] = useState("");
  const [result, setResult] = useState<WeightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelsLoading, setModelsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data: Model[]) => {
        if (Array.isArray(data)) {
          setModels(data);
          const preferred = data.find((m) => m.id === "google/gemini-2.5-flash-lite");
          if (preferred) setSelectedModel(preferred.id);
          else if (data.length > 0) setSelectedModel(data[0].id);
        }
      })
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleCheck = async () => {
    if (!file || !expectedWeight) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("model", selectedModel);
      formData.append("expectedWeight", expectedWeight);

      const response = await fetch("/api/weight-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Weight check failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Weight Check
          </h1>
          <p className="text-slate-400 text-lg">
            Upload a weighbridge receipt to check if the load is overweight
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Expected Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Expected Weight (tonnes)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expectedWeight}
                onChange={(e) => setExpectedWeight(e.target.value)}
                placeholder="e.g. 3.5"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Image Upload */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-amber-400 bg-amber-400/10"
                  : image
                    ? "border-slate-600"
                    : "border-slate-600 hover:border-slate-400 hover:bg-slate-800/50"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />

              {image ? (
                <img
                  src={image}
                  alt="Receipt preview"
                  className="max-h-72 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="py-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-slate-300 font-medium mb-1">
                    Drop a weighbridge receipt here or click to upload
                  </p>
                  <p className="text-sm text-slate-500">
                    JPEG, PNG, WebP, or HEIC (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Model
              </label>
              {modelsLoading ? (
                <div className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-500">
                  Loading models...
                </div>
              ) : models.length === 0 ? (
                <div className="w-full bg-slate-800 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400">
                  Failed to load models
                </div>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={!file || !expectedWeight || loading}
                className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-semibold transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Checking...
                  </span>
                ) : (
                  "Check Weight"
                )}
              </button>
              {image && (
                <button
                  onClick={handleReset}
                  className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            {result ? (
              <div className="space-y-4">
                {/* Overweight Status */}
                <div
                  className={`p-6 rounded-2xl border ${
                    result.receiptWeight === null
                      ? "bg-slate-800/80 border-slate-700"
                      : result.isOverweight
                        ? "bg-red-500/15 border-red-500/40"
                        : "bg-emerald-500/15 border-emerald-500/40"
                  }`}
                >
                  {result.receiptWeight !== null ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`text-4xl font-bold ${
                            result.isOverweight ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {result.isOverweight ? "⚠ Overweight" : "✓ Within Limit"}
                        </span>
                      </div>

                      {/* Weight comparison */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            Expected
                          </p>
                          <p className="text-2xl font-bold text-slate-300">
                            {result.expectedWeight}t
                          </p>
                        </div>
                        <div className="p-3 bg-slate-900/60 rounded-xl text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            Actual
                          </p>
                          <p
                            className={`text-2xl font-bold ${
                              result.isOverweight ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {result.receiptWeight}t
                          </p>
                        </div>
                      </div>

                      {/* Difference */}
                      <div
                        className={`p-3 rounded-lg ${
                          result.isOverweight
                            ? "bg-red-500/10"
                            : "bg-emerald-500/10"
                        }`}
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-300">
                            Difference
                          </span>
                          <span
                            className={`font-bold ${
                              result.isOverweight
                                ? "text-red-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {result.difference > 0 ? "+" : ""}
                            {result.difference}t
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400">
                      Could not read weight from receipt.
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <h3 className="font-semibold mb-2 text-slate-300">Summary</h3>
                  <p className="text-sm text-slate-400">{result.summary}</p>
                </div>

                {/* Receipt Details */}
                {result.receiptDetails && (
                  <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <h3 className="font-semibold mb-2 text-slate-300">
                      Receipt Details
                    </h3>
                    <p className="text-sm text-slate-400">
                      {result.receiptDetails}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <h3 className="font-semibold mb-4 text-slate-300">
                  How it works
                </h3>
                <ol className="space-y-3 text-sm text-slate-400">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      1
                    </span>
                    Enter the expected weight for the skip bin load
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      2
                    </span>
                    Upload a photo of the weighbridge receipt / docket
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </span>
                    AI extracts the net weight and compares it to your expected value
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      4
                    </span>
                    See instantly if the load is overweight and by how much
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
