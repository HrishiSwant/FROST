import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.post("/check", async (req, res) => {
  const { phone } = req.body;

  try {
    const n = await fetch(
      `https://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_KEY}&number=${phone}`
    );
    const numverify = await n.json();

    const a = await fetch(
      `https://phonevalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_KEY}&phone=${phone}`
    );
    const abstract = await a.json();

    let score = 0;
    if (!numverify.valid) score += 40;
    if (numverify.line_type === "voip") score += 30;
    if (abstract.is_disposable) score += 30;

    const risk = Math.min(score, 100);

    res.json({
      phone,
      country: numverify.country_name,
      carrier: numverify.carrier,
      type: numverify.line_type,
      valid: numverify.valid,
      location: abstract.location,
      fraudScore: risk,
      verdict: risk > 60 ? "High Risk" : "Safe",
    });
  } catch {
    res.status(500).json({ error: "Phone lookup failed" });
  }
});

export default router;

