// ============================================================
// server/utils/aiVerification.js
// AI-Powered Image Verification for Safety Reports
// Uses: Gemini, Groq (Llama), and Mistral for multi-model verification
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
// HELPER: Fetch image from URL and convert to base64
// ============================================================
async function imageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return { base64, contentType };
  } catch (err) {
    console.error('[imageUrlToBase64] Error:', err.message);
    throw err;
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
// VERIFIER 1 — Gemini 2.0 Flash (Google AI Studio)
// ============================================================
async function verifyWithGemini(imageUrl, issueType) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured');
    return createErrorResponse('gemini', 'API key not configured');
  }

  try {
    console.log('[Gemini] Starting verification...');
    
    const { base64, contentType } = await imageUrlToBase64(imageUrl);

    const body = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: contentType,
                data: base64,
              },
            },
            {
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
- Be specific about what you observe in the image`
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500
      }
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await res.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response text from Gemini');
    }

    const parsed = parseAIResponse(text);
    console.log('[Gemini] Success - isRelevant:', parsed.isRelevant);
    
    return { source: "gemini", ...parsed };
  } catch (err) {
    console.error("[Gemini] Error:", err.message);
    return createErrorResponse('gemini', err.message);
  }
}

// ============================================================
// VERIFIER 2 — Groq + Llama Vision
// ============================================================
async function verifyWithGroq(imageUrl, issueType) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Groq] API key not configured');
    return createErrorResponse('groq', 'API key not configured');
  }

  try {
    console.log('[Groq] Starting verification...');

    const body = {
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
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
- Be specific about what you observe in the image`
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.2
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
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
    console.log('[Groq] Success - isRelevant:', parsed.isRelevant);
    
    return { source: "groq", ...parsed };
  } catch (err) {
    console.error("[Groq] Error:", err.message);
    return createErrorResponse('groq', err.message);
  }
}

// ============================================================
// VERIFIER 3 — Mistral Pixtral 12B (Vision)
// ============================================================
async function verifyWithMistral(imageUrl, issueType) {
  if (!mistralClient || !process.env.MISTRAL_API_KEY) {
    console.warn('[Mistral] Not configured or SDK not installed');
    return createErrorResponse('mistral', 'Mistral not configured');
  }

  try {
    console.log('[Mistral] Starting verification...');

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
    console.log('[Mistral] Success - isRelevant:', parsed.isRelevant);
    
    return { source: "mistral", ...parsed };
  } catch (err) {
    console.error("[Mistral] Error:", err.message);
    return createErrorResponse('mistral', err.message);
  }
}

// ============================================================
// SUMMARIZER — Groq + Llama 3.3 70B (Text only)
// Combines the 3 vision results into one final verdict
// ============================================================
async function summarizeWithGroq(results, issueType) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Summarizer] Groq API key not configured');
    return createFallbackVerdict(results);
  }

  try {
    console.log('[Summarizer] Creating final verdict...');

    const prompt = `You are a safety verification system for student accommodations.
Three AI vision models analyzed an image submitted with a complaint about: "${issueType}".

Here are their results:
${JSON.stringify(results, null, 2)}

Based on all three analyses, determine the final verdict.

Return ONLY valid JSON with no extra text or markdown:
{
  "finalVerdict": "VERIFIED" or "REJECTED" or "NEEDS_REVIEW",
  "overallSeverity": "low" or "medium" or "high" or "none",
  "confidenceScore": number between 0 and 1,
  "summary": "one clear sentence explaining the verdict",
  "recommendAdminReview": true or false
}

Decision Rules:
1. VERIFIED = at least 2 of 3 models say isRelevant=true AND confidence > 0.5
2. REJECTED = at least 2 of 3 models say isRelevant=false AND confidence > 0.6
3. NEEDS_REVIEW = models disagree, confidence is low, or errors occurred
4. recommendAdminReview = true if severity is "high" OR verdict is "NEEDS_REVIEW" OR any model had errors
5. Use the average confidence from successful models
6. Choose the highest severity reported by any model`;

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
    console.log('[Summarizer] Final verdict:', parsed.finalVerdict);
    
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

  // Count votes
  const relevantVotes = successfulResults.filter(r => r.isRelevant === true).length;
  const irrelevantVotes = successfulResults.filter(r => r.isRelevant === false).length;
  
  // Calculate average confidence
  const avgConfidence = successfulResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successfulResults.length;
  
  // Find highest severity
  const severityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'none': 0 };
  const maxSeverity = successfulResults.reduce((max, r) => {
    const current = severityOrder[r.severity] || 0;
    const maxVal = severityOrder[max] || 0;
    return current > maxVal ? r.severity : max;
  }, 'none');

  let finalVerdict;
  if (relevantVotes >= 2) {
    finalVerdict = "VERIFIED";
  } else if (irrelevantVotes >= 2) {
    finalVerdict = "REJECTED";
  } else {
    finalVerdict = "NEEDS_REVIEW";
  }

  return {
    finalVerdict,
    overallSeverity: maxSeverity,
    confidenceScore: Math.round(avgConfidence * 100) / 100,
    summary: `${relevantVotes} of ${successfulResults.length} models found the image relevant.`,
    recommendAdminReview: finalVerdict === "NEEDS_REVIEW" || maxSeverity === "high"
  };
}

// ============================================================
// MAIN EXPORT — Verify a report image
// ============================================================
async function verifyReportImage(imageUrl, issueType) {
  const startTime = Date.now();
  
  try {
    console.log('================================================');
    console.log('[AI Verification] Starting multi-model verification');
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

    // ✅ Run all 3 vision models in parallel
    const [geminiResult, groqResult, mistralResult] = await Promise.allSettled([
      verifyWithGemini(imageUrl, issueType),
      verifyWithGroq(imageUrl, issueType),
      verifyWithMistral(imageUrl, issueType),
    ]);

    // Extract results (handle Promise.allSettled)
    const results = [
      geminiResult.status === 'fulfilled' ? geminiResult.value : createErrorResponse('gemini', 'Promise rejected'),
      groqResult.status === 'fulfilled' ? groqResult.value : createErrorResponse('groq', 'Promise rejected'),
      mistralResult.status === 'fulfilled' ? mistralResult.value : createErrorResponse('mistral', 'Promise rejected'),
    ];

    console.log('[AI Verification] Individual results:');
    console.log('  - Gemini:', results[0].isRelevant, '| Error:', results[0].error || 'none');
    console.log('  - Groq:', results[1].isRelevant, '| Error:', results[1].error || 'none');
    console.log('  - Mistral:', results[2].isRelevant, '| Error:', results[2].error || 'none');

    // ✅ Summarize into final verdict
    const verdict = await summarizeWithGroq(results, issueType);

    const duration = Date.now() - startTime;
    console.log(`[AI Verification] Completed in ${duration}ms`);
    console.log(`[AI Verification] Final Verdict: ${verdict.finalVerdict}`);
    console.log('================================================');

    return {
      success: true,
      verdict: verdict.finalVerdict,
      severity: verdict.overallSeverity,
      confidence: verdict.confidenceScore,
      summary: verdict.summary,
      recommendAdminReview: verdict.recommendAdminReview,
      details: {
        gemini: results[0],
        groq: results[1],
        mistral: results[2],
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
        gemini: null,
        groq: null,
        mistral: null,
        error: err.message
      },
      timestamp: new Date().toISOString(),
      processingTimeMs: duration
    };
  }
}

module.exports = { verifyReportImage };