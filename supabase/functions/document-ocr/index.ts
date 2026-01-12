// Supabase Edge Function for Document OCR with Gemini Vision API
// Securely analyzes identity documents and extracts structured data

// deno-lint-ignore-file
// @ts-nocheck - This file runs in Deno runtime, not Node.js

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Document types we can analyze
type OcrDocumentType =
    | 'cni'
    | 'passport'
    | 'birth_certificate'
    | 'residence_proof'
    | 'family_record'
    | 'diploma'
    | 'health_card'
    | 'driving_license'
    | 'other'

interface ExtractedData {
    lastName?: string
    firstName?: string
    dateOfBirth?: string
    placeOfBirth?: string
    nationality?: string
    address?: string
    city?: string
    postalCode?: string
    fatherName?: string
    motherName?: string
    documentNumber?: string
    expiryDate?: string
    issueDate?: string
}

interface AnalysisResult {
    documentType: OcrDocumentType
    detectedSide?: 'front' | 'back'
    confidence: number
    extractedData: ExtractedData
    uncertainFields: string[]
    suggestedFolder: string
    rawText?: string
    error?: string
}

// Gemini prompt for document analysis
const getAnalysisPrompt = (documentType?: OcrDocumentType) => `
Tu es un expert en reconnaissance de documents d'identité gabonais et internationaux.
Analyse cette image de document et extrait les informations suivantes au format JSON.

${documentType ? `Type de document attendu: ${documentType}` : 'Détecte automatiquement le type de document.'}

Types de documents reconnus:
- cni: Carte Nationale d'Identité Gabonaise
- passport: Passeport (Gabonais ou international)
- birth_certificate: Acte de Naissance
- residence_proof: Justificatif de domicile (facture SEEG, eau, etc.)
- family_record: Livret de Famille
- diploma: Diplôme ou certificat
- health_card: Carte CNAMGS ou assurance santé
- driving_license: Permis de Conduire
- other: Autre document

Extrait les informations suivantes si présentes:
- lastName: Nom de famille
- firstName: Prénom(s)
- dateOfBirth: Date de naissance (format YYYY-MM-DD)
- placeOfBirth: Lieu de naissance
- nationality: Nationalité
- address: Adresse complète
- city: Ville
- postalCode: Code postal
- fatherName: Nom du père
- motherName: Nom de la mère
- documentNumber: Numéro du document
- expiryDate: Date d'expiration (format YYYY-MM-DD)
- issueDate: Date de délivrance (format YYYY-MM-DD)

Détecte également si c'est le recto ou verso du document.

Réponds UNIQUEMENT avec un JSON valide dans ce format:
{
  "documentType": "type_detecté",
  "detectedSide": "front" ou "back" ou null,
  "confidence": 0.0 à 1.0,
  "extractedData": { ...données extraites... },
  "uncertainFields": ["champs_incertains"],
  "suggestedFolder": "identity|civil_status|residence|education|health|vehicle|other"
}
`

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { imageBase64, mimeType, documentType } = await req.json()

        if (!imageBase64) {
            return new Response(
                JSON.stringify({ error: 'Image base64 requise' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get Gemini API key from environment
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY not configured')
            return new Response(
                JSON.stringify({ error: 'Service OCR non configuré' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[DocumentOCR] Analyzing document, type hint: ${documentType || 'auto'}`)

        // Call Gemini Vision API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: getAnalysisPrompt(documentType)
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType || 'image/jpeg',
                                        data: imageBase64
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('[DocumentOCR] Gemini API error:', errorText)
            return new Response(
                JSON.stringify({ error: 'Erreur du service de reconnaissance' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const geminiData = await geminiResponse.json()

        // Extract the text response
        const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        if (!textContent) {
            console.error('[DocumentOCR] No text content in response')
            return new Response(
                JSON.stringify({ error: 'Aucune donnée extraite' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse JSON from response (may be wrapped in markdown code blocks)
        let analysisResult: AnalysisResult
        try {
            // Remove markdown code blocks if present
            let jsonString = textContent
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/gi, '')
                .trim()

            analysisResult = JSON.parse(jsonString)
        } catch (parseError) {
            console.error('[DocumentOCR] JSON parse error:', parseError)
            console.error('[DocumentOCR] Raw response:', textContent)

            // Return partial result with raw text
            analysisResult = {
                documentType: documentType || 'other',
                confidence: 0.3,
                extractedData: {},
                uncertainFields: [],
                suggestedFolder: 'other',
                rawText: textContent,
                error: 'Impossible de parser la réponse'
            }
        }

        console.log(`[DocumentOCR] Analysis complete, confidence: ${analysisResult.confidence}`)

        return new Response(
            JSON.stringify(analysisResult),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error: unknown) {
        console.error('[DocumentOCR] Function error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erreur interne'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
