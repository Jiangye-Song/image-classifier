import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { categories, categoryNames } from "@/lib/categories";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const modelId = formData.get("model") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const categoryList = categories
      .map(
        (c) =>
          `- "${c.name}": ${c.description}. Common items: ${c.commonItems.join(", ")}.`
      )
      .join("\n");

    const prompt = `You are a skip bin material classifier. Analyze the image and classify the waste material into ONE of the following categories:

${categoryList}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "category": "<exact category name from the list>",
  "confidence": <number between 0 and 100>,
  "reasoning": "<brief explanation of why this category was chosen>",
  "detectedItems": ["<item 1>", "<item 2>", "<item 3>"],
  "asbestosLikelihood": <number between 0 and 100>
}

Rules:
- The "category" must be EXACTLY one of: ${categoryNames.map((n) => `"${n}"`).join(", ")}
- "confidence" is a percentage from 0-100
- "detectedItems" lists specific items you can identify in the image
- "asbestosLikelihood" is a percentage from 0-100 estimating the probability the image contains asbestos materials (e.g. fibro sheeting, cement sheets, old roofing, textured cladding). Always assess this independently regardless of the chosen category. Be cautious and flag even slight visual cues of asbestos-containing materials.
- If the image does not contain waste or skip bin materials, set category to the closest match and add a note in reasoning`;

    const selectedModel = modelId || "google/gemini-2.0-flash-lite";
    const model = gateway(selectedModel);

    const { text } = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: `data:${file.type};base64,${base64}`,
            },
          ],
        },
      ],
    });

    // Strip markdown code fences if present
    const jsonStr = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    const result = JSON.parse(jsonStr);

    // Validate category name
    if (!categoryNames.includes(result.category)) {
      result.category = categoryNames[0];
      result.reasoning += " (Category was adjusted to nearest valid option)";
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Classification error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    // Detect multimodal / image-not-supported errors from providers
    const isUnsupportedImage =
      /image|multimodal|vision|does not support|content type|invalid_request.*image|Could not process image|Unsupported input modality/i.test(
        message
      );

    if (isUnsupportedImage) {
      return NextResponse.json(
        {
          error: `The selected model does not support image inputs. Unfortunately there's no programmatical way to filter image input models, but you may check this list: https://vercel.com/ai-gateway/models?capabilities=image-generation`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to classify image. Please try again." },
      { status: 500 }
    );
  }
}
