package com.resumebuilder.ai_resume_api.ai.prompts;

import java.util.Map;

public class PromptTemplate {
    private String id;
    private String name;
    private String version;
    private String template;

    public PromptTemplate() {
    }

    public PromptTemplate(String id, String name, String version, String template) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.template = template;
    }

    public String render(Map<String, Object> vars) {
        String out = template;
        if (vars != null) {
            for (var e : vars.entrySet()) {
                out = out.replace("{{" + e.getKey() + "}}", String.valueOf(e.getValue()));
            }
        }
        return out;
    }

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }

    public String version() {
        return version;
    }
}