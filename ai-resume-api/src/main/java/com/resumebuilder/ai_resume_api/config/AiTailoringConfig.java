package com.resumebuilder.ai_resume_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiTailoringConfig {

    private final Ats ats = new Ats();
    private final Matching matching = new Matching();
    private final Patch patch = new Patch();
    private final Keywords keywords = new Keywords();
    private final Generation generation = new Generation();
    private final Tailor tailor = new Tailor();

    public Ats getAts() {
        return ats;
    }

    public Matching getMatching() {
        return matching;
    }

    public Patch getPatch() {
        return patch;
    }

    public Keywords getKeywords() {
        return keywords;
    }

    public Generation getGeneration() {
        return generation;
    }

    public Tailor getTailor() {
        return tailor;
    }

    // ATS Scoring Weights
    public static class Ats {
        private Weight weight = new Weight();

        public Weight getWeight() {
            return weight;
        }

        public static class Weight {
            private int keywords = 40;
            private int verbs = 20;
            private int metrics = 20;
            private int skills = 10;
            private int recency = 5;
            private int formatting = 5;

            public int getKeywords() {
                return keywords;
            }

            public void setKeywords(int keywords) {
                this.keywords = keywords;
            }

            public int getVerbs() {
                return verbs;
            }

            public void setVerbs(int verbs) {
                this.verbs = verbs;
            }

            public int getMetrics() {
                return metrics;
            }

            public void setMetrics(int metrics) {
                this.metrics = metrics;
            }

            public int getSkills() {
                return skills;
            }

            public void setSkills(int skills) {
                this.skills = skills;
            }

            public int getRecency() {
                return recency;
            }

            public void setRecency(int recency) {
                this.recency = recency;
            }

            public int getFormatting() {
                return formatting;
            }

            public void setFormatting(int formatting) {
                this.formatting = formatting;
            }
        }
    }

    // Fuzzy Matching Thresholds
    public static class Matching {
        private Fuzzy fuzzy = new Fuzzy();

        public Fuzzy getFuzzy() {
            return fuzzy;
        }

        public static class Fuzzy {
            private double threshold = 0.45;
            private Strict strict = new Strict();

            public double getThreshold() {
                return threshold;
            }

            public void setThreshold(double threshold) {
                this.threshold = threshold;
            }

            public Strict getStrict() {
                return strict;
            }

            public static class Strict {
                private double threshold = 0.70;

                public double getThreshold() {
                    return threshold;
                }

                public void setThreshold(double threshold) {
                    this.threshold = threshold;
                }
            }
        }
    }

    // Patch Configuration
    public static class Patch {
        private Bonus bonus = new Bonus();

        public Bonus getBonus() {
            return bonus;
        }

        public static class Bonus {
            private int max = 7;

            public int getMax() {
                return max;
            }

            public void setMax(int max) {
                this.max = max;
            }
        }
    }

    // Keyword Extraction
    public static class Keywords {
        private Jd jd = new Jd();

        public Jd getJd() {
            return jd;
        }

        public static class Jd {
            private int limit = 30;
            private Context context = new Context();

            public int getLimit() {
                return limit;
            }

            public void setLimit(int limit) {
                this.limit = limit;
            }

            public Context getContext() {
                return context;
            }

            public static class Context {
                private int limit = 12;

                public int getLimit() {
                    return limit;
                }

                public void setLimit(int limit) {
                    this.limit = limit;
                }
            }
        }
    }

    // Model Generation Parameters
    public static class Generation {
        private double temperature = 0.3;
        private int numPredict = 900;
        private double topP = 0.9;
        private Single single = new Single();

        public double getTemperature() {
            return temperature;
        }

        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }

        public int getNumPredict() {
            return numPredict;
        }

        public void setNumPredict(int numPredict) {
            this.numPredict = numPredict;
        }

        public double getTopP() {
            return topP;
        }

        public void setTopP(double topP) {
            this.topP = topP;
        }

        public Single getSingle() {
            return single;
        }

        public static class Single {
            private double temperature = 0.22;
            private int numPredict = 360;

            public double getTemperature() {
                return temperature;
            }

            public void setTemperature(double temperature) {
                this.temperature = temperature;
            }

            public int getNumPredict() {
                return numPredict;
            }

            public void setNumPredict(int numPredict) {
                this.numPredict = numPredict;
            }
        }
    }

    // Tailoring Defaults
    public static class Tailor {
        private Topk topk = new Topk();
        private int minPatches = 3;
        private Content content = new Content();

        public Topk getTopk() {
            return topk;
        }

        public int getMinPatches() {
            return minPatches;
        }

        public void setMinPatches(int minPatches) {
            this.minPatches = minPatches;
        }

        public Content getContent() {
            return content;
        }

        public static class Topk {
            private int defaultValue = 8;
            private int max = 20;

            public int getDefaultValue() {
                return defaultValue;
            }

            public void setDefaultValue(int defaultValue) {
                this.defaultValue = defaultValue;
            }

            public int getMax() {
                return max;
            }

            public void setMax(int max) {
                this.max = max;
            }
        }

        public static class Content {
            private Clamp clamp = new Clamp();

            public Clamp getClamp() {
                return clamp;
            }

            public static class Clamp {
                private int jd = 1800;
                private int chunk = 350;

                public int getJd() {
                    return jd;
                }

                public void setJd(int jd) {
                    this.jd = jd;
                }

                public int getChunk() {
                    return chunk;
                }

                public void setChunk(int chunk) {
                    this.chunk = chunk;
                }
            }
        }
    }
}