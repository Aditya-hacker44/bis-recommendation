import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Empty file provided." }, { status: 400 });
    }

    // Forward the file to the Python backend to use PyPDF2 (lighter and more stable)
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Check if API_URL is defined, else default
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const backendRes = await fetch(`${API_BASE}/api/extract_text`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Failed to extract text from document." }, { status: backendRes.status });
    }

    const backendData = await backendRes.json();
    let text = backendData.text || "";

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text could not be extracted from this document. OCR processing is required." }, { status: 400 });
    }

    // Clean text
    text = text.replace(/\s+/g, ' ').trim();

    // Mock NLP extraction of structured fields based on common tender keywords
    const lowerText = text.toLowerCase();

    const extractSection = (regex: RegExp) => {
      const match = text.match(regex);
      return match && match[1] ? match[1].trim() : "Not detected";
    };

    const extracted = {
      productName: extractSection(/(?:product name|equipment|item|procurement of)\\s*[:-]?\\s*([^\\n,.]+)/i),
      productDescription: extractSection(/(?:description|scope)\\s*[:-]?\\s*([^\\n]+(?:\\n[^\\n]+)?)/i),
      technicalSpecifications: extractSection(/(?:technical specifications|specifications|tech specs)\\s*[:-]?\\s*([^]+?)(?:\\n\\n|[A-Z][a-z]+:)/i),
      material: extractSection(/(?:material|made of)\\s*[:-]?\\s*([^\\n,.]+)/i),
      dimensions: extractSection(/(?:dimensions|size)\\s*[:-]?\\s*([^\\n,.]+)/i),
      capacity: extractSection(/(?:capacity)\\s*[:-]?\\s*([^\\n,.]+)/i),
      voltage: extractSection(/(?:voltage|power)\\s*[:-]?\\s*([^\\n,.]+)/i),
      application: extractSection(/(?:application|used for)\\s*[:-]?\\s*([^\\n,.]+)/i),
      requiredStandards: extractSection(/(?:standards|is code|is number|comply with)\\s*[:-]?\\s*([^\\n,.]+)/i),
      tenderRequirements: extractSection(/(?:tender requirements|eligibility)\\s*[:-]?\\s*([^]+?)(?:\\n\\n|[A-Z][a-z]+:)/i),
      rawText: text.substring(0, 5000) // Pass back raw text for fallback matching
    };

    // Fallbacks if regex fails
    if (extracted.productName === "Not detected") {
      const firstLine = text.split('.')[0].substring(0, 100);
      extracted.productName = firstLine;
    }

    return NextResponse.json({ success: true, extracted });

  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process document: " + err.message }, { status: 500 });
  }
}
