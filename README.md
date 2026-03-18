# Image Classifier

A Next.js application that classifies skip bin / waste material images using AI vision models via the **Vercel AI Gateway**. Upload a photo of waste material and the app identifies its category (e.g. Construction Waste, Green Waste, Asbestos, Steel, etc.) along with a confidence score and asbestos-likelihood assessment.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Vercel AI SDK** (`ai`) + **AI Gateway** (`@ai-sdk/gateway`)
- **Tailwind CSS 4**
- **TypeScript 5**

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm, yarn, pnpm, or bun
- A **Vercel** account with **AI Gateway** enabled

---

## Setting Up the Vercel AI Gateway

The app uses [`@ai-sdk/gateway`](https://sdk.vercel.ai/docs/ai-sdk-core/ai-gateway) to route requests to multiple AI providers (Google Gemini, OpenAI, Anthropic, etc.) through a single unified API.

### 1. Create a Vercel project

If you haven't already, link this repo to a Vercel project:

```bash
npx vercel link
```

### 2. Enable AI Gateway

1. Go to your project on [vercel.com](https://vercel.com).
2. Navigate to **AI** tab (or **Settings → AI Gateway**).
3. Enable the **AI Gateway** for your project.
4. Add the AI providers you want to use (e.g. Google Gemini, OpenAI, Anthropic). Each provider requires its own API key — add them in the Vercel dashboard.

### 3. Get your AI Gateway credentials

After enabling the gateway you will have:

| Variable | Description |
|---|---|
| `VERCEL_AI_GATEWAY_API_KEY` | Secret key used to authenticate requests to the gateway |

The gateway API key is automatically available when deployed on Vercel. For **local development**, you need to set it as an environment variable.

### 4. Set up environment variables locally

Create a `.env.local` file in the project root:

```bash
# .env.local
VERCEL_AI_GATEWAY_API_KEY=your_gateway_api_key_here
```

> **Tip:** You can also pull environment variables from your Vercel project with:
> ```bash
> npx vercel env pull .env.local
> ```

---

## Installation & Local Development

```bash
# 1. Clone the repo
git clone <repo-url>
cd image-classifier

# 2. Install dependencies
npm install

# 3. Copy environment variables (see section above)
cp .env.example .env.local   # then fill in your keys

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (with hot reload) |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI — image upload & results
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles (Tailwind)
│   │   └── api/
│   │       ├── classify/
│   │       │   └── route.ts      # POST — classifies an uploaded image
│   │       └── models/
│   │           └── route.ts      # GET  — lists available AI models
│   └── lib/
│       └── categories.ts         # Waste category definitions
├── categories.md                 # Human-readable category reference
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Key Files

- **`src/app/api/classify/route.ts`** — Accepts a multipart form upload (image + model ID), sends the image to the selected vision model via `@ai-sdk/gateway`, and returns a JSON classification result.
- **`src/app/api/models/route.ts`** — Fetches the list of available language models from the AI Gateway so the user can pick one in the UI.
- **`src/lib/categories.ts`** — Defines the 12 waste categories the classifier uses.

---

## How It Works

1. The user uploads an image (JPEG, PNG, WebP, or HEIC — max 10 MB).
2. The user selects a vision-capable AI model from the dropdown (models are fetched from Vercel AI Gateway at runtime).
3. The app sends the image (base64-encoded) along with a classification prompt to the selected model via:
   ```ts
   import { gateway } from "@ai-sdk/gateway";
   import { generateText } from "ai";

   const model = gateway("google/gemini-2.0-flash-lite");
   const { text } = await generateText({ model, messages: [...] });
   ```
4. The AI responds with a JSON object containing:
   - `category` — one of the 12 predefined waste categories
   - `confidence` — 0–100 score
   - `reasoning` — explanation of the classification
   - `detectedItems` — list of items identified in the image
   - `asbestosLikelihood` — 0–100 score for asbestos risk

---

## Supported Waste Categories

| Category | Description |
|---|---|
| Household Rubbish | Dry non-putrescible general household waste |
| Household Clutter | Everyday non-recyclable household items |
| General Waste | Household items, packaging, non-recyclables |
| Construction Waste | Timber, drywall, tiles, bricks (no asbestos) |
| Green Waste (No Soil) | Plant-based garden waste without soil |
| Green Waste (With Soil) | Plant-based garden waste with soil |
| Bricks & Concrete | Concrete, masonry, heavy materials |
| Steel | Scrap and metal-based materials |
| Asbestos | Bonded or friable asbestos-containing materials |
| Dirt & Soil | Clean fill — dirt, soil, sand |
| Copper Wire | Copper wiring, pipes, fittings |
| Litter & Scrap | Dry litter and discarded metal/material pieces |

---

## Deploying to Vercel

```bash
npx vercel --prod
```

Make sure the `VERCEL_AI_GATEWAY_API_KEY` environment variable is set in your Vercel project settings. The AI Gateway SDK will automatically pick it up at runtime.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "Failed to fetch available models" | Check that `VERCEL_AI_GATEWAY_API_KEY` is set and the AI Gateway is enabled on your Vercel project |
| "The selected model does not support image inputs" | Switch to a vision-capable model (e.g. Gemini Flash, GPT-4o, Claude Sonnet) |
| Build fails with missing env vars | Run `npx vercel env pull .env.local` to sync env vars locally |

---

## License

Private — not licensed for redistribution.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
