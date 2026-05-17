/**
 * Optional AI schedule parse (set OPENAI_API_KEY in Netlify).
 * POST JSON: { "text": "raw roster text..." } or { "imageBase64": "...", "mimeType": "image/png" }
 */

const MODEL = "gpt-4o-mini";

const SYSTEM = `You extract airline crew layover trips from schedules. Return ONLY valid JSON:
{"legs":[{"airportCode":"DFW","arrivalDate":"YYYY-MM-DD","departureDate":"YYYY-MM-DD"},...]}
Use 3-letter IATA codes. Dates must be ISO. One leg per layover city stay.`;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: "AI parsing not configured. Use CSV import or paste text instead."
      })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const messages = [{ role: "system", content: SYSTEM }];

  if (body.imageBase64 && body.mimeType) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: "Extract layover legs from this crew schedule image." },
        {
          type: "image_url",
          image_url: { url: `data:${body.mimeType};base64,${body.imageBase64}` }
        }
      ]
    });
  } else if (body.text) {
    messages.push({
      role: "user",
      content: `Extract layover legs:\n\n${body.text.slice(0, 12000)}`
    });
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: "Provide text or imageBase64" }) };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: `OpenAI error: ${err.slice(0, 200)}` }) };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.legs)) {
      return { statusCode: 502, body: JSON.stringify({ error: "Unexpected AI response shape" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legs: parsed.legs })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e instanceof Error ? e.message : "Parse failed" })
    };
  }
}
