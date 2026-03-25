import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Skip Bin Material Classifier
          </h1>
          <p className="text-slate-400 text-lg">
            AI-powered waste material classification for skip bins
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Single Model */}
          <Link
            href="/classify"
            className="group p-8 bg-slate-800/60 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all"
          >
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V5.25A2.25 2.25 0 0016.75 3h-9.5A2.25 2.25 0 005 5.25V14.5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Classify</h2>
            <p className="text-slate-400">
              Upload an image and classify its waste material type using a single
              AI model.
            </p>
            <span className="inline-block mt-4 text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
              Get started &rarr;
            </span>
          </Link>

          {/* Model Comparison */}
          <Link
            href="/classify-vs"
            className="group p-8 bg-slate-800/60 rounded-2xl border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all"
          >
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Model Comparison</h2>
            <p className="text-slate-400">
              Compare up to 3 AI models side-by-side on the same image with a
              majority-vote verdict.
            </p>
            <span className="inline-block mt-4 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
              Compare models &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
