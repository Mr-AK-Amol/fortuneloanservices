// Vercel serverless proxy for FormSubmit.
// Keeps the FormSubmit request server-to-server so browsers do not block it with CORS.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    let payload = req.body;
    if (typeof payload === "string") payload = JSON.parse(payload);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: "Invalid email payload." });
    }

    // Recipient is fixed server-side; clients cannot redirect submissions elsewhere.
    delete payload._captcha;
    payload._template = "table";

    const upstream = await fetch("https://formsubmit.co/ajax/loanservicesfortune@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const raw = await upstream.text();
    let result;
    try { result = JSON.parse(raw); }
    catch { result = { message: raw || "FormSubmit returned an unreadable response." }; }

    const accepted = upstream.ok && result && (result.success === true || result.success === "true");
    if (!accepted) {
      return res.status(502).json({
        success: false,
        message: result.message || `FormSubmit returned HTTP ${upstream.status}.`
      });
    }

    return res.status(200).json({ success: true, message: "FormSubmit accepted the email request." });
  } catch (error) {
    console.error("FormSubmit proxy error:", error);
    return res.status(502).json({ success: false, message: "Could not reach FormSubmit. Please try again." });
  }
};
