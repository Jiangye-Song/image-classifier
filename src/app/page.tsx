"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { categories } from "@/lib/categories";

interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning: string;
  detectedItems: string[];
  asbestosLikelihood: number;
  isOverfilled: "Yes" | "No" | "N/A";
}

interface Model {
  id: string;
  name: string;
  description?: string;
}

const categoryColors: Record<string, string> = {
  "Household Rubbish": "bg-yellow-500",
  "Household Clutter": "bg-orange-500",
  "General Waste": "bg-gray-500",
  "Construction Waste": "bg-amber-700",
  "Green Waste (No Soil)": "bg-green-500",
  "Green Waste (With Soil)": "bg-green-700",
  "Bricks & Concrete": "bg-red-700",
  Steel: "bg-slate-600",
  Asbestos: "bg-red-500",
  "Dirt & Soil": "bg-yellow-800",
  "Copper Wire": "bg-orange-600",
  "Litter & Scrap": "bg-teal-600",
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
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
          if (data.length > 0) setSelectedModel(data[0].id);
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

  const handleClassify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("model", selectedModel);

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Classification failed");
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

  const matchedCategory = result
    ? categories.find((c) => c.name === result.category)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Skip Bin Material Classifier
          </h1>
          <p className="text-slate-400 text-lg">
            Upload an image to identify the waste material type using AI
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-blue-400 bg-blue-400/10"
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
                  alt="Upload preview"
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
                    Drop an image here or click to upload
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
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
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
                onClick={handleClassify}
                disabled={!file || loading}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-semibold transition-colors"
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
                    Classifying...
                  </span>
                ) : (
                  "Classify Material"
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
            {result && matchedCategory ? (
              <div className="space-y-4">
                {/* Category Badge */}
                <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`w-4 h-4 rounded-full ${
                        categoryColors[result.category] || "bg-slate-500"
                      }`}
                    />
                    <h2 className="text-2xl font-bold">{result.category}</h2>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Confidence</span>
                      <span className="font-semibold">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${
                          result.confidence >= 80
                            ? "bg-emerald-500"
                            : result.confidence >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-4">
                    {matchedCategory.description}
                  </p>

                  {/* Asbestos Likelihood */}
                  <div className={`p-3 rounded-lg border ${
                    result.asbestosLikelihood >= 50
                      ? "bg-red-500/15 border-red-500/40"
                      : result.asbestosLikelihood >= 20
                      ? "bg-yellow-500/15 border-yellow-500/40"
                      : "bg-slate-900/50 border-transparent"
                  }`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-semibold ${
                        result.asbestosLikelihood >= 50
                          ? "text-red-400"
                          : result.asbestosLikelihood >= 20
                          ? "text-yellow-400"
                          : "text-slate-400"
                      }`}>
                        {result.asbestosLikelihood >= 50 ? "⚠ " : ""}Asbestos Likelihood
                      </span>
                      <span className="font-semibold">{result.asbestosLikelihood}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          result.asbestosLikelihood >= 50
                            ? "bg-red-500"
                            : result.asbestosLikelihood >= 20
                            ? "bg-yellow-500"
                            : "bg-slate-500"
                        }`}
                        style={{ width: `${result.asbestosLikelihood}%` }}
                      />
                    </div>
                    {result.asbestosLikelihood >= 50 && (
                      <p className="text-xs text-red-400 mt-2">
                        This material may contain asbestos. Handle with extreme caution and consult a licensed assessor.
                      </p>
                    )}
                  </div>

                  {/* Overfilled Status */}
                  <div className={`p-3 rounded-lg border ${
                    result.isOverfilled === "Yes"
                      ? "bg-red-500/15 border-red-500/40"
                      : result.isOverfilled === "No"
                      ? "bg-emerald-500/15 border-emerald-500/40"
                      : "bg-slate-900/50 border-transparent"
                  }`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-300">Bin Overfilled</span>
                      <span className={`font-semibold ${
                        result.isOverfilled === "Yes"
                          ? "text-red-400"
                          : result.isOverfilled === "No"
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}>
                        {result.isOverfilled === "Yes" ? "⚠ Yes" : result.isOverfilled}
                      </span>
                    </div>
                    {result.isOverfilled === "Yes" && (
                      <p className="text-xs text-red-400 mt-1">
                        Materials appear to exceed the bin rim. This may incur additional charges.
                      </p>
                    )}
                  </div>

                  {/* Reasoning */}
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-400">
                      <span className="font-semibold text-slate-300">
                        AI Reasoning:{" "}
                      </span>
                      {result.reasoning}
                    </p>
                  </div>
                </div>

                {/* Detected Items */}
                {result.detectedItems.length > 0 && (
                  <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <h3 className="font-semibold mb-3 text-slate-300">
                      Detected Items
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.detectedItems.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Items for Category */}
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <h3 className="font-semibold mb-3 text-slate-300">
                    Common Items in &quot;{matchedCategory.name}&quot;
                  </h3>
                  <ul className="space-y-1">
                    {matchedCategory.commonItems.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-400 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              /* Category Reference */
              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <h3 className="font-semibold mb-4 text-slate-300">
                  Material Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-start gap-3">
                      <span
                        className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          categoryColors[cat.name] || "bg-slate-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
