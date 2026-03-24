"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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

interface ColumnState {
  selectedModel: string;
  result: ClassificationResult | null;
  loading: boolean;
  error: string | null;
}

function majorityVote<T>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best: T = values[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
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

export default function VsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [columns, setColumns] = useState<[ColumnState, ColumnState, ColumnState]>([
    { selectedModel: "", result: null, loading: false, error: null },
    { selectedModel: "", result: null, loading: false, error: null },
    { selectedModel: "", result: null, loading: false, error: null },
  ]);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data: Model[]) => {
        if (Array.isArray(data)) {
          setModels(data);
          const preferred = data.find((m) => m.id === "google/gemini-2.5-flash-lite");
          const defaultId = preferred?.id || data[0]?.id || "";
          setColumns([
            { selectedModel: defaultId, result: null, loading: false, error: null },
            { selectedModel: "", result: null, loading: false, error: null },
            { selectedModel: "", result: null, loading: false, error: null },
          ]);
        }
      })
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  }, []);

  const updateColumn = (index: number, updates: Partial<ColumnState>) => {
    setColumns((prev) => {
      const next = [...prev] as [ColumnState, ColumnState, ColumnState];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setColumns((prev) =>
      prev.map((c) => ({ ...c, result: null, error: null })) as [ColumnState, ColumnState, ColumnState]
    );
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

  const classifySingle = async (index: number) => {
    if (!file || !columns[index].selectedModel) return;
    updateColumn(index, { loading: true, error: null, result: null });
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("model", columns[index].selectedModel);
      const response = await fetch("/api/classify", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Classification failed");
      updateColumn(index, { result: data, loading: false });
    } catch (err) {
      updateColumn(index, { error: err instanceof Error ? err.message : "Something went wrong", loading: false });
    }
  };

  const classifyAll = async () => {
    if (!file) return;
    const active = columns
      .map((c, i) => ({ ...c, i }))
      .filter((c) => c.selectedModel);
    await Promise.all(active.map((c) => classifySingle(c.i)));
  };

  const handleReset = () => {
    setImage(null);
    setFile(null);
    setColumns((prev) =>
      prev.map((c) => ({ ...c, result: null, error: null })) as [ColumnState, ColumnState, ColumnState]
    );
  };

  // Compute final verdict from successful results
  const successfulResults = columns
    .map((c) => c.result)
    .filter((r): r is ClassificationResult => r !== null);

  const allDone = columns.every((c) => !c.selectedModel || c.result || c.error);
  const activeCount = columns.filter((c) => c.selectedModel).length;
  const anyLoading = columns.some((c) => c.loading);

  const showVerdict = successfulResults.length >= 2 && allDone;

  const verdict = showVerdict
    ? {
        category: majorityVote(successfulResults.map((r) => r.category)),
        asbestosLikelihood: Math.round(
          successfulResults.reduce((s, r) => s + r.asbestosLikelihood, 0) / successfulResults.length
        ),
        isOverfilled: majorityVote(successfulResults.map((r) => r.isOverfilled)),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Model Comparison
          </h1>
          <p className="text-slate-400 text-lg">
            Compare up to 3 models on the same image
          </p>
        </div>

        {/* Image Upload */}
        <div className="max-w-md mx-auto mb-10 space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
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
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
            ) : (
              <div className="py-6">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-slate-500"
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

          <div className="flex gap-3 justify-center">
            <button
              onClick={classifyAll}
              disabled={!file || activeCount === 0 || anyLoading}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-semibold transition-colors"
            >
              {anyLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Classifying...
                </span>
              ) : (
                `Classify with ${activeCount} Model${activeCount !== 1 ? "s" : ""}`
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
        </div>

        {/* 3 Columns */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {columns.map((col, i) => (
            <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <h3 className="text-lg font-semibold text-slate-300">Model {i + 1}</h3>

              {/* Model Selector */}
              {modelsLoading ? (
                <div className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-500">
                  Loading models...
                </div>
              ) : (
                <select
                  value={col.selectedModel}
                  onChange={(e) => updateColumn(i, { selectedModel: e.target.value, result: null, error: null })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">— None —</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))}
                </select>
              )}

              {/* Loading */}
              {col.loading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysing...
                </div>
              )}

              {/* Error */}
              {col.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {col.error}
                </div>
              )}

              {/* Result */}
              {col.result && (
                <div className="space-y-3">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${categoryColors[col.result.category] || "bg-slate-500"}`} />
                    <span className="font-bold text-lg">{col.result.category}</span>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Confidence</span>
                      <span className="font-semibold">{col.result.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          col.result.confidence >= 80
                            ? "bg-emerald-500"
                            : col.result.confidence >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${col.result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Reasoning */}
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Reasoning: </span>
                    {col.result.reasoning}
                  </p>

                  {/* Asbestos */}
                  <div className={`p-2.5 rounded-lg border ${
                    col.result.asbestosLikelihood >= 50
                      ? "bg-red-500/15 border-red-500/40"
                      : col.result.asbestosLikelihood >= 20
                        ? "bg-yellow-500/15 border-yellow-500/40"
                        : "bg-slate-900/50 border-transparent"
                  }`}>
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${
                        col.result.asbestosLikelihood >= 50
                          ? "text-red-400"
                          : col.result.asbestosLikelihood >= 20
                            ? "text-yellow-400"
                            : "text-slate-400"
                      }`}>
                        {col.result.asbestosLikelihood >= 50 ? "⚠ " : ""}Asbestos
                      </span>
                      <span className="font-semibold">{col.result.asbestosLikelihood}%</span>
                    </div>
                  </div>

                  {/* Overfilled */}
                  <div className={`p-2.5 rounded-lg border ${
                    col.result.isOverfilled === "Yes"
                      ? "bg-red-500/15 border-red-500/40"
                      : col.result.isOverfilled === "No"
                        ? "bg-emerald-500/15 border-emerald-500/40"
                        : "bg-slate-900/50 border-transparent"
                  }`}>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">Bin Overfilled</span>
                      <span className={`font-semibold ${
                        col.result.isOverfilled === "Yes"
                          ? "text-red-400"
                          : col.result.isOverfilled === "No"
                            ? "text-emerald-400"
                            : "text-slate-500"
                      }`}>
                        {col.result.isOverfilled === "Yes" ? "⚠ Yes" : col.result.isOverfilled}
                      </span>
                    </div>
                  </div>

                  {/* Detected Items */}
                  {col.result.detectedItems.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 font-semibold mb-1">Detected Items</p>
                      <div className="flex flex-wrap gap-1">
                        {col.result.detectedItems.map((item, j) => (
                          <span key={j} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!col.loading && !col.error && !col.result && col.selectedModel && (
                <p className="text-sm text-slate-500 italic">Upload an image and click classify</p>
              )}
              {!col.selectedModel && (
                <p className="text-sm text-slate-500 italic">No model selected</p>
              )}
            </div>
          ))}
        </div>

        {/* Final Verdict */}
        {verdict && (
          <div className="max-w-2xl mx-auto p-6 bg-slate-800/80 rounded-2xl border border-blue-500/30 space-y-4">
            <h2 className="text-xl font-bold text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Final Verdict ({successfulResults.length} models)
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Category */}
              <div className="p-4 bg-slate-900/60 rounded-xl text-center">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Category</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${categoryColors[verdict.category] || "bg-slate-500"}`} />
                  <span className="font-bold">{verdict.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {successfulResults.filter((r) => r.category === verdict.category).length}/{successfulResults.length} votes
                </p>
              </div>

              {/* Asbestos */}
              <div className={`p-4 rounded-xl text-center ${
                verdict.asbestosLikelihood >= 50
                  ? "bg-red-500/15"
                  : verdict.asbestosLikelihood >= 20
                    ? "bg-yellow-500/15"
                    : "bg-slate-900/60"
              }`}>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Asbestos Likelihood</p>
                <span className={`text-2xl font-bold ${
                  verdict.asbestosLikelihood >= 50
                    ? "text-red-400"
                    : verdict.asbestosLikelihood >= 20
                      ? "text-yellow-400"
                      : "text-slate-300"
                }`}>
                  {verdict.asbestosLikelihood}%
                </span>
                <p className="text-xs text-slate-500 mt-1">average</p>
              </div>

              {/* Overfilled */}
              <div className={`p-4 rounded-xl text-center ${
                verdict.isOverfilled === "Yes"
                  ? "bg-red-500/15"
                  : verdict.isOverfilled === "No"
                    ? "bg-emerald-500/15"
                    : "bg-slate-900/60"
              }`}>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Bin Overfilled</p>
                <span className={`text-2xl font-bold ${
                  verdict.isOverfilled === "Yes"
                    ? "text-red-400"
                    : verdict.isOverfilled === "No"
                      ? "text-emerald-400"
                      : "text-slate-500"
                }`}>
                  {verdict.isOverfilled === "Yes" ? "⚠ Yes" : verdict.isOverfilled}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {successfulResults.filter((r) => r.isOverfilled === verdict.isOverfilled).length}/{successfulResults.length} votes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
