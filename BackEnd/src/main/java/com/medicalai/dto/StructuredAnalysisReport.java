package com.medicalai.dto;

import java.util.List;

public class StructuredAnalysisReport {
    private String primaryClinicalSummary;
    private String primaryClinicalImpression;
    private DiseaseStage diseaseStage;
    private RiskAssessment riskAssessment;
    private List<String> keyIndicators;
    private List<DifferentialDiagnosis> differentialDiagnosis;
    private Recommendations recommendations;
    private List<String> warningSigns;
    private String uncertaintyAndLimitations;
    private String finalAINote;

    public static class DiseaseStage {
        private String stage;
        private List<String> explanation;

        public DiseaseStage() {}

        public DiseaseStage(String stage, List<String> explanation) {
            this.stage = stage;
            this.explanation = explanation;
        }

        public String getStage() {
            return stage;
        }

        public void setStage(String stage) {
            this.stage = stage;
        }

        public List<String> getExplanation() {
            return explanation;
        }

        public void setExplanation(List<String> explanation) {
            this.explanation = explanation;
        }
    }

    public static class RiskAssessment {
        private String overallRiskLevel;
        private Integer riskOfProgression;
        private Integer confidenceScore;
        private String riskFactors;

        public RiskAssessment() {}

        public RiskAssessment(String overallRiskLevel, Integer riskOfProgression, Integer confidenceScore, String riskFactors) {
            this.overallRiskLevel = overallRiskLevel;
            this.riskOfProgression = riskOfProgression;
            this.confidenceScore = confidenceScore;
            this.riskFactors = riskFactors;
        }

        public String getOverallRiskLevel() {
            return overallRiskLevel;
        }

        public void setOverallRiskLevel(String overallRiskLevel) {
            this.overallRiskLevel = overallRiskLevel;
        }

        public Integer getRiskOfProgression() {
            return riskOfProgression;
        }

        public void setRiskOfProgression(Integer riskOfProgression) {
            this.riskOfProgression = riskOfProgression;
        }

        public Integer getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(Integer confidenceScore) {
            this.confidenceScore = confidenceScore;
        }

        public String getRiskFactors() {
            return riskFactors;
        }

        public void setRiskFactors(String riskFactors) {
            this.riskFactors = riskFactors;
        }
    }

    public static class DifferentialDiagnosis {
        private String condition;
        private String likelihood;
        private String justification;

        public DifferentialDiagnosis() {}

        public DifferentialDiagnosis(String condition, String likelihood, String justification) {
            this.condition = condition;
            this.likelihood = likelihood;
            this.justification = justification;
        }

        public String getCondition() {
            return condition;
        }

        public void setCondition(String condition) {
            this.condition = condition;
        }

        public String getLikelihood() {
            return likelihood;
        }

        public void setLikelihood(String likelihood) {
            this.likelihood = likelihood;
        }

        public String getJustification() {
            return justification;
        }

        public void setJustification(String justification) {
            this.justification = justification;
        }
    }

    public static class Recommendations {
        private List<String> immediateActions;
        private List<String> furtherDiagnosticEvaluation;
        private List<String> monitoringAndFollowUp;

        public Recommendations() {}

        public Recommendations(List<String> immediateActions, List<String> furtherDiagnosticEvaluation, List<String> monitoringAndFollowUp) {
            this.immediateActions = immediateActions;
            this.furtherDiagnosticEvaluation = furtherDiagnosticEvaluation;
            this.monitoringAndFollowUp = monitoringAndFollowUp;
        }

        public List<String> getImmediateActions() {
            return immediateActions;
        }

        public void setImmediateActions(List<String> immediateActions) {
            this.immediateActions = immediateActions;
        }

        public List<String> getFurtherDiagnosticEvaluation() {
            return furtherDiagnosticEvaluation;
        }

        public void setFurtherDiagnosticEvaluation(List<String> furtherDiagnosticEvaluation) {
            this.furtherDiagnosticEvaluation = furtherDiagnosticEvaluation;
        }

        public List<String> getMonitoringAndFollowUp() {
            return monitoringAndFollowUp;
        }

        public void setMonitoringAndFollowUp(List<String> monitoringAndFollowUp) {
            this.monitoringAndFollowUp = monitoringAndFollowUp;
        }
    }

    public StructuredAnalysisReport() {}

    public String getPrimaryClinicalSummary() {
        return primaryClinicalSummary;
    }

    public void setPrimaryClinicalSummary(String primaryClinicalSummary) {
        this.primaryClinicalSummary = primaryClinicalSummary;
    }

    public String getPrimaryClinicalImpression() {
        return primaryClinicalImpression;
    }

    public void setPrimaryClinicalImpression(String primaryClinicalImpression) {
        this.primaryClinicalImpression = primaryClinicalImpression;
    }

    public DiseaseStage getDiseaseStage() {
        return diseaseStage;
    }

    public void setDiseaseStage(DiseaseStage diseaseStage) {
        this.diseaseStage = diseaseStage;
    }

    public RiskAssessment getRiskAssessment() {
        return riskAssessment;
    }

    public void setRiskAssessment(RiskAssessment riskAssessment) {
        this.riskAssessment = riskAssessment;
    }

    public List<String> getKeyIndicators() {
        return keyIndicators;
    }

    public void setKeyIndicators(List<String> keyIndicators) {
        this.keyIndicators = keyIndicators;
    }

    public List<DifferentialDiagnosis> getDifferentialDiagnosis() {
        return differentialDiagnosis;
    }

    public void setDifferentialDiagnosis(List<DifferentialDiagnosis> differentialDiagnosis) {
        this.differentialDiagnosis = differentialDiagnosis;
    }

    public Recommendations getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(Recommendations recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getWarningSigns() {
        return warningSigns;
    }

    public void setWarningSigns(List<String> warningSigns) {
        this.warningSigns = warningSigns;
    }

    public String getUncertaintyAndLimitations() {
        return uncertaintyAndLimitations;
    }

    public void setUncertaintyAndLimitations(String uncertaintyAndLimitations) {
        this.uncertaintyAndLimitations = uncertaintyAndLimitations;
    }

    public String getFinalAINote() {
        return finalAINote;
    }

    public void setFinalAINote(String finalAINote) {
        this.finalAINote = finalAINote;
    }
}

