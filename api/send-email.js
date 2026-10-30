// Vercel serverless function: send website enquiries through Resend.
// Set RESEND_API_KEY in Vercel Project Settings > Environment Variables.
// The recipient and sender are fixed server-side to prevent client-side redirection.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return res.status(500).json({
      success: false,
      message: "Email service is not configured. Please contact us directly."
    });
  }

  try {
    let payload = req.body;
    if (typeof payload === "string") payload = JSON.parse(payload);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: "Invalid email payload." });
    }

    // Ignore client-supplied provider/system fields and keep delivery destination fixed.
    const subject = String(payload._subject || "New Fortune Loan Services Website Enquiry")
      .replace(/[\r\n]+/g, " ").slice(0, 180);

    const entries = Object.entries(payload)
      .filter(([key]) => !key.startsWith("_") && !["to", "from", "cc", "bcc", "reply_to"].includes(key.toLowerCase()))
      .map(([key, value]) => {
        const safeValue = Array.isArray(value) ? value.join(", ")
          : (value === null || value === undefined ? "" : String(value));
        return [String(key).slice(0, 180), safeValue.slice(0, 12000)];
      })
      .filter(([, value]) => value.trim() !== "");

    if (!entries.length) {
      return res.status(400).json({ success: false, message: "No enquiry details were received." });
    }

    const escapeHtml = (value) => value.replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);

    const htmlRows = entries.map(([key, value]) =>
      `<tr><th align="left" style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc">${escapeHtml(key)}</th><td style="padding:10px;border:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    ).join("");

    const textBody = entries.map(([key, value]) => `${key}: ${value}`).join("\n\n");

    const upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Fortune Loan Services <notifications@fortuneloan.services>",
        to: ["loanservicesfortune@gmail.com"],
        subject,
        html: `<div style="font-family:Arial,sans-serif;color:#172033"><h2>Fortune Loan Services — Website Enquiry</h2><table style="border-collapse:collapse;width:100%;max-width:760px">${htmlRows}</table></div>`,
        text: textBody
      })
    });

    const raw = await upstream.text();
    let result = {};
    try { result = raw ? JSON.parse(raw) : {}; } catch { result = { message: raw }; }

    if (!upstream.ok) {
      console.error("Resend API error:", upstream.status, result);
      const detail = result.message || result.name || `Resend returned HTTP ${upstream.status}.`;
      return res.status(502).json({
        success: false,
        message: `Email could not be submitted: ${String(detail).slice(0, 300)}`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resend accepted the email request.",
      id: result.id || null
    });
  } catch (error) {
    console.error("Resend email function error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit the email right now. Please try again."
    });
  }
};
