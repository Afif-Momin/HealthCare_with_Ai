package com.medicalai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


public class GeminiRequest {
    private List<Content> contents;

    public static class Content {
    	
        public List<Part> getParts() {
			return parts;
		}

		public void setParts(List<Part> parts) {
			this.parts = parts;
		}

		private List<Part> parts;
    }

    public static class Part {
    	
        public String getText() {
			return text;
		}

		public void setText(String text) {
			this.text = text;
		}

		private String text;
    }

	public List<Content> getContents() {
		return contents;
	}

	public void setContents(List<Content> contents) {
		this.contents = contents;
	}

	public GeminiRequest(List<Content> contents) {
		super();
		this.contents = contents;
	}

	public GeminiRequest() {
	
		// TODO Auto-generated constructor stub
	}
	
    
}

