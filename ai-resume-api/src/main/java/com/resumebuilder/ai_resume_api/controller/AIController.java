package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.service.ai.TailoringService;
import com.resumebuilder.ai_resume_api.dto.ai.*;
import com.resumebuilder.ai_resume_api.service.ai.AtsScoringService;
import com.resumebuilder.ai_resume_api.service.ai.GrammarService;
import com.resumebuilder.ai_resume_api.dto.SuggestionRequestDto;
import com.resumebuilder.ai_resume_api.dto.SuggestionResponseDto;
import com.resumebuilder.ai_resume_api.security.SSEAuthTokenService;
import com.resumebuilder.ai_resume_api.service.AIService;
import com.resumebuilder.ai_resume_api.service.ai.BulletRewriterService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.resumebuilder.ai_resume_api.service.FeatureGateService;
import com.resumebuilder.ai_resume_api.service.UsageTrackingService;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService; // legacy endpoint retained
    private final BulletRewriterService bulletRewriterService;
    private final SSEAuthTokenService sseAuthTokenService;
    private final GrammarService grammarService;
    private final AtsScoringService atsScoringService;
    private final TailoringService tailoringService;
    private final FeatureGateService featureGateService;
    private final UsageTrackingService usageTrackingService;
    private final UserRepository userRepository;

    public AIController(AIService aiService,
            BulletRewriterService bulletRewriterService,
            SSEAuthTokenService sseAuthTokenService,
            GrammarService grammarService,
            AtsScoringService atsScoringService, TailoringService tailoringService,
            FeatureGateService featureGateService,
            UsageTrackingService usageTrackingService, UserRepository userRepository) {
        this.aiService = aiService;
        this.bulletRewriterService = bulletRewriterService;
        this.sseAuthTokenService = sseAuthTokenService;
        this.grammarService = grammarService;
        this.atsScoringService = atsScoringService;
        this.tailoringService = tailoringService;
        this.featureGateService = featureGateService;
        this.usageTrackingService = usageTrackingService;
        this.userRepository = userRepository;
    }

    // Legacy endpoint (kept for backward compatibility)
    @Operation(summary = "Legacy: free-form bullet suggestions (string)")
    @PostMapping("/suggestions/experience")
    public ResponseEntity<SuggestionResponseDto> getExperienceSuggestions(@RequestBody SuggestionRequestDto request) {
        String suggestions = aiService.getSuggestions(request.jobTitle(), request.descriptionDraft());
        return ResponseEntity.ok(new SuggestionResponseDto(suggestions));
    }

    // New structured JSON endpoint
    @Operation(summary = "Rewrite a draft into 3 action-oriented bullets (JSON) with model fallback")
    @PostMapping("/resumes/{resumeId}/bullets/rewrite")
    public ResponseEntity<BulletRewriteResponseDto> rewriteBullets(
            @PathVariable Long resumeId,
            @RequestParam(value = "model", required = false) String modelKey,
            @Valid @RequestBody BulletRewriteRequestDto req) {

        // Get current user
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        // CHECK LIMIT before processing
        featureGateService.checkCanUseBulletRewrite(user, resumeId);

        // Process request
        var res = bulletRewriterService.rewrite(req, modelKey);

        // TRACK USAGE after success
        usageTrackingService.trackBulletRewrite(user, resumeId,
                java.util.Map.of(
                        "jobTitle", req.jobTitle(),
                        "model", res.model(),
                        "timestamp", java.time.Instant.now().toString()));

        return ResponseEntity.ok(res);
    }

    @GetMapping(value = "/resumes/{resumeId}/bullets/rewrite/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public reactor.core.publisher.Flux<org.springframework.http.codec.ServerSentEvent<String>> rewriteBulletsStream(
            @PathVariable Long resumeId,
            @RequestParam String jobTitle,
            @RequestParam String draft,
            @RequestParam String sseToken, // REQUIRED
            @RequestParam(value = "model", required = false) String modelKey) {

        // Validate short-lived SSE token (endpoint itself is permitAll)
        @SuppressWarnings("unused")
        String user = null;
        try {
            user = com.resumebuilder.ai_resume_api.security.SecurityUtil.currentUsername();
        } catch (Exception ignored) {
            // likely anonymous because path is permitAll; we validate with token instead
        }
        // We don't trust 'user' here; we validate against token itself.
        if (!sseAuthTokenService.validate(sseToken, null, resumeId)) {
            return reactor.core.publisher.Flux.just(org.springframework.http.codec.ServerSentEvent.builder(
                    "{\"event\":\"error\",\"message\":\"unauthorized\"}").build());
        }

        var req = new com.resumebuilder.ai_resume_api.dto.ai.BulletRewriteRequestDto(
                jobTitle, draft, null, null, null);

        return reactor.core.publisher.Mono.fromCallable(() -> bulletRewriterService.rewrite(req, modelKey))
                .flatMapMany(resp -> {
                    var events = new java.util.ArrayList<org.springframework.http.codec.ServerSentEvent<String>>();
                    events.add(org.springframework.http.codec.ServerSentEvent
                            .builder("{\"event\":\"chosenModel\",\"model\":\"" + resp.model() + "\"}").build());
                    events.add(org.springframework.http.codec.ServerSentEvent.builder(
                            "{\"event\":\"result\",\"payload\":" + (resp.raw() == null ? "\"\"" : resp.raw()) + "}")
                            .build());
                    if (resp.warnings() != null && !resp.warnings().isEmpty()) {
                        events.add(org.springframework.http.codec.ServerSentEvent
                                .builder("{\"event\":\"warnings\",\"count\":" + resp.warnings().size() + "}").build());
                    } else {
                        events.add(org.springframework.http.codec.ServerSentEvent
                                .builder("{\"event\":\"warnings\",\"count\":0}").build());
                    }
                    events.add(org.springframework.http.codec.ServerSentEvent.builder("{\"event\":\"done\"}").build());
                    return reactor.core.publisher.Flux.fromIterable(events);
                })
                .onErrorResume(ex -> reactor.core.publisher.Flux.just(org.springframework.http.codec.ServerSentEvent
                        .builder(
                                "{\"event\":\"error\",\"message\":\"" + ex.getMessage().replace("\"", "'") + "\"}")
                        .build()));
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Issue short-lived SSE token for AI streaming (requires auth)")
    @PostMapping("/resumes/{resumeId}/bullets/rewrite/stream-token")
    public ResponseEntity<java.util.Map<String, Object>> issueSseToken(@PathVariable Long resumeId) {
        String user = com.resumebuilder.ai_resume_api.security.SecurityUtil.currentUsername();
        long ttlSeconds = 60; // 1 minute
        String token = sseAuthTokenService.issue(user, resumeId, ttlSeconds);
        return ResponseEntity.ok(java.util.Map.of("token", token, "expiresIn", ttlSeconds));
    }

    @Operation(summary = "ATS score + suggestions (local, hybrid)")
    @PostMapping("/resumes/{resumeId}/ats/score")
    public ResponseEntity<AtsScoreResponseDto> atsScore(
            @PathVariable Long resumeId,
            @Valid @RequestBody AtsScoreRequestDto req) {

        // Get current user
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        // CHECK LIMIT before processing
        featureGateService.checkCanRunAtsScore(user, resumeId);

        // Process request
        var res = atsScoringService.score(resumeId, req);

        // TRACK USAGE after success
        usageTrackingService.trackAtsScore(user, resumeId,
                java.util.Map.of(
                        "jobTitle", req.jobTitle(),
                        "score", res.totalScore(),
                        "timestamp", java.time.Instant.now().toString()));

        return ResponseEntity.ok(res);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Grammar/tense check (offline LanguageTool)")
    @PostMapping("/grammar/check")
    public ResponseEntity<GrammarCheckResponseDto> grammarCheck(
            @jakarta.validation.Valid @RequestBody GrammarCheckRequestDto req) {
        var res = grammarService.check(req);
        return ResponseEntity.ok(res);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Grammar/tense check for text/plain bodies")
    @PostMapping(value = "/grammar/check", consumes = org.springframework.http.MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<com.resumebuilder.ai_resume_api.dto.ai.GrammarCheckResponseDto> grammarCheckPlain(
            @RequestBody String text) {
        var req = new com.resumebuilder.ai_resume_api.dto.ai.GrammarCheckRequestDto(text, null);
        var res = grammarService.check(req);
        return ResponseEntity.ok(res);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Reindex resume into chunks for retrieval (embeddings)")
    @PostMapping("/resumes/{resumeId}/tailor/reindex")
    public ResponseEntity<java.util.Map<String, Object>> reindexResume(@PathVariable Long resumeId) {
        int count = tailoringService.reindex(resumeId);
        return ResponseEntity.ok(java.util.Map.of("resumeId", resumeId, "chunks", count));
    }

    @Operation(summary = "Tailor resume to a job description (RAG + patch plan)")
    @PostMapping("/resumes/{resumeId}/tailor")
    public ResponseEntity<TailorPlanDto> tailorResume(
            @PathVariable Long resumeId,
            @Valid @RequestBody TailorRequestDto req) {

        // Get current user
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        // CHECK LIMIT before processing
        featureGateService.checkCanUseTailoring(user);

        // Process request
        var res = tailoringService.tailor(resumeId, req);

        // TRACK USAGE after success
        usageTrackingService.trackTailoring(user, resumeId,
                java.util.Map.of(
                        "patchCount", res.bulletPatches() != null ? res.bulletPatches().size() : 0,
                        "model", res.model(),
                        "timestamp", java.time.Instant.now().toString()));

        return ResponseEntity.ok(res);
    }
}