package com.resumebuilder.ai_resume_api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.docs.enabled", havingValue = "true", matchIfMissing = false)
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("AI Resume Builder API")
                        .version("v1")
                        .description("Internal API docs (dev only). Do not expose in production.")
                        .contact(new Contact().name("Bhavy Upreti").email("bhavyupreti83@gmail.com")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components().addSecuritySchemes(securitySchemeName,
                        new SecurityScheme().name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("api")
                .pathsToMatch("/api/**")
                .build();
    }

    @Bean
    public org.springdoc.core.customizers.OpenApiCustomizer globalResponses() {
        return openApi -> openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations().forEach(op -> {
            op.getResponses().addApiResponse("401",
                    new io.swagger.v3.oas.models.responses.ApiResponse().description("Unauthorized"));
            op.getResponses().addApiResponse("403",
                    new io.swagger.v3.oas.models.responses.ApiResponse().description("Forbidden"));
            op.getResponses().addApiResponse("500",
                    new io.swagger.v3.oas.models.responses.ApiResponse().description("Internal Server Error"));
        }));
    }
}
