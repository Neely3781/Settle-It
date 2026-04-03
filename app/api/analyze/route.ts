import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { images, context } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    const baseURL = "https://api.openai.com/v1";

    // Step 1: Validate images are conversation screenshots
    const validationContent: any[] = [
      {
        type: "text",
        text: `You are a content validator. Look at these images and determine if they are screenshots of messaging conversations, text threads, or chat apps (iMessage, WhatsApp, Messenger, Instagram DM, etc.).

Respond with ONLY a JSON object in this exact format:
{
  "isValid": true/false,
  "reason": "brief explanation if invalid"
}

Rules:
- isValid = true only if ALL images show text conversations/messages
- isValid = false if any image shows: photos of people, landscapes, memes without conversation context, documents, random screenshots, etc.
- Be strict: party photos, selfies, food pics, scenery = invalid`,
      },
    ];

    for (const imageUrl of images) {
      validationContent.push({
        type: "image_url",
        image_url: { url: imageUrl, detail: "low" },
      });
    }

    const validationRes = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: validationContent }],
        max_tokens: 150,
      }),
    });

    if (!validationRes.ok) {
      const err = await validationRes.text();
      console.error("Validation error:", err);
      // Continue anyway on validation error, don't block user
    } else {
      const validationData = await validationRes.json();
      const validationRaw = validationData.choices?.[0]?.message?.content || "{}";
      const validationClean = validationRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      
      try {
        const validation = JSON.parse(validationClean);
        if (!validation.isValid) {
          return NextResponse.json(
            { 
              error: `These don't look like conversation screenshots. ${validation.reason || "Please upload text message threads only."}`,
              invalidImages: true 
            },
            { status: 400 }
          );
        }
      } catch {
        // Parse failed, continue to analysis
      }
    }

    // Step 2: Run full analysis
    const content: any[] = [
      {
        type: "text",
        text: `You are an elite psychologist specializing in conversational complexity, human psychology, and conflict resolution. A user has uploaded screenshots of an argument or conversation and wants a 3rd-party supergenius perspective.

${context ? `USER CONTEXT: ${context}` : ""}

Analyze the conversation screenshots and produce a structured JSON response with the following fields:

1. "verdict" (string): A detailed, 4-6 sentence neutral summary. Explain what each party wanted, where they collided, and the emotional arc of the exchange.
2. "turningPoint" (string): A detailed paragraph identifying the exact message or moment the tone shifted. Explain the specific words, the emotional trigger, and why it changed the trajectory of the conversation.
3. "psychologicalDynamics" (string): A rich, detailed paragraph describing attachment styles, defense mechanisms, projection, stonewalling, demand-withdraw patterns, or any relevant psychological frameworks. Connect these directly to specific messages or behaviors in the screenshots.
4. "translationLayer" (object with keys "personA" and "personB"): For each person, write 2-3 sentences translating what they were ACTUALLY feeling and needing underneath their words. Assign them descriptive labels (e.g., "The Planner — secretly anxious about uncertainty") based on their behavior in the conversation flow.
5. "pathForward" (array of strings): 3-4 detailed, actionable, non-judgmental recommendations. Each should feel like concrete advice a therapist would give, not generic platitudes.
6. "complexityScore" (number 1-10): Rate how emotionally/psychologically complex this argument is.
7. "fixability" (string): One sentence on whether this seems repairable and why.

Rules:
- Be incisive, specific, and compassionate.
- Avoid taking sides.
- Use psychological terminology where appropriate but explain it simply.
- Cite specific dynamics from the screenshots when possible.
- Output ONLY valid JSON. No markdown code blocks, no extra text.`,
      },
    ];

    for (const imageUrl of images) {
      content.push({
        type: "image_url",
        image_url: { url: imageUrl, detail: "low" },
      });
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a world-class psychologist and conflict mediator. You speak with authority, clarity, and empathy. You always return valid JSON.",
          },
          {
            role: "user",
            content: content,
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API error:", response.status, errorBody);
      return NextResponse.json(
        { error: `API error ${response.status}: ${errorBody}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    console.log("Raw response:", raw);

    let parsed: any = {};
    try {
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr);
      return NextResponse.json(
        { error: "The model returned an invalid format. Please try again.", raw },
        { status: 500 }
      );
    }

    const hasContent = Boolean(
      parsed.verdict ||
        parsed.turningPoint ||
        parsed.psychologicalDynamics ||
        parsed.complexityScore
    );

    if (!hasContent) {
      return NextResponse.json(
        {
          error: "The model returned empty fields. This usually means the model couldn't process the images or the wrong model/endpoint is being used.",
          raw,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed." },
      { status: 500 }
    );
  }
}
