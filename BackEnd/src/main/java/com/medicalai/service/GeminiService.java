package com.medicalai.service;

import com.medicalai.dto.GeminiRequest;
import com.medicalai.dto.GeminiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    @Autowired
    private WebClient geminiWebClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelName;

    public String generateContent(String prompt, String analysisType) {
        try {
            // Build the prompt with medical context
            String medicalPrompt = buildMedicalPrompt(prompt, analysisType);

            // Create request
            GeminiRequest request = createRequest(medicalPrompt);

            // Log the API call details for debugging
            System.out.println("=== Gemini API Call ===");
            System.out.println("Model: " + modelName);
            System.out.println("Endpoint: /models/" + modelName + ":generateContent");

            // Call Gemini API
            GeminiResponse response = geminiWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", apiKey)
                            .build(modelName))
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response != null && 
                response.getCandidates() != null && 
                !response.getCandidates().isEmpty() &&
                response.getCandidates().get(0).getContent() != null &&
                response.getCandidates().get(0).getContent().getParts() != null &&
                !response.getCandidates().get(0).getContent().getParts().isEmpty()) {
                
                String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                if (text != null && !text.trim().isEmpty()) {
                    return text;
                }
            }
            
            return "Unable to generate analysis. The API response was empty or invalid.";
        } catch (WebClientResponseException e) {
            System.err.println("Gemini API HTTP Error: " + e.getStatusCode());
            System.err.println("Error Response Body: " + e.getResponseBodyAsString());
            e.printStackTrace();
            
            // Provide more helpful error message based on status code
            HttpStatusCode status = e.getStatusCode();
            int statusCode = status.value();
            if (statusCode == 404) {
                return "Error: Gemini API endpoint not found (404). Please check the model name '" + modelName + "' and API version in configuration.";
            } else if (statusCode == 401 || statusCode == 403) {
                return "Error: Invalid API key or insufficient permissions (401/403). Please check your Gemini API key.";
            } else if (statusCode == 429) {
                return "Error: API rate limit exceeded (429). Please try again later.";
            } else {
                return "Error calling Gemini API: " + statusCode + " - " + e.getMessage();
            }
        } catch (Exception e) {
            System.err.println("Exception calling Gemini API: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("404")) {
                return "Error: Gemini API endpoint not found. Please check the model name and API version in configuration.";
            } else if (errorMsg != null && (errorMsg.contains("401") || errorMsg.contains("403"))) {
                return "Error: Invalid API key or insufficient permissions. Please check your Gemini API key.";
            } else if (errorMsg != null && errorMsg.contains("429")) {
                return "Error: API rate limit exceeded. Please try again later.";
            } else {
                return "Error calling Gemini API: " + (errorMsg != null ? errorMsg : e.getClass().getSimpleName());
            }
        }
    }

    private String buildMedicalPrompt(String inputData, String analysisType) {
        // Check if this is a voice consultation request (has custom prompt with follow-up question instructions)
        if ("Symptom Analysis".equals(analysisType) && 
            (inputData.contains("CRITICAL INSTRUCTIONS") || 
             inputData.contains("followUpQuestion") || 
             inputData.contains("follow-up question") ||
             inputData.contains("PREVIOUS QUESTIONS ASKED"))) {
            // This is a voice consultation - use the custom prompt as-is
            // The frontend has already built a specialized prompt for cross-questioning
            System.out.println("=== Voice Consultation Request Detected ===");
            System.out.println("Using custom prompt from frontend (length: " + inputData.length() + " chars)");
            return inputData; // Return the custom prompt directly
        }

        // Special handling for Health Story - bypass JSON enforcement to allow narrative format
        if ("Health Story".equals(analysisType)) {
            System.out.println("=== Health Story Request Detected ===");
            return "You are an empathetic medical AI narrator. " + inputData;
        }

        // Special handling for Patient Q&A (Ask AI) - bypass JSON enforcement to allow Q&A format
        if ("Patient Q&A".equals(analysisType)) {
            System.out.println("=== Patient Q&A Request Detected ===");
            return inputData; // Return the prompt constructed in HealthStoryService directly
        }
        
        StringBuilder prompt = new StringBuilder();
        
        // Add specialized context based on analysis type
        if ("General Analysis".equals(analysisType)) {
            prompt.append("You are a general medical AI system. Provide comprehensive analysis:\n");
            prompt.append("- Overall health assessment\n");
            prompt.append("- Symptom analysis and pattern recognition\n");
            prompt.append("- Risk factors identification\n");
            prompt.append("- General recommendations\n\n");
        } else if ("Diabetes".equals(analysisType)) {
            prompt.append("You are a specialized diabetes AI system. Focus on:\n");
            prompt.append("- Blood glucose levels, HbA1c, and metabolic markers\n");
            prompt.append("- Risk of complications (retinopathy, nephropathy, neuropathy)\n");
            prompt.append("- Insulin resistance patterns\n");
            prompt.append("- Lifestyle and medication recommendations\n\n");
        } else if ("Heart Attack/ECG".equals(analysisType) || analysisType.contains("ECG")) {
            prompt.append("You are a specialized cardiac AI system. Focus on:\n");
            prompt.append("- ECG interpretation and rhythm analysis\n");
            prompt.append("- Signs of myocardial infarction, arrhythmias, ischemia\n");
            prompt.append("- Cardiac risk stratification\n");
            prompt.append("- Emergency intervention recommendations\n\n");
        } else if ("MRI/Tumor".equals(analysisType) || analysisType.contains("MRI")) {
            prompt.append("You are a specialized radiology AI system. Focus on:\n");
            prompt.append("- MRI image interpretation and tumor detection\n");
            prompt.append("- Tumor characteristics (size, location, enhancement patterns)\n");
            prompt.append("- Malignancy probability and staging\n");
            prompt.append("- Follow-up imaging recommendations\n\n");
        } else if ("Blood Pressure".equals(analysisType)) {
            prompt.append("You are a specialized hypertension AI system. Focus on:\n");
            prompt.append("- Blood pressure patterns and variability\n");
            prompt.append("- Risk of cardiovascular events\n");
            prompt.append("- Medication optimization\n");
            prompt.append("- Lifestyle modifications\n\n");
        } else if ("TB".equals(analysisType) || analysisType.contains("Tuberculosis")) {
            prompt.append("You are a specialized infectious disease AI system. Focus on:\n");
            prompt.append("- TB screening and diagnostic markers\n");
            prompt.append("- Drug resistance patterns\n");
            prompt.append("- Treatment protocols and compliance\n");
            prompt.append("- Contact tracing recommendations\n\n");
        } else if ("Blood Report Analysis".equals(analysisType)) {
            prompt.append("You are a specialized laboratory AI system. Focus on:\n");
            prompt.append("- Complete blood count (CBC) interpretation\n");
            prompt.append("- Liver function, kidney function, lipid profiles\n");
            prompt.append("- Inflammatory markers and infection indicators\n");
            prompt.append("- Abnormal value flagging and clinical significance\n\n");
        }
        
        prompt.append("You are an advanced medical AI system built for early disease detection, explainable clinical reasoning, and decision-support.\n\n");
        prompt.append("Your role is to analyze patient medical data holistically and generate a structured, human-readable medical intelligence report that can be directly displayed in a modern healthcare dashboard.\n\n");
        prompt.append("The goal is NOT just diagnosis, but:\n");
        prompt.append("• early-stage detection\n");
        prompt.append("• risk prediction\n");
        prompt.append("• explainability\n");
        prompt.append("• safety-aware recommendations\n");
        prompt.append("• clinician-friendly insights\n\n");
        prompt.append("==================================================\n");
        prompt.append("PATIENT MEDICAL DATA\n");
        prompt.append("==================================================\n");
        prompt.append(inputData).append("\n\n");
        prompt.append("==================================================\n");
        prompt.append("REQUIRED OUTPUT FORMAT\n");
        prompt.append("==================================================\n\n");
        prompt.append("You MUST respond with a valid JSON object containing the following structure:\n\n");
        prompt.append("{\n");
        prompt.append("  \"primaryClinicalSummary\": \"Provide a short, clear summary (3–4 lines) describing patient condition, severity, and overall clinical stability\",\n");
        prompt.append("  \"primaryClinicalImpression\": \"Most likely medical condition or pattern observed. Use professional but easy-to-understand language. Avoid definitive diagnosis wording unless clearly supported\",\n");
        prompt.append("  \"diseaseStage\": {\n");
        prompt.append("    \"stage\": \"Early | Intermediate | Advanced\",\n");
        prompt.append("    \"explanation\": [\"Reason 1\", \"Reason 2\", \"Reason 3\"]\n");
        prompt.append("  },\n");
        prompt.append("  \"riskAssessment\": {\n");
        prompt.append("    \"overallRiskLevel\": \"Low | Moderate | High\",\n");
        prompt.append("    \"riskOfProgression\": \"percentage as number (e.g., 25)\",\n");
        prompt.append("    \"confidenceScore\": \"percentage as number (e.g., 85)\",\n");
        prompt.append("    \"riskFactors\": \"Brief explanation of what influences the risk level\"\n");
        prompt.append("  },\n");
        prompt.append("  \"keyIndicators\": [\n");
        prompt.append("    \"Radiological findings (if present)\",\n");
        prompt.append("    \"Clinical symptoms\",\n");
        prompt.append("    \"Vital signs\",\n");
        prompt.append("    \"Laboratory markers\",\n");
        prompt.append("    \"Protective factors (young age, no comorbidities, etc.)\",\n");
        prompt.append("    \"Risk factors (if any)\"\n");
        prompt.append("  ],\n");
        prompt.append("  \"differentialDiagnosis\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"condition\": \"Condition name\",\n");
        prompt.append("      \"likelihood\": \"High | Moderate | Low\",\n");
        prompt.append("      \"justification\": \"One-line justification\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"recommendations\": {\n");
        prompt.append("    \"immediateActions\": [\"Action 1\", \"Action 2\"],\n");
        prompt.append("    \"furtherDiagnosticEvaluation\": [\"Test 1\", \"Test 2\"],\n");
        prompt.append("    \"monitoringAndFollowUp\": [\"What to monitor\", \"When to re-evaluate\"]\n");
        prompt.append("  },\n");
        prompt.append("  \"warningSigns\": [\n");
        prompt.append("    \"Symptoms that require urgent medical attention\",\n");
        prompt.append("    \"Scenarios where immediate clinician review is mandatory\"\n");
        prompt.append("  ],\n");
        prompt.append("  \"uncertaintyAndLimitations\": \"Briefly explain what information is missing or limited, how this affects confidence, and why human medical judgment remains important\",\n");
        prompt.append("  \"finalAINote\": \"Short, responsible disclaimer: This analysis supports decision-making. It does not replace professional medical evaluation.\"\n");
        prompt.append("}\n\n");
        prompt.append("IMPORTANT GUIDELINES:\n");
        prompt.append("• Be medically accurate but readable\n");
        prompt.append("• Use clear, structured data\n");
        prompt.append("• Avoid unnecessary alarmist language\n");
        prompt.append("• Focus on early detection and prevention\n");
        prompt.append("• Output MUST be valid JSON only - no markdown, no additional text\n");
        prompt.append("• Ensure all arrays contain at least 2-3 items where applicable\n");
        prompt.append("• All percentages should be numbers (not strings with %)\n\n");
        prompt.append("Return ONLY the JSON object, no other text or explanation.");
        
        return prompt.toString();
    }

    private GeminiRequest createRequest(String prompt) {
        GeminiRequest request = new GeminiRequest();
        List<GeminiRequest.Content> contents = new ArrayList<>();
        
        GeminiRequest.Content content = new GeminiRequest.Content();
        List<GeminiRequest.Part> parts = new ArrayList<>();
        
        GeminiRequest.Part part = new GeminiRequest.Part();
        part.setText(prompt);
        parts.add(part);
        
        content.setParts(parts);
        contents.add(content);
        
        request.setContents(contents);
        return request;
    }

    public String extractConfidenceScore(GeminiResponse response) {
        // Extract confidence or safety ratings if available
        if (response != null && 
            response.getCandidates() != null && 
            !response.getCandidates().isEmpty() &&
            response.getCandidates().get(0).getSafetyRatings() != null) {
            
            // Check if content was blocked
            boolean blocked = response.getCandidates().get(0).getSafetyRatings().stream()
                    .anyMatch(rating -> "HIGH".equals(rating.getProbability()) || "MEDIUM".equals(rating.getProbability()));
            
            if (blocked) {
                return "Content filtered - may contain unsafe content";
            }
        }
        return "85%"; // Default confidence score
    }
}

