export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history = [] } = req.body || {};
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Convert UI history to Gemini "contents"
    const contents = [
      ...history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: String(h.content || "") }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I didn’t get a response.";

    return res.status(200).json({ reply: text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
