import { NextResponse } from "next/server";
import { gateway } from "@ai-sdk/gateway";

export async function GET() {
  try {
    const { models } = await gateway.getAvailableModels();
    const languageModels = models.filter((m) => m.modelType === "language");

    return NextResponse.json(
      languageModels.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: "Failed to fetch available models" },
      { status: 500 }
    );
  }
}
