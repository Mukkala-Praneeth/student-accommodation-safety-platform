// ============================================================
// server/utils/aiVerification.js
// AI-Powered Image Verification for Safety Reports
// Uses: Mistral (Vision) + Groq (Text Analysis) for reliable verification
// ============================================================

// ✅ Conditional Mistral import
let Mistral;
try {
  const mistralModule = require("@mistralai/mistralai");
  Mistral = mistralModule.Mistral;
  console.log('[AI Verification] Mistral SDK loaded');
} catch (err) {
  console.warn('[AI Verification] Mistral SDK not installed. Run: npm install @mistralai/mistralai');
}

// ✅ Initialize Mistral client if available
let mistralClient;
if (Mistral && process.env.MISTRAL_API_KEY) {
  try {
    mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    console.log('[AI Verification] Mistral client initialized');
  } catch (err) {
    console.warn('[AI Verification] Mistral client initialization failed:', err.message);
  }
}

// ============================================================
// HELPER: Parse AI response JSON safely
// ============================================================
function parseAIResponse(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid response');
  }

  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try to find JSON object in response
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  return JSON.parse(clean);
}

// ============================================================
// HELPER: Create default error response
// ============================================================
function createErrorResponse(source, errorMessage) {
  return {
    source,
    error: errorMessage,
    isRelevant: null,
    issueDetected: 'Error',
    severity: 'none',
    confidence: 0,
    redFlags: [],
    description: `Verification failed: ${errorMessage}`
  };
}

// ============================================================
// VERIFIER 1 — Mistral Pixtral 12B (Primary Vision Model)
// ✅ Working perfectly - analyzes actual image content
// ============================================================
async function verifyWithMistral(imageUrl, issueType) {
  if (!mistralClient || !process.env.MISTRAL_API_KEY) {
    console.warn('[Mistral] Not configured or SDK not installed');
    return createErrorResponse('mistral', 'Mistral not configured');
  }

  try {
    console.log('[Mistral] Starting vision analysis...');

    const response = await mistralClient.chat.complete({
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              imageUrl: imageUrl,
            },
            {
              type: "text",
              text: `You are a complaint verification system for a student accommodation safety platform.
A student submitted a complaint about: "${issueType}".

Analyze this image carefully and determine if it shows evidence related to the complaint type.

Return ONLY valid JSON with no extra text, markdown, or explanation:
{
  "isRelevant": true or false,
  "issueDetected": "short description of what you see in the image",
  "severity": "low" or "medium" or "high" or "none",
  "confidence": number between 0 and 1,
  "redFlags": ["list", "of", "specific", "concerns"],
  "description": "detailed explanation of your analysis"
}

Guidelines:
- isRelevant = true if the image shows evidence related to "${issueType}"
- severity = "high" for health hazards, "medium" for inconveniences, "low" for minor issues
- confidence = how certain you are about your assessment (0.0 to 1.0)
- Be strict: only mark as relevant if you clearly see evidence of the reported issue
- Be specific about what you observe in the image`
            },
          ],
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No response text from Mistral');
    }

    const parsed = parseAIResponse(text);
    console.log('[Mistral] Success - isRelevant:', parsed.isRelevant, '| Confidence:', parsed.confidence);

    return { source: "mistral", ...parsed };
  } catch (err) {
    console.error("[Mistral] Error:", err.message);
    return createErrorResponse('mistral', err.message);
  }
}

// ============================================================
// VERIFIER 2 — Groq + Llama 3.3 (Context Analysis)
// ✅ Analyzes complaint context and plausibility
// ============================================================
async function verifyWithGroq(imageUrl, issueType) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Groq] API key not configured');
    return createErrorResponse('groq', 'API key not configured');
  }

  try {
    console.log('[Groq] Starting context analysis...');

    const prompt = `You are a complaint verification system for a student accommodation safety platform.

A student submitted a complaint about: "${issueType}" and provided an image as evidence.

Analyze the complaint type and assess its legitimacy based on common accommodation safety issues.

Consider these factors:
1. Is "${issueType}" a valid and common accommodation safety concern?
2. Would this type of issue typically have visual evidence?
3. Is this complaint category prone to abuse or fake reports?
4. What severity level is typically associated with "${issueType}" issues?

Return ONLY valid JSON with no extra text, markdown, or explanation:
{
  "isRelevant": true or false,
  "issueDetected": "Assessment of complaint type validity",
  "severity": "low" or "medium" or "high" or "none",
  "confidence": number between 0 and 1,
  "redFlags": ["list of concerns or validation points"],
  "description": "detailed reasoning for your assessment"
}

Be objective and base your analysis on:
- Common accommodation safety issues (food safety, water quality, hygiene, infrastructure, security)
- Typical severity levels for this complaint category
- Whether image evidence is appropriate for this issue type

Note: This is a context-based assessment to complement image analysis from other AI models.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'Groq API error');
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No response text from Groq');
    }

    const parsed = parseAIResponse(text);
    console.log('[Groq] Success - isRelevant:', parsed.isRelevant, '| Confidence:', parsed.confidence);

    return { source: "groq", ...parsed };
  } catch (err) {
    console.error("[Groq] Error:", err.message);
    return createErrorResponse('groq', err.message);
  }
}

// ============================================================
// SUMMARIZER — Groq + Llama 3.3 70B
// Combines vision + context analysis into final verdict
// ============================================================
async function summarizeWithGroq(results, issueType) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Summarizer] Groq API key not configured');
    return createFallbackVerdict(results);
  }

  try {
    console.log('[Summarizer] Creating final verdict...');

    const prompt = `You are a safety verification system for student accommodations.

Two AI systems analyzed a complaint about: "${issueType}":
1. Mistral Vision Model: Analyzed the actual image content
2. Context Analyzer: Assessed complaint validity and severity

Here are their results:
${JSON.stringify(results, null, 2)}

Based on both analyses, determine the final verdict.

Return ONLY valid JSON with no extra text or markdown:
{
  "finalVerdict": "VERIFIED" or "REJECTED" or "NEEDS_REVIEW",
  "overallSeverity": "low" or "medium" or "high" or "none",
  "confidenceScore": number between 0 and 1,
  "summary": "one clear sentence explaining the verdict",
  "recommendAdminReview": true or false
}

Decision Rules:
1. VERIFIED = Mistral vision model confirms isRelevant=true AND confidence > 0.6
2. REJECTED = Mistral vision model confirms isRelevant=false AND confidence > 0.7
3. NEEDS_REVIEW = Low confidence, models disagree, or errors occurred
4. Prioritize Mistral's vision analysis over context analysis
5. recommendAdminReview = true if:
   - Severity is "high"
   - Confidence < 0.7
   - Models strongly disagree
   - Any errors occurred
6. Use average confidence from successful models
7. Use highest severity reported`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No response from summarizer');
    }

    const parsed = parseAIResponse(text);
    console.log('[Summarizer] Final verdict:', parsed.finalVerdict, '| Confidence:', parsed.confidenceScore);

    return parsed;
  } catch (err) {
    console.error("[Summarizer] Error:", err.message);
    return createFallbackVerdict(results);
  }
}

// ============================================================
// HELPER: Create fallback verdict when summarizer fails
// ============================================================
function createFallbackVerdict(results) {
  // Count successful results
  const successfulResults = results.filter(r => r.isRelevant !== null && !r.error);

  if (successfulResults.length === 0) {
    return {
      finalVerdict: "NEEDS_REVIEW",
      overallSeverity: "unknown",
      confidenceScore: 0,
      summary: "All AI models failed - manual review required.",
      recommendAdminReview: true
    };
  }

  // Prioritize Mistral (vision model)
  const mistralResult = results.find(r => r.source === 'mistral' && !r.error);
  
  let finalVerdict;
  let summary;
  
  if (mistralResult && mistralResult.isRelevant !== null) {
    // Use Mistral's decision as primary
    if (mistralResult.isRelevant && mistralResult.confidence > 0.6) {
      finalVerdict = "VERIFIED";
      summary = `Vision analysis confirmed the reported issue with ${Math.round(mistralResult.confidence * 100)}% confidence.`;
    } else if (!mistralResult.isRelevant && mistralResult.confidence > 0.7) {
      finalVerdict = "REJECTED";
      summary = `Vision analysis found no evidence of the reported issue with ${Math.round(mistralResult.confidence * 100)}% confidence.`;
    } else {
      finalVerdict = "NEEDS_REVIEW";
      summary = `Vision analysis was inconclusive (${Math.round(mistralResult.confidence * 100)}% confidence) - admin review recommended.`;
    }
  } else {
    // Fallback to voting system
    const relevantVotes = successfulResults.filter(r => r.isRelevant === true).length;
    const irrelevantVotes = successfulResults.filter(r => r.isRelevant === false).length;
    
    if (relevantVotes > irrelevantVotes) {
      finalVerdict = "VERIFIED";
      summary = `${relevantVotes} of ${successfulResults.length} models found the complaint relevant.`;
    } else if (irrelevantVotes > relevantVotes) {
      finalVerdict = "REJECTED";
      summary = `${irrelevantVotes} of ${successfulResults.length} models found the complaint not relevant.`;
    } else {
      finalVerdict = "NEEDS_REVIEW";
      summary = "Models disagreed - manual review required.";
    }
  }

  // Calculate average confidence
  const avgConfidence = successfulResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successfulResults.length;

  // Find highest severity
  const severityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'none': 0 };
  const maxSeverity = successfulResults.reduce((max, r) => {
    const current = severityOrder[r.severity] || 0;
    const maxVal = severityOrder[max] || 0;
    return current > maxVal ? r.severity : max;
  }, 'none');

  return {
    finalVerdict,
    overallSeverity: maxSeverity,
    confidenceScore: Math.round(avgConfidence * 100) / 100,
    summary,
    recommendAdminReview: finalVerdict === "NEEDS_REVIEW" || maxSeverity === "high" || avgConfidence < 0.7
  };
}

// ============================================================
// MAIN EXPORT — Verify a report image
// ============================================================
async function verifyReportImage(imageUrl, issueType) {
  const startTime = Date.now();

  try {
    console.log('================================================');
    console.log('[AI Verification] Starting 2-model verification system');
    console.log(`[AI Verification] Issue Type: ${issueType}`);
    console.log(`[AI Verification] Image URL: ${imageUrl.substring(0, 80)}...`);
    console.log('================================================');

    // ✅ Validate inputs
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid or missing image URL');
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw new Error('Image URL must start with http:// or https://');
    }

    if (!issueType || typeof issueType !== 'string') {
      throw new Error('Invalid or missing issue type');
    }

    // ✅ Run both models in parallel
    const [mistralResult, groqResult] = await Promise.allSettled([
      verifyWithMistral(imageUrl, issueType),
      verifyWithGroq(imageUrl, issueType),
    ]);

    // Extract results
    const results = [
      mistralResult.status === 'fulfilled' ? mistralResult.value : createErrorResponse('mistral', 'Promise rejected'),
      groqResult.status === 'fulfilled' ? groqResult.value : createErrorResponse('groq', 'Promise rejected'),
    ];

    console.log('[AI Verification] Individual results:');
    console.log('  - Mistral (Vision):', results[0].isRelevant, '| Confidence:', results[0].confidence, '| Error:', results[0].error || 'none');
    console.log('  - Groq (Context):', results[1].isRelevant, '| Confidence:', results[1].confidence, '| Error:', results[1].error || 'none');

    // ✅ Summarize into final verdict
    const verdict = await summarizeWithGroq(results, issueType);

    const duration = Date.now() - startTime;
    console.log(`[AI Verification] Completed in ${duration}ms`);
    console.log(`[AI Verification] Final Verdict: ${verdict.finalVerdict}`);
    console.log(`[AI Verification] Confidence: ${verdict.confidenceScore}`);
    console.log(`[AI Verification] Summary: ${verdict.summary}`);
    console.log('================================================');

    return {
      success: true,
      verdict: verdict.finalVerdict,
      severity: verdict.overallSeverity,
      confidence: verdict.confidenceScore,
      summary: verdict.summary,
      recommendAdminReview: verdict.recommendAdminReview,
      details: {
        mistral: results[0],
        groq: results[1],
      },
      timestamp: new Date().toISOString(),
      processingTimeMs: duration
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[AI Verification] Fatal error after ${duration}ms:`, err.message);

    return {
      success: false,
      verdict: "NEEDS_REVIEW",
      severity: "unknown",
      confidence: 0,
      summary: `Verification system error: ${err.message}`,
      recommendAdminReview: true,
      details: {
        mistral: null,
        groq: null,
        error: err.message
      },
      timestamp: new Date().toISOString(),
      processingTimeMs: duration
    };
  }
}

module.exports = { verifyReportImage };