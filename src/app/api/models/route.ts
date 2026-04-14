import { NextResponse } from "next/server";

type GatewayModel = {
  id: string;
  name?: string;
  description?: string;
  type?: string;
};

export async function GET() {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`AI Gateway returned ${res.status}`);
    }

    const json = (await res.json()) as { data?: GatewayModel[] };
    const models = json.data ?? [];

    const languageModels = models
      .filter((m) => m.type === "language")
      .map((m) => ({
        id: m.id,
        name: m.name ?? m.id,
        description: m.description ?? "",
      }));

    return NextResponse.json(languageModels);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch available models" },
      { status: 500 }
    );
  }
}