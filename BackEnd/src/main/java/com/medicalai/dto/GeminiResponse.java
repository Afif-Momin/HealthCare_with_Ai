package com.medicalai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


public class GeminiResponse {
    private List<Candidate> candidates;


    public GeminiResponse() {
		super();
		// TODO Auto-generated constructor stub
	}

	public GeminiResponse(List<Candidate> candidates) {
		super();
		this.candidates = candidates;
	}

	public List<Candidate> getCandidates() {
		return candidates;
	}

	public void setCandidates(List<Candidate> candidates) {
		this.candidates = candidates;
	}

	public static class Candidate {
    	
        public Candidate() {
			super();
			// TODO Auto-generated constructor stub
		}
		public Candidate(Content content, String finishReason, Integer index, List<SafetyRating> safetyRatings) {
			super();
			this.content = content;
			this.finishReason = finishReason;
			this.index = index;
			this.safetyRatings = safetyRatings;
		}
		public Content getContent() {
			return content;
		}
		public void setContent(Content content) {
			this.content = content;
		}
		public String getFinishReason() {
			return finishReason;
		}
		public void setFinishReason(String finishReason) {
			this.finishReason = finishReason;
		}
		public Integer getIndex() {
			return index;
		}
		public void setIndex(Integer index) {
			this.index = index;
		}
		public List<SafetyRating> getSafetyRatings() {
			return safetyRatings;
		}
		public void setSafetyRatings(List<SafetyRating> safetyRatings) {
			this.safetyRatings = safetyRatings;
		}
		private Content content;
        private String finishReason;
        private Integer index;
        private List<SafetyRating> safetyRatings;
    }


    public static class Content {
    	
        public Content() {
			// TODO Auto-generated constructor stub
		}
		public List<Part> getParts() {
			return parts;
		}
		public void setParts(List<Part> parts) {
			this.parts = parts;
		}
		public String getRole() {
			return role;
		}
		public void setRole(String role) {
			this.role = role;
		}
		public Content(List<Part> parts, String role) {
			super();
			this.parts = parts;
			this.role = role;
		}
		private List<Part> parts;
        private String role;
    }

    public static class Part {
    	
        public Part() {

		}

		public Part(String text) {
			super();
			this.text = text;
		}

		public String getText() {
			return text;
		}

		public void setText(String text) {
			this.text = text;
		}

		private String text;
    }

    public static class SafetyRating {
    	
        private String category;
        private String probability;
		public SafetyRating(String category, String probability) {
			super();
			this.category = category;
			this.probability = probability;
		}
		public String getCategory() {
			return category;
		}
		public void setCategory(String category) {
			this.category = category;
		}
		public String getProbability() {
			return probability;
		}
		public void setProbability(String probability) {
			this.probability = probability;
		}
		public SafetyRating() {
			super();
			// TODO Auto-generated constructor stub
		}
        
        
    }
}

