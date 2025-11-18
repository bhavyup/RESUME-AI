package com.resumebuilder.ai_resume_api.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.resumebuilder.ai_resume_api.config.AiTailoringConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai_resume_api.ai.AIOrchestrator;
import com.resumebuilder.ai_resume_api.dto.ai.*;
import com.resumebuilder.ai_resume_api.repository.vector.ResumeChunkDao;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.stream.Collectors;
import java.util.*;

@Service
public class TailoringService {

    private static final Logger log = LoggerFactory.getLogger(TailoringService.class);

    private final ResumeChunker chunker;
    private final EmbeddingService embeddings;
    private final ResumeChunkDao chunkDao;
    private final AIOrchestrator orchestrator;
    private final ObjectMapper mapper = new ObjectMapper();
    private final VariantValidator variantValidator;
    private final AiTailoringConfig config;

    public TailoringService(ResumeChunker chunker, EmbeddingService embeddings, ResumeChunkDao chunkDao,
            AIOrchestrator orchestrator, VariantValidator variantValidator, AiTailoringConfig config) {
        this.chunker = chunker;
        this.embeddings = embeddings;
        this.chunkDao = chunkDao;
        this.orchestrator = orchestrator;
        this.variantValidator = variantValidator;
        this.config = config;
    }

    // Build/rebuild chunks + embeddings
    public int reindex(Long resumeId) {
        var chunks = chunker.buildChunks(resumeId);
        chunkDao.deleteByResumeId(resumeId);
        int inserted = 0;
        for (var ch : chunks) {
            float[] vec = embeddings.embed(ch.content());
            chunkDao.insert(ch.resumeId(), ch.section(), ch.refType(), ch.refId(), ch.partOrder(), ch.content(), vec);
            inserted++;
        }
        return inserted;
    }

    record ScoredCtx(CtxLine ctx, double score) {
    }

    public TailorPlanDto tailor(Long resumeId, TailorRequestDto req) {
        log.info("Tailoring resume {} with topK={}, model={}, reindex={}",
                resumeId, req.topK(), req.model(), req.reindex());

        long startTime = System.currentTimeMillis();

        // Reindex if asked
        if (Boolean.TRUE.equals(req.reindex())) {
            int chunks = reindex(resumeId);
            log.info("Reindexed resume {} - {} chunks created", resumeId, chunks);
        }

        int topK = (req.topK() == null || req.topK() < 1 || req.topK() > config.getTailor().getTopk().getMax())
                ? config.getTailor().getTopk().getDefaultValue()
                : req.topK();

        // Build context lines (ranked) and keep metadata for mapping
        float[] jd = embeddings.embed(req.jobDescription());
        var hits = chunkDao.topK(jd, topK);

        // Build raw ctxLines from hits
        List<CtxLine> rawLines = new ArrayList<>();
        int rankCounter = 1;
        for (var h : hits) {
            String section = Objects.toString(h.get("section"), "");
            String refType = Objects.toString(h.get("ref_type"), "");
            String rawcontent = Objects.toString(h.get("content"), "");
            String content = clamp(rawcontent, config.getTailor().getContent().getClamp().getChunk());

            Long refId = null;
            Object refIdObj = h.get("ref_id");
            if (refIdObj instanceof Number n)
                refId = n.longValue();

            Integer idx = null;
            Object partOrderObj = h.get("part_order");
            if (partOrderObj instanceof Number n)
                idx = n.intValue();

            rawLines.add(new CtxLine(rankCounter++, section, refType, refId, idx, content));
        }

        // Compute JD keywords for reranking
        List<String> jdKeywords = extractKeywords(req.jobDescription(),
                config.getKeywords().getJd().getContext().getLimit());

        // Build raw ctxLines (already done) → keep a local mutable copy for scoring
        List<ScoredCtx> scored = new ArrayList<>();
        for (var line : rawLines) {
            int overlap = 0;
            String lc = line.content().toLowerCase(Locale.ROOT);
            for (String k : jdKeywords) {
                if (lc.contains(k.toLowerCase(Locale.ROOT)))
                    overlap++;
            }
            // Vector similarity already applied by topK; we only add a small keyword bonus
            double score = overlap; // 0..N
            scored.add(new ScoredCtx(line, score));
        }
        // Sort: bullets first (we already separate), then by score desc while keeping
        scored.sort((a, b) -> Double.compare(b.score, a.score));

        // then rebuild 'display' from scored in that order
        List<CtxLine> display = scored.stream().map(sc -> sc.ctx).collect(Collectors.toList());

        // Reorder: bullet-like first to increase likelihood of multiple patches
        List<CtxLine> bulletLike = new ArrayList<>();
        List<CtxLine> others = new ArrayList<>();
        for (CtxLine c : rawLines) {
            if ("EXPERIENCE".equalsIgnoreCase(c.section()) && isBulletLike(c.refType()))
                bulletLike.add(c);
            else
                others.add(c);
        }
        // List<CtxLine> display = new ArrayList<>();
        display.addAll(bulletLike);
        display.addAll(others);

        // Rebuild ranks and context string
        List<CtxLine> ctxLines = new ArrayList<>();
        StringBuilder ctx = new StringBuilder();
        int newRank = 1;
        for (CtxLine c : display) {
            CtxLine nc = new CtxLine(newRank, c.section(), c.refType(), c.refId(), c.bulletIndex(), c.content());
            ctxLines.add(nc);
            ctx.append(newRank).append(") [")
                    .append(nc.section()).append("/").append(nc.refType())
                    .append(" id=").append(nc.refId() == null ? "null" : nc.refId())
                    .append(" idx=").append(nc.bulletIndex() == null ? "null" : nc.bulletIndex())
                    .append("] ")
                    .append(nc.content())
                    .append("\n");
            newRank++;
        }

        // Log context at DEBUG level (won't show in production unless explicitly
        if (log.isDebugEnabled()) {
            log.debug("=== Tailor Context (top {} chunks) ===", ctxLines.size());
            for (CtxLine l : ctxLines) {
                log.debug("{}. [{}/{}] id={} idx={} - {}",
                        l.rank(), l.section(), l.refType(), l.refId(), l.bulletIndex(),
                        l.content().length() > 80 ? l.content().substring(0, 80) + "..." : l.content());
            }
        }

        String keywordsJoined = jdKeywords.stream().collect(Collectors.joining(", "));

        log.debug("Extracted {} JD keywords: {}", jdKeywords.size(), keywordsJoined);
        log.debug("Context lines built: {}", ctxLines.size());

        Map<String, Object> vars = new HashMap<>();
        vars.put("jobDescription", clamp(req.jobDescription(), config.getTailor().getContent().getClamp().getJd()));
        vars.put("targetKeywords", keywordsJoined);
        vars.put("context", ctx.toString());

        var ai = orchestrator.generate(
                "tailor_patch_json_v1",
                vars,
                req.model(),
                Map.of("temperature", config.getGeneration().getTemperature(),
                        "num_predict", config.getGeneration().getNumPredict(),
                        "top_p", config.getGeneration().getTopP()),
                true);

        log.info("Model generated plan: provider={}, model={}, latency={}ms",
                ai.provider(), ai.model(), ai.latencyMs());

        TailorPlanDto rawPlan = parsePlan(ai.content());
        log.debug("Raw plan: {} patches, atsScore={}->{}",
                rawPlan.bulletPatches() == null ? 0 : rawPlan.bulletPatches().size(),
                rawPlan.atsScoreBefore(), rawPlan.atsScoreAfter());

        TailorPlanDto patchedPlan = enrichPlanWithContext(rawPlan, ctxLines, ai.content(), resumeId);
        log.debug("After enrichment: {} patches",
                patchedPlan.bulletPatches() == null ? 0 : patchedPlan.bulletPatches().size());

        TailorPlanDto augmented = augmentIfSparse(patchedPlan, ctxLines, req.jobDescription(), keywordsJoined,
                req.model(), resumeId, config.getTailor().getMinPatches());
        log.debug("After augmentation: {} patches",
                augmented.bulletPatches() == null ? 0 : augmented.bulletPatches().size());

        // Deduplicate by position (same entityId + bulletIndex)
        List<TailorPlanDto.BulletPatch> dedupedPatches = dedupeByPosition(augmented.bulletPatches());
        log.debug("After position deduplication: {} patches", dedupedPatches.size());

        TailorPlanDto deduped = new TailorPlanDto(
                augmented.atsScoreBefore(),
                augmented.atsScoreAfter(),
                augmented.globalKeywordsToAdd(),
                augmented.globalKeywordsMissing(),
                dedupedPatches,
                augmented.sectionOrderSuggested(),
                augmented.provider(),
                augmented.model(),
                augmented.latencyMs(),
                augmented.promptVersion(),
                augmented.raw());

        // Compute ATS scores AFTER augmentation (final patch count)
        int[] ats = computeAtsScores(deduped, resumeId, req.jobDescription());
        double before = ats[0];
        double after = ats[1];
        log.info("ATS scores computed: before={}, after={} (delta={})", before, after, (after - before));

        long totalTime = System.currentTimeMillis() - startTime;
        int finalPatchCount = dedupedPatches.size();

        log.info("Tailoring complete for resume {}: {} patches, ATS {}->{}, total time={}ms",
                resumeId, finalPatchCount, before, after, totalTime);

        // Log per-section breakdown
        if (!dedupedPatches.isEmpty()) {
            var sectionCounts = dedupedPatches.stream()
                    .collect(Collectors.groupingBy(
                            bp -> bp.section() == null ? "UNKNOWN" : bp.section(),
                            Collectors.counting()));
            log.debug("Patch breakdown by section: {}", sectionCounts);
        }

        // Compute real global keywords (don't trust model)
        GlobalKeywordAnalysis realKeywords = analyzeGlobalKeywords(req.jobDescription(), resumeId, dedupedPatches);

        log.info("Real keywords - to add: {}, missing: {}",
                String.join(", ", realKeywords.toAdd()),
                String.join(", ", realKeywords.missing()));

        // Fix keywordsAdded for each patch (validate against actual variant content)
        List<String> jdKeywordss = extractKeywords(req.jobDescription(), config.getKeywords().getJd().getLimit());
        List<TailorPlanDto.BulletPatch> validatedPatches = dedupedPatches.stream()
                .map(bp -> {
                    List<String> actualKeywords = computeActualKeywordsInVariants(bp.variants(), jdKeywordss);

                    // Warn if model lied
                    if (bp.keywordsAdded() != null && !bp.keywordsAdded().isEmpty()) {
                        List<String> modelClaimed = bp.keywordsAdded();
                        List<String> lies = modelClaimed.stream()
                                .filter(k -> !actualKeywords.contains(k))
                                .collect(Collectors.toList());
                        if (!lies.isEmpty()) {
                            log.warn("Patch claimed keywords {} but variants don't contain them. Actual: {}",
                                    lies, actualKeywords);
                        }
                    }

                    return new TailorPlanDto.BulletPatch(
                            bp.section(),
                            bp.entityId(),
                            bp.bulletIndex(),
                            bp.original(),
                            bp.variants(),
                            actualKeywords // ← real keywords, not model's claim
                    );
                })
                .collect(Collectors.toList());

        return new TailorPlanDto(
                before,
                after,
                realKeywords.toAdd(),
                realKeywords.missing(),
                validatedPatches, // ← validated, not deduped raw
                deduped.sectionOrderSuggested(),
                ai.provider(),
                ai.model(),
                ai.latencyMs(),
                "1.2",
                ai.content());
    }

    /* ---------- helpers ---------- */

    private TailorPlanDto augmentIfSparse(TailorPlanDto plan,
            List<CtxLine> ctxLines,
            String jobDescription,
            String targetKeywordsCsv,
            String modelKey,
            Long resumeId,
            int minPatches) {
        if (plan == null)
            return plan;

        // Start with deduped patches by original + section + entityId
        List<TailorPlanDto.BulletPatch> patches = new ArrayList<>(
                dedupeByOriginal(plan.bulletPatches()));
        if (patches.size() >= minPatches)
            return new TailorPlanDto(
                    plan.atsScoreBefore(), plan.atsScoreAfter(),
                    plan.globalKeywordsToAdd(), plan.globalKeywordsMissing(),
                    patches, plan.sectionOrderSuggested(), plan.provider(), plan.model(),
                    plan.latencyMs(), plan.promptVersion(), plan.raw());

        // Deduplicate by normalized original
        Set<String> usedOriginals = patches.stream()
                .map(bp -> normalize(bp.original()))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        // Parse keywords list for scoring
        List<String> targetKeywords = Arrays.stream(targetKeywordsCsv.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();

        // Candidate lines across EXPERIENCE, PROJECT(S), EDUCATION
        List<CtxLine> candidates = ctxLines.stream()
                .filter(c -> "EXPERIENCE".equalsIgnoreCase(c.section()) ||
                        "PROJECT".equalsIgnoreCase(c.section()) ||
                        "PROJECTS".equalsIgnoreCase(c.section()) ||
                        "EDUCATION".equalsIgnoreCase(c.section()))
                .filter(c -> !isHeader(c.refType()))
                .filter(c -> isAllowedRefType(sectionNorm(c.section()), c.refType()))
                .sorted((a, b) -> {
                    int aScore = (isBulletLike(b.refType()) ? 1 : 0) - (isBulletLike(a.refType()) ? 1 : 0);
                    int ovA = overlapCount(a.content(), targetKeywords);
                    int ovB = overlapCount(b.content(), targetKeywords);
                    int cmp = Integer.compare(ovB, ovA);
                    return (aScore != 0) ? aScore : cmp;
                })
                .filter(c -> !usedOriginals.contains(normalize(c.content())))
                .collect(Collectors.toList());

        boolean hasProject = patches.stream()
                .anyMatch(p -> "PROJECTS".equalsIgnoreCase(p.section()) || "PROJECT".equalsIgnoreCase(p.section()));
        boolean projectContentExists = ctxLines.stream().anyMatch(
                c -> (sectionNorm(c.section()).equals("PROJECT") && isAllowedRefType("PROJECT", c.refType())));

        if (!hasProject && projectContentExists) {
            // Force-insert a top project candidate into the front of candidates
            Optional<CtxLine> topProject = ctxLines.stream()
                    .filter(c -> sectionNorm(c.section()).equals("PROJECT"))
                    .filter(c -> isAllowedRefType("PROJECT", c.refType()))
                    .findFirst();
            if (topProject.isPresent()) {
                // Prepend to candidates
                candidates.add(0, topProject.get());
            }
        }

        for (CtxLine c : candidates) {
            if (patches.size() >= minPatches)
                break;

            TailorPlanDto.BulletPatch p = generateSinglePatchFromCtx(jobDescription, targetKeywordsCsv, c, modelKey);
            if (p == null)
                continue;

            // Ensure mapping: entityId/bulletIndex (EXPERIENCE only)
            Long entityId = c.refId(); // trust context id, ignore model-provided id
            if (entityId == null && p.entityId() != null)
                entityId = p.entityId();
            Integer bulletIdx = p.bulletIndex();

            if ("EXPERIENCE".equalsIgnoreCase(c.section())) {
                if (entityId != null && bulletIdx == null) {
                    Integer fromDb = mapBulletIndexFromDb(resumeId, entityId, p.original());
                    bulletIdx = (fromDb != null) ? fromDb : computeNextBulletIndexDb(resumeId, entityId);
                }
            } else {
                bulletIdx = null; // non-EXPERIENCE → leave null
            }

            // Sanitize variants (no meta text), and ensure at least one target keyword is
            List<String> variants = variantValidator.cleanVariants(p.variants());
            if (!variantValidator.containsAnyKeyword(variants, targetKeywords)) {
                variants = variantValidator.injectKeywordIfMissing(variants, targetKeywords);
            }

            String normOrig = normalize(p.original());
            if (normOrig.isEmpty() || usedOriginals.contains(normOrig))
                continue;

            patches.add(new TailorPlanDto.BulletPatch(
                    c.section(), // preserve section from context
                    entityId,
                    bulletIdx,
                    p.original(),
                    variants,
                    p.keywordsAdded() == null ? List.of() : p.keywordsAdded()));
            usedOriginals.add(normOrig);
        }

        return new TailorPlanDto(
                plan.atsScoreBefore(),
                plan.atsScoreAfter(),
                plan.globalKeywordsToAdd(),
                plan.globalKeywordsMissing(),
                patches,
                plan.sectionOrderSuggested(),
                plan.provider(),
                plan.model(),
                plan.latencyMs(),
                plan.promptVersion(),
                plan.raw());
    }

    private TailorPlanDto.BulletPatch generateSinglePatchFromCtx(String jobDescription, String targetKeywordsCsv,
            CtxLine c, String modelKey) {
        String tag = String.format("%d) [%s/%s id=%s idx=%s]",
                c.rank(), c.section(), c.refType(),
                c.refId() == null ? "null" : c.refId().toString(),
                c.bulletIndex() == null ? "null" : c.bulletIndex().toString());

        Map<String, Object> vars = new HashMap<>();
        vars.put("jobDescription", clamp(jobDescription, 1800));
        vars.put("targetKeywords", targetKeywordsCsv);
        vars.put("lineTag", tag);
        vars.put("content", clamp(c.content(), 350));
        vars.put("rank", c.rank());

        var ai = orchestrator.generate(
                "tailor_single_patch_json_v1",
                vars,
                modelKey,
                Map.of("temperature", config.getGeneration().getSingle().getTemperature(),
                        "num_predict", config.getGeneration().getSingle().getNumPredict(),
                        "top_p", config.getGeneration().getTopP()),
                true);

        try {
            JsonNode root = mapper.readTree(ai.content());
            JsonNode p = root.path("patch");
            if (!p.isObject())
                return null;

            Long entityId = p.hasNonNull("entityId") ? p.path("entityId").asLong() : null;
            Integer bulletIdx = p.hasNonNull("bulletIndex") ? p.path("bulletIndex").asInt() : null;

            List<String> variants = variantValidator.cleanVariants(toList(p.path("variants")));
            List<String> keywords = toList(p.path("keywordsAdded"));

            return new TailorPlanDto.BulletPatch(
                    "EXPERIENCE", // section will be replaced by caller with c.section()
                    entityId,
                    bulletIdx,
                    p.path("original").asText(),
                    variants,
                    keywords);
        } catch (Exception e) {
            return null;
        }
    }

    private List<TailorPlanDto.BulletPatch> dedupeByOriginal(List<TailorPlanDto.BulletPatch> patches) {
        if (patches == null)
            return List.of();
        Map<String, TailorPlanDto.BulletPatch> seen = new LinkedHashMap<>();
        for (var bp : patches) {
            String key = (bp.section() + "|" + normalize(bp.original())).toLowerCase(Locale.ROOT);
            if (!seen.containsKey(key)) {
                seen.put(key, bp);
            } else {
                // merge variants/keywords minimally
                var existing = seen.get(key);
                List<String> mergedVars = new ArrayList<>();
                mergedVars.addAll(existing.variants() != null ? existing.variants() : Collections.emptyList());
                List<String> bpVariants = bp.variants() != null ? bp.variants() : Collections.emptyList();
                for (String v : bpVariants) {
                    String nv = normalize(v);
                    if (mergedVars.stream().map(this::normalize).noneMatch(nv::equals))
                        mergedVars.add(v);
                }
                List<String> mergedKw = new ArrayList<>();
                mergedKw.addAll(existing.keywordsAdded() != null ? existing.keywordsAdded() : Collections.emptyList());
                List<String> bpKeywords = bp.keywordsAdded() != null ? bp.keywordsAdded() : Collections.emptyList();
                for (String k : bpKeywords) {
                    if (!mergedKw.contains(k))
                        mergedKw.add(k);
                }
                seen.put(key, new TailorPlanDto.BulletPatch(
                        existing.section(),
                        existing.entityId(),
                        existing.bulletIndex(),
                        existing.original(),
                        mergedVars,
                        mergedKw));
            }
        }
        return new ArrayList<>(seen.values());
    }

    /**
     * Deduplicate patches by position (section + entityId + bulletIndex)
     * If multiple patches target same position, keep the one with most variants
     */
    private List<TailorPlanDto.BulletPatch> dedupeByPosition(List<TailorPlanDto.BulletPatch> patches) {
        if (patches == null)
            return List.of();

        Map<String, TailorPlanDto.BulletPatch> byPosition = new LinkedHashMap<>();

        for (var bp : patches) {
            String posKey = buildPositionKey(bp);

            if (!byPosition.containsKey(posKey)) {
                byPosition.put(posKey, bp);
            } else {
                // Keep the patch with more variants
                var existing = byPosition.get(posKey);
                int existingVarCount = existing.variants() == null ? 0 : existing.variants().size();
                int newVarCount = bp.variants() == null ? 0 : bp.variants().size();

                if (newVarCount > existingVarCount) {
                    log.debug("Replacing duplicate patch at {} - new has {} variants vs existing {}",
                            posKey, newVarCount, existingVarCount);
                    byPosition.put(posKey, bp);
                } else {
                    log.debug("Skipping duplicate patch at {} - existing has more variants", posKey);
                }
            }
        }

        return new ArrayList<>(byPosition.values());
    }

    /**
     * Build position key for deduplication
     */
    private String buildPositionKey(TailorPlanDto.BulletPatch bp) {
        String sec = bp.section() == null ? "NULL" : bp.section();
        String eid = bp.entityId() == null ? "NULL" : bp.entityId().toString();
        String idx = bp.bulletIndex() == null ? "NULL" : bp.bulletIndex().toString();
        return sec + "|" + eid + "|" + idx;
    }

    private int overlapCount(String content, List<String> keywords) {
        if (content == null || keywords == null)
            return 0;
        String lc = content.toLowerCase(Locale.ROOT);
        int cnt = 0;
        for (String k : keywords)
            if (lc.contains(k.toLowerCase(Locale.ROOT)))
                cnt++;
        return cnt;
    }

    private static String clamp(String s, int max) {
        if (s == null)
            return "";
        return s.length() <= max ? s : s.substring(0, max);
    }

    private TailorPlanDto enrichPlanWithContext(TailorPlanDto plan, List<CtxLine> ctxLines, String rawJson,
            Long resumeId) {
        if (plan == null || plan.bulletPatches() == null || plan.bulletPatches().isEmpty())
            return plan;

        // Build allowed IDs by section
        Map<String, Set<Long>> allowedIds = new HashMap<>();
        allowedIds.put("EXPERIENCE", new HashSet<>());
        allowedIds.put("PROJECT", new HashSet<>());
        allowedIds.put("EDUCATION", new HashSet<>());
        for (CtxLine c : ctxLines) {
            String s = sectionNorm(c.section());
            if (c.refId() != null && allowedIds.containsKey(s)) {
                allowedIds.get(s).add(c.refId());
            }
        }

        Map<Integer, CtxLine> byRank = ctxLines.stream().collect(Collectors.toMap(CtxLine::rank, c -> c));
        List<List<Integer>> ranksPerPatch = extractSourceRanks(rawJson, plan.bulletPatches().size());

        List<TailorPlanDto.BulletPatch> fixed = new ArrayList<>();
        for (int i = 0; i < plan.bulletPatches().size(); i++) {
            var bp = plan.bulletPatches().get(i);

            String sec = sectionNorm(bp.section());
            Long entityId = bp.entityId();
            Integer bulletIdx = bp.bulletIndex();
            String original = bp.original();

            // Section sanity: unknown -> try to infer by best context match, else default
            if (!allowedIds.containsKey(sec)) {
                CtxLine best = bestCtxForOriginal(original, ctxLines, null);
                sec = best != null ? sectionNorm(best.section()) : "EXPERIENCE";
            }

            // If this original best-maps to a HEADER line, skip the patch entirely
            CtxLine bestAny = bestCtxForOriginal(original, ctxLines, null);
            // Drop identity and non-narrative sources
            if (bestAny != null) {
                if (isHeader(bestAny.refType())) {
                    log.warn("Dropping patch #{} (section={}, original='{}'): mapped to HEADER source {}",
                            i, bp.section(), original.substring(0, Math.min(50, original.length())), bestAny.refType());
                    continue;
                }
                if (!isAllowedRefType(sectionNorm(bestAny.section()), bestAny.refType())) {
                    log.warn(
                            "Dropping patch #{} (section={}, original='{}'): mapped to disallowed refType {} in section {}",
                            i, bp.section(), original.substring(0, Math.min(50, original.length())),
                            bestAny.refType(), bestAny.section());
                    continue;
                }
            }

            // Validate entityId against allowed set for this section
            boolean invalidEntity = (entityId == null) || !allowedIds.get(sec).contains(entityId);
            if (invalidEntity) {
                // Clear bogus values to force remap
                entityId = null;
                bulletIdx = null;
            }

            // 1) Try ranks-based remap first (if we have ranks)
            List<Integer> ranks = (i < ranksPerPatch.size()) ? ranksPerPatch.get(i) : List.of();
            if (entityId == null || (sec.equals("EXPERIENCE") && bulletIdx == null)) {
                var viaRanks = mapByRanks(ranks, byRank, original);
                if (viaRanks != null) {
                    entityId = (entityId == null) ? viaRanks.refId() : entityId;
                    if (sec.equals("EXPERIENCE") && bulletIdx == null)
                        bulletIdx = viaRanks.bulletIndex();
                }
            }

            // 2) Fuzzy remap within same section if still missing
            if (entityId == null || (sec.equals("EXPERIENCE") && bulletIdx == null)) {
                CtxLine best = bestCtxForOriginal(original, ctxLines, sec);
                if (best != null) {
                    entityId = best.refId() != null ? best.refId() : entityId;

                    if (sec.equals("EXPERIENCE")) {
                        if (isBulletLike(best.refType())) {
                            bulletIdx = best.bulletIndex();
                        } else {
                            // non-bullet source -> compute insertion index at end of responsibilities
                            if (entityId != null)
                                bulletIdx = computeNextBulletIndexDb(resumeId, entityId);
                        }
                    } else {
                        bulletIdx = null; // non-EXPERIENCE never carries bulletIndex
                    }
                }
            }

            // 3) DB-backed bullet index match for EXPERIENCE when still null
            if (sec.equals("EXPERIENCE") && entityId != null && bulletIdx == null && notBlank(original)) {
                Integer fromDb = mapBulletIndexFromDb(resumeId, entityId, original);
                if (fromDb != null)
                    bulletIdx = fromDb;
            }

            // 4) If still missing entityId, we cannot safely place this patch -> drop
            if (entityId == null)
                continue;

            // Final validation: for EXPERIENCE, lock bulletIdx to the DB index if original
            if (sec.equals("EXPERIENCE") && entityId != null && notBlank(original)) {
                Integer trueIdx = mapBulletIndexFromDb(resumeId, entityId, original);
                if (trueIdx != null) {
                    bulletIdx = trueIdx; // override wrong model-provided index
                } else if (bulletIdx == null) {
                    bulletIdx = computeNextBulletIndexDb(resumeId, entityId); // insert at end if not an existing bullet
                }
            }

            String outwardSection = sec.equals("PROJECT") ? "PROJECTS" : sec;
            // Build fixed patch
            List<String> cleanVariants = variantValidator.cleanVariants(bp.variants());

            // If no usable variants remain, skip this patch
            if (cleanVariants.isEmpty()) {
                log.warn("Dropping patch #{} (section={}, entityId={}): no valid variants after cleaning",
                        i, bp.section(), bp.entityId());
                continue;
            }

            fixed.add(new TailorPlanDto.BulletPatch(
                    outwardSection,
                    entityId,
                    sec.equals("EXPERIENCE") ? bulletIdx : null,
                    bp.original(),
                    cleanVariants,
                    bp.keywordsAdded() == null ? List.of() : bp.keywordsAdded()));
        }

        return new TailorPlanDto(
                plan.atsScoreBefore(),
                plan.atsScoreAfter(),
                plan.globalKeywordsToAdd(),
                plan.globalKeywordsMissing(),
                fixed,
                plan.sectionOrderSuggested(),
                plan.provider(),
                plan.model(),
                plan.latencyMs(),
                plan.promptVersion(),
                plan.raw());
    }

    private String sectionNorm(String s) {
        if (s == null)
            return "EXPERIENCE";
        String t = s.trim().toUpperCase(Locale.ROOT);
        if (t.equals("PROJECTS"))
            return "PROJECT";
        return t;
    }

    private boolean isHeader(String refType) {
        return refType != null && refType.toUpperCase(Locale.ROOT).endsWith("_HEADER");
    }

    private CtxLine bestCtxForOriginal(String original, List<CtxLine> ctxLines, String sectionFilter) {
        if (original == null || original.isBlank())
            return null;
        String o = normalize(original);
        double best = 0.0;
        CtxLine bestCtx = null;
        for (CtxLine c : ctxLines) {
            if (sectionFilter != null && !sectionNorm(c.section()).equals(sectionFilter))
                continue;
            double sim = jaccardSim(o, normalize(c.content()));
            if (sim > best) {
                best = sim;
                bestCtx = c;
            }
        }
        // Only accept a reasonable match
        return (bestCtx != null && best >= config.getMatching().getFuzzy().getThreshold()) ? bestCtx : null;
    }

    private Integer mapBulletIndexFromDb(Long resumeId, Long experienceId, String original) {
        List<ResumeChunkDao.BulletRow> bullets = chunkDao.findExperienceBullets(resumeId, experienceId);
        if (bullets == null || bullets.isEmpty())
            return null;

        String oNorm = normalize(original);

        // Exact match first
        for (var br : bullets) {
            if (normalize(br.content()).equals(oNorm)) {
                return br.partOrder();
            }
        }

        // Fuzzy fallback
        double best = 0.0;
        Integer bestIdx = null;
        for (var br : bullets) {
            double sim = jaccardSim(oNorm, normalize(br.content()));
            if (sim > best) {
                best = sim;
                bestIdx = br.partOrder();
            }
        }
        return (bestIdx != null && best >= config.getMatching().getFuzzy().getStrict().getThreshold()) ? bestIdx : null; // slightly
    }

    private Integer computeNextBulletIndexDb(Long resumeId, Long experienceId) {
        Integer max = chunkDao.maxExperienceResponsibilityOrder(resumeId, experienceId);
        if (max == null || max < 0)
            return 0;
        return max + 1;
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private boolean isBulletLike(String refType) {
        return "EXPERIENCE_BULLET".equalsIgnoreCase(refType) ||
                "EXPERIENCE_ACHIEVEMENT".equalsIgnoreCase(refType);
    }

    private List<List<Integer>> extractSourceRanks(String rawJson, int expectedSize) {
        try {
            JsonNode root = mapper.readTree(rawJson);
            JsonNode arr = root.path("bulletPatches");
            List<List<Integer>> out = new ArrayList<>();
            if (arr.isArray()) {
                for (int i = 0; i < arr.size(); i++) {
                    JsonNode p = arr.get(i).path("sourceRanks");
                    if (p.isArray()) {
                        List<Integer> ranks = new ArrayList<>();
                        p.forEach(n -> ranks.add(n.asInt()));
                        out.add(ranks);
                    } else {
                        out.add(List.of());
                    }
                }
            }
            // pad if model returned fewer patches than parsed
            while (out.size() < expectedSize)
                out.add(List.of());
            return out;
        } catch (Exception e) {
            // no ranks available
            List<List<Integer>> empty = new ArrayList<>();
            for (int i = 0; i < expectedSize; i++)
                empty.add(List.of());
            return empty;
        }
    }

    private MappedRef mapByRanks(List<Integer> ranks, Map<Integer, CtxLine> byRank, String original) {
        if (ranks == null || ranks.isEmpty())
            return null;

        // 1) Direct: if any rank points to a bullet-like ctx with idx, use it
        for (Integer r : ranks) {
            CtxLine c = byRank.get(r);
            if (c == null)
                continue;
            if ("EXPERIENCE".equalsIgnoreCase(c.section()) && isBulletLike(c.refType()) && c.bulletIndex() != null) {
                return new MappedRef(c.refId(), c.bulletIndex());
            }
        }

        // 2) Indirect: take first EXPERIENCE rank; search bullet-like ctx with same
        for (Integer r : ranks) {
            CtxLine seed = byRank.get(r);
            if (seed == null)
                continue;
            if ("EXPERIENCE".equalsIgnoreCase(seed.section()) && seed.refId() != null) {
                double best = 0.0;
                CtxLine bestCtx = null;
                for (CtxLine c : byRank.values()) {
                    if (!Objects.equals(c.refId(), seed.refId()))
                        continue;
                    if (!"EXPERIENCE".equalsIgnoreCase(c.section()))
                        continue;
                    if (!isBulletLike(c.refType()))
                        continue;
                    double sim = jaccardSim(normalize(original), normalize(c.content()));
                    if (sim > best) {
                        best = sim;
                        bestCtx = c;
                    }
                }
                if (bestCtx != null && best >= config.getMatching().getFuzzy().getThreshold()) {
                    return new MappedRef(bestCtx.refId(), bestCtx.bulletIndex());
                }
            }
        }
        return null;
    }

    private String normalize(String s) {
        return s == null ? ""
                : s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9% ]+", " ").replaceAll("\\s+", " ").trim();
    }

    private double jaccardSim(String a, String b) {
        if (a.isEmpty() || b.isEmpty())
            return 0.0;
        var as = new java.util.HashSet<>(List.of(a.split("\\s+")));
        var bs = new java.util.HashSet<>(List.of(b.split("\\s+")));
        int inter = 0;
        for (String t : as)
            if (bs.contains(t))
                inter++;
        int union = as.size() + bs.size() - inter;
        return union == 0 ? 0.0 : (inter / (double) union);
    }

    /**
     * Compute ATS scores using multi-factor heuristics (never trust model scores)
     * 
     * Before = current resume state
     * After = resume with top patch variant applied per bullet
     */
    private int[] computeAtsScores(TailorPlanDto plan, Long resumeId, String jobDescription) {
        log.debug("Computing ATS scores for resume {}", resumeId);

        // Extract JD keywords for matching
        List<String> jdKeywords = extractKeywords(jobDescription, config.getKeywords().getJd().getLimit());
        log.debug("Extracted {} JD keywords for ATS scoring", jdKeywords.size());

        // Build current resume text
        List<ResumeChunker.Chunk> allChunks = chunker.buildChunks(resumeId);
        String currentResumeText = allChunks.stream()
                .map(ResumeChunker.Chunk::content)
                .collect(Collectors.joining("\n"));

        // Compute BEFORE score (current resume)
        int before = calculateAtsScore(currentResumeText, jdKeywords, jobDescription);
        log.debug("ATS before patches: {}", before);

        // Build simulated "after" resume by applying first variant of each patch
        String simulatedResumeText = simulateResumeWithPatches(currentResumeText, plan.bulletPatches());

        // Compute AFTER score (with patches)
        int after = calculateAtsScore(simulatedResumeText, jdKeywords, jobDescription);
        log.debug("ATS after patches: {}", after);

        // Safety: patches can't make score worse
        after = Math.max(before, after);

        // Add bonus for patch quality (keywords added, action verbs, metrics)
        int patchBonus = calculatePatchBonus(plan.bulletPatches(), jdKeywords);
        after = Math.min(100, after + patchBonus);

        log.info("Final ATS scores: before={}, after={}, patchBonus={}", before, after, patchBonus);

        return new int[] { before, after };
    }

    /**
     * Calculate ATS score using multi-factor heuristics
     */
    private int calculateAtsScore(String resumeText, List<String> jdKeywords, String jobDescription) {
        if (resumeText == null || resumeText.isBlank())
            return 0;

        String resumeLower = resumeText.toLowerCase(Locale.ROOT);
        String jdLower = jobDescription.toLowerCase(Locale.ROOT);

        // Factor 1: Keyword coverage (configurable max)
        int matchedKeywords = 0;
        for (String kw : jdKeywords) {
            if (resumeLower.contains(kw.toLowerCase(Locale.ROOT))) {
                matchedKeywords++;
            }
        }
        double keywordCoverage = jdKeywords.isEmpty() ? 0.0 : (matchedKeywords / (double) jdKeywords.size());
        int keywordScore = (int) Math.round(keywordCoverage * config.getAts().getWeight().getKeywords());

        // Factor 2: Action verb density (configurable max)
        int actionVerbScore = calculateActionVerbScore(resumeText, config.getAts().getWeight().getVerbs());

        // Factor 3: Metrics/quantification density (configurable max)
        int metricsScore = calculateMetricsScore(resumeText, config.getAts().getWeight().getMetrics());

        // Factor 4: Skill match depth (configurable max)
        int skillScore = calculateSkillMatchScore(resumeText, jdLower, config.getAts().getWeight().getSkills());

        // Factor 5: Recency/dates (configurable max)
        int recencyScore = calculateRecencyScore(resumeText, config.getAts().getWeight().getRecency());

        // Factor 6: Formatting health (configurable max)
        int formattingScore = calculateFormattingScore(resumeText, config.getAts().getWeight().getFormatting());

        int total = keywordScore + actionVerbScore + metricsScore + skillScore + recencyScore + formattingScore;

        log.debug("ATS breakdown: keyword={}, verbs={}, metrics={}, skills={}, recency={}, format={} => total={}",
                keywordScore, actionVerbScore, metricsScore, skillScore, recencyScore, formattingScore, total);

        return Math.min(100, total);
    }

    /**
     * Simulate resume text with patches applied (use first variant of each patch)
     */
    private String simulateResumeWithPatches(String currentText, List<TailorPlanDto.BulletPatch> patches) {
        if (patches == null || patches.isEmpty()) {
            return currentText;
        }

        StringBuilder simulated = new StringBuilder(currentText);

        // Append new/replaced bullets (simplified simulation - good enough for scoring)
        for (var patch : patches) {
            if (patch.variants() != null && !patch.variants().isEmpty()) {
                simulated.append("\n").append(patch.variants().get(0));
            }
        }

        // Append keywords added
        Set<String> allKeywords = patches.stream()
                .flatMap(bp -> bp.keywordsAdded() == null ? java.util.stream.Stream.<String>empty()
                        : bp.keywordsAdded().stream())
                .collect(Collectors.toSet());

        if (!allKeywords.isEmpty()) {
            simulated.append("\n").append(String.join(" ", allKeywords));
        }

        return simulated.toString();
    }

    /**
     * Calculate bonus points for patch quality
     */
    private int calculatePatchBonus(List<TailorPlanDto.BulletPatch> patches, List<String> jdKeywords) {
        if (patches == null || patches.isEmpty())
            return 0;

        int bonus = 0;

        // +1 per patch with keywords naturally added
        long patchesWithKeywords = patches.stream()
                .filter(bp -> bp.keywordsAdded() != null && !bp.keywordsAdded().isEmpty())
                .count();
        bonus += Math.min(3, patchesWithKeywords);

        // +1 if we have patches across multiple sections (shows comprehensive
        // tailoring)
        long uniqueSections = patches.stream()
                .map(bp -> bp.section() == null ? "UNKNOWN" : bp.section())
                .distinct()
                .count();
        if (uniqueSections >= 2)
            bonus += 2;

        // +1 for high-quality variants (action verbs, metrics)
        long qualityVariants = patches.stream()
                .flatMap(bp -> bp.variants() == null ? java.util.stream.Stream.<String>empty() : bp.variants().stream())
                .filter(v -> startsWithActionVerb(v) && containsMetric(v))
                .count();
        bonus += Math.min(2, qualityVariants / 2);

        return Math.min(config.getPatch().getBonus().getMax(), bonus); // cap at 7 points bonus
    }

    /**
     * Compute actual global keywords to add/missing by analyzing:
     * - JD keywords vs current resume
     * - Keywords naturally present in patch variants
     * 
     * This overrides model's hallucinated globalKeywordsToAdd
     */
    private GlobalKeywordAnalysis analyzeGlobalKeywords(
            String jobDescription,
            Long resumeId,
            List<TailorPlanDto.BulletPatch> patches) {

        // Extract JD keywords
        List<String> jdKeywords = extractKeywords(jobDescription, config.getKeywords().getJd().getLimit());

        // Get current resume text
        List<ResumeChunker.Chunk> allChunks = chunker.buildChunks(resumeId);
        String currentResumeText = allChunks.stream()
                .map(ResumeChunker.Chunk::content)
                .collect(Collectors.joining("\n"))
                .toLowerCase(Locale.ROOT);

        // Build text of all patch variants
        String patchVariantsText = patches == null ? ""
                : patches.stream()
                        .flatMap(bp -> bp.variants() == null ? java.util.stream.Stream.<String>empty()
                                : bp.variants().stream())
                        .collect(Collectors.joining("\n"))
                        .toLowerCase(Locale.ROOT);

        List<String> toAdd = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String kw : jdKeywords) {
            String kwLower = kw.toLowerCase(Locale.ROOT);
            boolean inResume = currentResumeText.contains(kwLower);
            boolean inPatches = patchVariantsText.contains(kwLower);

            if (!inResume && inPatches) {
                // Keyword added via patches
                toAdd.add(kw);
            } else if (!inResume && !inPatches) {
                // Still missing after patches
                missing.add(kw);
            }
            // else: already in resume or redundant
        }

        log.debug("Global keyword analysis: {} JD keywords, {} to add via patches, {} still missing",
                jdKeywords.size(), toAdd.size(), missing.size());

        return new GlobalKeywordAnalysis(toAdd, missing);
    }

    /**
     * Result of global keyword analysis
     */
    private record GlobalKeywordAnalysis(List<String> toAdd, List<String> missing) {
    }

    /**
     * Score action verb density in text
     */
    private int calculateActionVerbScore(String text, int maxPoints) {
        if (text == null || text.isBlank())
            return 0;

        String[] lines = text.split("\\n");
        int actionVerbLines = 0;
        int totalLines = 0;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.length() < 10)
                continue;
            totalLines++;

            if (startsWithActionVerb(trimmed)) {
                actionVerbLines++;
            }
        }

        if (totalLines == 0)
            return 0;
        double ratio = actionVerbLines / (double) totalLines;
        return (int) Math.round(ratio * maxPoints);
    }

    /**
     * Score metrics/quantification density
     */
    private int calculateMetricsScore(String text, int maxPoints) {
        if (text == null || text.isBlank())
            return 0;

        int metricCount = 0;
        metricCount += countMatches(text, "\\d+%");
        metricCount += countMatches(text, "\\b\\d{2,}\\b");
        metricCount += countMatches(text, "\\$\\d+");
        metricCount += countMatches(text, "\\d+\\s*(hour|day|week|month)s?");

        return Math.min(maxPoints, metricCount * 2);
    }

    /**
     * Score skill keyword matches
     */
    private int calculateSkillMatchScore(String resumeText, String jdLower, int maxPoints) {
        String[] commonSkills = {
                "java", "python", "javascript", "react", "angular", "vue", "node",
                "spring", "django", "flask", "docker", "kubernetes", "aws", "azure", "gcp",
                "sql", "postgresql", "mongodb", "redis", "kafka", "elasticsearch",
                "git", "ci/cd", "jenkins", "github", "gitlab", "agile", "scrum"
        };

        int matches = 0;
        String resumeLower = resumeText.toLowerCase(Locale.ROOT);

        for (String skill : commonSkills) {
            if (jdLower.contains(skill) && resumeLower.contains(skill)) {
                matches++;
            }
        }

        return Math.min(maxPoints, matches);
    }

    /**
     * Score recency (presence of recent years)
     */
    private int calculateRecencyScore(String text, int maxPoints) {
        int currentYear = java.time.Year.now().getValue();
        int score = 0;

        if (text.contains(String.valueOf(currentYear)))
            score += 2;
        if (text.contains(String.valueOf(currentYear - 1)))
            score += 2;
        if (text.contains(String.valueOf(currentYear - 2)))
            score += 1;

        return Math.min(maxPoints, score);
    }

    /**
     * Score formatting health (no first-person, clean structure)
     */
    private int calculateFormattingScore(String text, int maxPoints) {
        int score = maxPoints; // start at max

        String lower = text.toLowerCase(Locale.ROOT);

        if (lower.contains(" i ") || lower.startsWith("i "))
            score -= 2;
        if (lower.contains(" my ") || lower.contains(" we "))
            score -= 1;

        int hashes = countMatches(text, "#");
        if (hashes > 10)
            score -= 1;

        return Math.max(0, score);
    }

    /**
     * Check if text starts with strong action verb
     */
    private boolean startsWithActionVerb(String text) {
        if (text == null || text.isBlank())
            return false;

        String firstWord = text.trim().split("\\s+")[0].replaceAll("[^A-Za-z]", "");
        String[] actionVerbs = {
                "Led", "Managed", "Developed", "Built", "Designed", "Implemented", "Delivered",
                "Launched", "Optimized", "Improved", "Reduced", "Increased", "Achieved",
                "Created", "Established", "Directed", "Coordinated", "Executed", "Engineered",
                "Architected", "Deployed", "Scaled", "Automated", "Streamlined", "Drove",
                "Spearheaded", "Orchestrated", "Pioneered", "Accelerated", "Enhanced"
        };

        for (String verb : actionVerbs) {
            if (firstWord.equalsIgnoreCase(verb))
                return true;
        }

        // Lenient: any capitalized word is probably okay
        return !firstWord.isEmpty() && Character.isUpperCase(firstWord.charAt(0));
    }

    /**
     * Check if text contains metrics
     */
    private boolean containsMetric(String text) {
        if (text == null)
            return false;
        return text.matches(".*\\d+%.*") || text.matches(".*\\b\\d{2,}\\b.*") || text.matches(".*\\$\\d+.*");
    }

    /**
     * Count regex pattern matches
     */
    private int countMatches(String text, String regex) {
        if (text == null)
            return 0;
        var matcher = java.util.regex.Pattern.compile(regex).matcher(text);
        int count = 0;
        while (matcher.find())
            count++;
        return count;
    }

    private static final java.util.Set<String> STOP = java.util.Set.of(
            "the", "and", "for", "with", "that", "from", "this", "have", "has", "had", "into", "your", "you", "are",
            "our", "their",
            "will", "can", "able", "using", "use", "used", "such", "about", "over", "under", "within", "without", "per",
            "etc",
            "a", "an", "to", "in", "of", "by", "as", "on", "at", "be", "is", "was", "were", "or", "it", "we", "they",
            "i", "my", "me",
            // Job posting noise words
            "looking", "seeking", "candidate", "ideal", "strong", "excellent", "good", "great", "must", "should",
            "preferred", "nice", "plus", "bonus", "role", "position", "job", "opportunity", "required",
            // Generic resume noise
            "experience", "experienced", "engineer", "engineering", "developer", "development", "software", "project",
            "projects", "team", "teams", "requirements", "requirement", "responsibilities", "responsibility",
            "lead", "leading", "leadership", "work", "working", "skills", "ability", "knowledge");

    private List<String> extractKeywords(String text, int limit) {
        if (text == null)
            return List.of();
        String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-z0-9+.#/\\-]+");
        Map<String, Integer> freq = new HashMap<>();
        for (String t : tokens) {
            String k = t.trim();
            // Strip trailing punctuation
            k = k.replaceAll("[.,;:!?]+$", "");
            if (k.length() < 3)
                continue;
            if (STOP.contains(k))
                continue;
            freq.merge(k, 1, Integer::sum);
        }
        return freq.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private record CtxLine(int rank, String section, String refType, Long refId, Integer bulletIndex, String content) {
    }

    private record MappedRef(Long refId, Integer bulletIndex) {
    }

    private TailorPlanDto parsePlan(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            double before = root.path("atsScoreBefore").asDouble(0.0);
            double after = root.path("atsScoreAfter").asDouble(before);
            var globals = toList(root.path("globalKeywordsToAdd"));
            var missing = toList(root.path("globalKeywordsMissing"));
            var patches = new ArrayList<TailorPlanDto.BulletPatch>();
            var arr = root.path("bulletPatches");
            if (arr.isArray()) {
                for (var n : arr) {
                    patches.add(new TailorPlanDto.BulletPatch(
                            n.path("section").asText(null),
                            n.hasNonNull("entityId") ? n.path("entityId").asLong() : null,
                            n.hasNonNull("bulletIndex") ? n.path("bulletIndex").asInt() : null,
                            n.path("original").asText(null),
                            toList(n.path("variants")),
                            toList(n.path("keywordsAdded"))));
                }
            }
            var order = toList(root.path("sectionOrderSuggested"));
            return new TailorPlanDto(before, after, globals, missing, patches, order, null, null, null, "1.0", json);
        } catch (Exception e) {
            // fallback empty plan
            return new TailorPlanDto(0, 0, List.of(), List.of(), List.of(), List.of(), null, null, null, "1.0", json);
        }
    }

    private List<String> toList(JsonNode node) {
        if (node == null || !node.isArray())
            return List.of();
        List<String> out = new ArrayList<>();
        for (var n : node)
            out.add(n.asText());
        return out;
    }

    private boolean isAllowedRefType(String sectionNorm, String refType) {
        if (refType == null)
            return false;
        String rt = refType.toUpperCase(Locale.ROOT);
        switch (sectionNorm) {
            case "EXPERIENCE":
                return rt.equals("EXPERIENCE_BULLET") ||
                        rt.equals("EXPERIENCE_ACHIEVEMENT") ||
                        rt.equals("EXPERIENCE_DESC");
            case "PROJECT":
                return rt.equals("PROJECT_FEATURE") ||
                        rt.equals("PROJECT_SHORT_DESC") ||
                        rt.equals("PROJECT_OUTCOME") ||
                        rt.equals("PROJECT_IMPACT_METRICS"); // ok to convert to a bullet
            case "EDUCATION":
                return false;
            default:
                return false;
        }
    }

    /**
     * Compute which JD keywords are actually present in patch variants
     * (model often hallucinates keywordsAdded)
     */
    private List<String> computeActualKeywordsInVariants(List<String> variants, List<String> jdKeywords) {
        if (variants == null || variants.isEmpty() || jdKeywords == null) {
            return List.of();
        }

        String variantsText = String.join(" ", variants).toLowerCase(Locale.ROOT);
        List<String> actualKeywords = new ArrayList<>();

        for (String kw : jdKeywords) {
            if (variantsText.contains(kw.toLowerCase(Locale.ROOT))) {
                actualKeywords.add(kw);
            }
        }

        return actualKeywords;
    }
}