package com.medicalai.service;

import com.medicalai.entity.AIAnalysis;
import com.medicalai.repository.AIAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Early-Warning Disease Intelligence Network
 * Aggregates patterns from millions of reports to detect emerging disease outbreaks early
 */
@Service
@Transactional
public class EarlyWarningService {

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private GeminiService geminiService;

    /**
     * Analyze aggregated patterns to detect disease outbreaks
     */
    public Map<String, Object> detectOutbreakPatterns(String region, String timePeriod) {
        // Get all analyses from the specified time period
        LocalDateTime startDate = LocalDateTime.now().minusDays(parseTimePeriod(timePeriod));
        List<AIAnalysis> recentAnalyses = aiAnalysisRepository.findAll()
                .stream()
                .filter(analysis -> analysis.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        // Aggregate patterns
        Map<String, Integer> diseaseCounts = new HashMap<>();
        
        for (AIAnalysis analysis : recentAnalyses) {
            String analysisType = analysis.getAnalysisType();
            diseaseCounts.put(analysisType, diseaseCounts.getOrDefault(analysisType, 0) + 1);
        }

        // Build prompt for AI analysis
        StringBuilder prompt = new StringBuilder();
        prompt.append("GLOBAL EARLY-WARNING DISEASE INTELLIGENCE ANALYSIS\n\n");
        prompt.append("Region: ").append(region != null ? region : "Global").append("\n");
        prompt.append("Time Period: ").append(timePeriod).append("\n\n");
        prompt.append("Disease Pattern Summary:\n");
        diseaseCounts.forEach((disease, count) -> 
            prompt.append("- ").append(disease).append(": ").append(count).append(" cases\n")
        );
        prompt.append("\nAnalyze for:\n");
        prompt.append("1. Emerging disease clusters or spikes\n");
        prompt.append("2. Unusual patterns that may indicate outbreaks\n");
        prompt.append("3. Risk of disease spread\n");
        prompt.append("4. Recommended preventive measures\n");

        String aiResponse = geminiService.generateContent(prompt.toString(), "Early Warning Detection");

        Map<String, Object> result = new HashMap<>();
        result.put("region", region);
        result.put("timePeriod", timePeriod);
        result.put("totalCases", recentAnalyses.size());
        result.put("diseaseDistribution", diseaseCounts);
        result.put("aiAnalysis", aiResponse);
        result.put("timestamp", LocalDateTime.now());

        return result;
    }

    private int parseTimePeriod(String period) {
        if (period == null) return 30; // Default 30 days
        period = period.toLowerCase();
        if (period.contains("day")) {
            return Integer.parseInt(period.replaceAll("[^0-9]", ""));
        } else if (period.contains("week")) {
            return Integer.parseInt(period.replaceAll("[^0-9]", "")) * 7;
        } else if (period.contains("month")) {
            return Integer.parseInt(period.replaceAll("[^0-9]", "")) * 30;
        }
        return 30;
    }
}

