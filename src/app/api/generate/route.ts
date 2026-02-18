import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function fallbackStory(name: string) {
  return Array.from({ length: 10 }).map((_, i) => `${name} discovers a new magical clue on adventure step ${i + 1}.`);
}

function randomSeed() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = body.name || "The child";
  const seed = randomSeed();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      pages: fallbackStory(name),
      visualDNA: "Bright smile, brave eyes, colorful backpack",
      seed,
      warning: "No GEMINI_API_KEY found. Returned fallback story."
    });
  }

  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a children's author. Return strict JSON with keys pages (10 string items) and visualDNA (3-word character visual).
Character name: ${body.name}
Age: ${body.age}
Hobby: ${body.hobby}
Favorite Food: ${body.favoriteFood}
Art Style: ${body.artStyle}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "");
    const parsed = JSON.parse(text);

    return NextResponse.json({
      pages: parsed.pages?.slice(0, 10) ?? fallbackStory(name),
      visualDNA: parsed.visualDNA ?? "Curly hair, bright hoodie, freckles",
      seed
    });
  } catch {
    return NextResponse.json({
      pages: fallbackStory(name),
      visualDNA: "Curly hair, bright hoodie, freckles",
      seed,
      warning: "Gemini parse failed. Returned fallback story."
    });
  }
}
