package com.restaurant.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir les images uploadées depuis le dossier uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
        
        System.out.println("✅ Dossier uploads configuré : file:./uploads/");
    }
}