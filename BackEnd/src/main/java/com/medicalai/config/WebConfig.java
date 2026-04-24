package com.medicalai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Web Configuration for serving React SPA
 * 
 * This configuration:
 * 1. Serves static files from /static directory (React build output)
 * 2. Handles React Router by forwarding all non-API routes to index.html
 * 3. Allows API routes to pass through to controllers
 * 
 * CRITICAL: API routes (/api/**) must NOT be handled by this config
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources (JS, CSS, images) from /static
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(31536000); // 1 year cache for assets

        registry.addResourceHandler("/favicon.ico", "/vite.svg")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400); // 1 day cache

        // Handle React Router - forward all non-API routes to index.html
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // CRITICAL: Don't intercept API routes
                        if (resourcePath.startsWith("api/")) {
                            return null; // Let Spring MVC handle API routes
                        }
                        
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // If the resource exists (e.g., JS, CSS files), serve it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // Otherwise, serve index.html for React Router (SPA)
                        // This allows routes like /dashboard, /profile to work
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
