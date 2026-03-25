import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const modelId = formData.get("model") as string | null;
    const expectedWeight = formData.get("expectedWeight") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!expectedWeight || isNaN(Number(expectedWeight)) || Number(expectedWeight) <= 0) {
      return NextResponse.json({ error: "A valid expected weight is required" }, { status: 400 });
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

    const prompt = `You are a weight-check assistant for skip bin deliveries. You are given a photo of a weighbridge receipt / docket / ticket.

Your task:
1. Extract the **net weight** (actual weight of the load, excluding the truck tare weight) from the receipt image. Look for fields labelled "Net", "Nett", "Net Weight", "Gross minus Tare", or similar. The weight is typically in tonnes (t) or kilograms (kg).
2. Compare it against the customer's expected weight of **${expectedWeight} tonnes**.
3. Determine if the load is overweight, underweight, or within tolerance.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "receiptWeight": <number — the net weight extracted from the receipt in tonnes>,
  "unit": "<the unit shown on the receipt, e.g. 't', 'kg'>",
  "expectedWeight": ${expectedWeight},
  "difference": <number — receiptWeight minus expectedWeight, positive means overweight>,
  "isOverweight": <boolean — true if receiptWeight exceeds expectedWeight>,
  "summary": "<brief human-readable summary, e.g. 'The load is 1.2t over the expected 3.0t'>",
  "receiptDetails": "<any other useful info from the receipt — date, ticket number, site, etc.>"
}

Rules:
- If the weight on the receipt is in kg, convert it to tonnes (divide by 1000) for "receiptWeight".
- "difference" should be in tonnes, rounded to 2 decimal places.
- If you cannot read the weight from the image, set "receiptWeight" to null and explain in "summary".`;

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

    const jsonStr = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Weight check error:", error);

    const parts: string[] = [];
    if (error instanceof Error) {
      parts.push(error.message);
      const cause = (error as { cause?: unknown }).cause;
      if (cause instanceof Error) {
        parts.push(cause.message);
        const responseBody = (cause as { responseBody?: string }).responseBody;
        if (typeof responseBody === "string") parts.push(responseBody);
      }
    }
    const fullErrorText = parts.join(" ");

    const isUnsupportedImage =
      /image_url|image content block|not support.*image|does not support|content type.*not supported|Only 'text'|multimodal|Method Not Allowed|messages\[0\]\.content must be a string/i.test(
        fullErrorText
      );

    if (isUnsupportedImage) {
      return NextResponse.json(
        {
          error: `The selected model does not support image inputs. Please choose a vision-capable model.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check weight. Please try again." },
      { status: 500 }
    );
  }
}
