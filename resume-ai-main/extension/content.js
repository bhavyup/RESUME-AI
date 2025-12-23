// content.js - LinkedIn profile scraper with robust selectors and fallbacks

(function () {
  "use strict";

  const SCRAPE_TIMEOUT_MS = 30000;
  const SCROLL_STEP = 500;
  const SCROLL_DELAY = 300;
  const MAX_SCROLL_ATTEMPTS = 20;

  // Utility functions
  function text(el) {
    if (!el) return "";
    return (el.innerText || el.textContent || "").trim();
  }

  function attr(el, name) {
    return el?.getAttribute?.(name) || "";
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function queryFirst(selectors, context = document) {
    for (const selector of selectors) {
      try {
        const el = context.querySelector(selector);
        if (el) return el;
      } catch {
        // Invalid selector, skip
      }
    }
    return null;
  }

  function queryAll(selectors, context = document) {
    const results = [];
    for (const selector of selectors) {
      try {
        const els = context.querySelectorAll(selector);
        if (els.length) {
          results.push(...Array.from(els));
        }
      } catch {
        // Invalid selector, skip
      }
    }
    // Deduplicate
    return [...new Set(results)];
  }

  function findSectionByHeading(headingText) {
    const headings = queryAll([
      "section h2",
      "section [class*='section-title']",
      "main section div[class*='header'] span",
    ]);

    for (const heading of headings) {
      const t = text(heading).toLowerCase();
      if (t.includes(headingText.toLowerCase())) {
        // Walk up to find the section
        let parent = heading;
        for (let i = 0; i < 5 && parent; i++) {
          if (parent.tagName === "SECTION") return parent;
          parent = parent.parentElement;
        }
        // Fallback: return grandparent
        return (
          heading.closest("section") || heading.parentElement?.parentElement
        );
      }
    }
    return null;
  }

  async function autoScroll() {
    const scrollable = document.scrollingElement || document.documentElement;
    const maxScroll = Math.max(scrollable.scrollHeight, 8000);
    let currentPos = 0;
    let attempts = 0;

    while (currentPos < maxScroll && attempts < MAX_SCROLL_ATTEMPTS) {
      window.scrollBy(0, SCROLL_STEP);
      currentPos += SCROLL_STEP;
      attempts++;
      await delay(SCROLL_DELAY);

      // Check if we've reached the bottom
      if (
        window.innerHeight + window.scrollY >=
        scrollable.scrollHeight - 100
      ) {
        break;
      }
    }

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: "instant" });
    await delay(200);
  }

  function extractName() {
    const nameSelectors = [
      "h1.text-heading-xlarge",
      ".pv-text-details__left-panel h1",
      "h1[class*='break-words']",
      ".top-card-layout__title",
      "h1",
    ];

    const nameEl = queryFirst(nameSelectors);
    const fullName = text(nameEl);

    if (!fullName) return { first_name: "", last_name: "" };

    const parts = fullName.split(/\s+/).filter(Boolean);
    return {
      first_name: parts.shift() || "",
      last_name: parts.join(" ") || "",
    };
  }

  function extractHeadline() {
    const selectors = [
      ".text-body-medium.break-words",
      ".pv-text-details__left-panel .text-body-medium",
      ".top-card-layout__headline",
      "[data-generated-suggestion-target]",
    ];

    return text(queryFirst(selectors)) || undefined;
  }

  function extractLocation() {
    const selectors = [
      ".text-body-small.inline.t-black--light.break-words",
      ".pv-text-details__left-panel .text-body-small",
      ".top-card-layout__first-subline",
      "span[class*='location']",
    ];

    return text(queryFirst(selectors)) || undefined;
  }

  function extractAbout() {
    const section = findSectionByHeading("about");
    if (!section) return undefined;

    const contentSelectors = [
      ".inline-show-more-text",
      "[class*='full-width'] span[aria-hidden='true']",
      ".pv-about__summary-text",
      "p",
    ];

    const content = text(queryFirst(contentSelectors, section));
    return content || undefined;
  }

  function extractExperience() {
    const section = findSectionByHeading("experience");
    if (!section) return [];

    const experiences = [];
    const items = queryAll(
      ["li.artdeco-list__item", "li[class*='pvs-list__item']", "ul > li"],
      section
    );

    for (const item of items) {
      // Skip nested items (sub-roles within a company)
      if (item.closest("li")?.closest("li")) continue;

      const exp = {
        position: "",
        company: "",
        location: undefined,
        date: "",
        description: [],
        technologies: [],
      };

      // Position/Title - usually the first bold text
      const titleSelectors = [
        "div[class*='display-flex'] span[aria-hidden='true']",
        ".t-bold span[aria-hidden='true']",
        ".pv-entity__summary-info h3",
        "strong",
      ];
      exp.position = text(queryFirst(titleSelectors, item));

      // Company name
      const companySelectors = [
        ".t-14.t-normal span[aria-hidden='true']",
        ".pv-entity__secondary-title",
        "[class*='hoverable-link-text'] span[aria-hidden='true']",
      ];
      const companyText = text(queryFirst(companySelectors, item));
      // Company might include employment type like "Full-time"
      exp.company = companyText.split("·")[0]?.trim() || companyText;

      // Date range
      const dateSelectors = [
        ".t-14.t-normal.t-black--light span[aria-hidden='true']",
        "[class*='date-range'] span[aria-hidden='true']",
        ".pv-entity__date-range span:last-child",
        "time",
      ];
      exp.date = text(queryFirst(dateSelectors, item)) || "";

      // Location
      const locationSelectors = [
        ".t-14.t-normal.t-black--light span[aria-hidden='true']:last-child",
        "[class*='location'] span[aria-hidden='true']",
      ];
      const allSpans = queryAll(dateSelectors.concat(locationSelectors), item);
      // Location is often the last light text after date
      if (allSpans.length >= 2) {
        const potentialLocation = text(allSpans[allSpans.length - 1]);
        if (
          potentialLocation &&
          !potentialLocation.includes("yr") &&
          !potentialLocation.includes("mo")
        ) {
          exp.location = potentialLocation;
        }
      }

      // Description - look for bullet points or paragraphs
      const descContainer = queryFirst(
        [
          ".pvs-list__outer-container",
          ".pv-entity__extra-details",
          "[class*='show-more-less']",
        ],
        item
      );

      if (descContainer) {
        const bullets = queryAll(
          ["li span[aria-hidden='true']", "li", "p"],
          descContainer
        );
        exp.description = bullets
          .map((b) => text(b))
          .filter((t) => t && t.length > 10 && t.length < 1000)
          .slice(0, 10);
      }

      // Only add if we have meaningful data
      if (exp.position || exp.company) {
        experiences.push(exp);
      }
    }

    return experiences;
  }

  function extractEducation() {
    const section = findSectionByHeading("education");
    if (!section) return [];

    const education = [];
    const items = queryAll(
      ["li.artdeco-list__item", "li[class*='pvs-list__item']", "ul > li"],
      section
    );

    for (const item of items) {
      if (item.closest("li")?.closest("li")) continue;

      const edu = {
        school: "",
        degree: "",
        field: "",
        date: "",
        location: undefined,
        achievements: [],
      };

      // School name
      const schoolSelectors = [
        "div[class*='display-flex'] span[aria-hidden='true']",
        ".t-bold span[aria-hidden='true']",
        ".pv-entity__school-name",
        "[class*='hoverable-link-text']",
      ];
      edu.school = text(queryFirst(schoolSelectors, item));

      // Degree and field
      const degreeSelectors = [
        ".t-14.t-normal span[aria-hidden='true']",
        ".pv-entity__degree-name span",
        ".pv-entity__fos span",
      ];
      const degreeText = text(queryFirst(degreeSelectors, item));
      // Often formatted as "Degree, Field" or "Degree - Field"
      const degreeParts = degreeText.split(/[,\-·]/);
      edu.degree = degreeParts[0]?.trim() || "";
      edu.field = degreeParts.slice(1).join(" ").trim() || "";

      // Date
      const dateSelectors = [
        ".t-14.t-normal.t-black--light span[aria-hidden='true']",
        ".pv-entity__dates span:last-child",
        "time",
      ];
      edu.date = text(queryFirst(dateSelectors, item)) || "";

      // Activities/Achievements
      const activitiesContainer = queryFirst(
        [".pvs-list__outer-container", ".pv-entity__extra-details"],
        item
      );

      if (activitiesContainer) {
        const activities = queryAll(
          ["li span[aria-hidden='true']", "li"],
          activitiesContainer
        );
        edu.achievements = activities
          .map((a) => text(a))
          .filter((t) => t && t.length > 5 && t.length < 500)
          .slice(0, 5);
      }

      if (edu.school) {
        education.push(edu);
      }
    }

    return education;
  }

  function extractSkills() {
    const section = findSectionByHeading("skills");
    if (!section) {
      // Try alternative: skills might be in a different format
      const skillsSection = findSectionByHeading("top skills");
      if (!skillsSection) return [];
    }

    const targetSection = section || findSectionByHeading("top skills");
    if (!targetSection) return [];

    const skillSelectors = [
      ".pv-skill-category-entity__name-text",
      ".pvs-list__item span[aria-hidden='true']",
      "[class*='skill'] span[aria-hidden='true']",
      ".pv-skill-entity__skill-name",
    ];

    const skillEls = queryAll(skillSelectors, targetSection);
    const skillItems = skillEls
      .map((el) => text(el))
      .filter((s) => s && s.length >= 2 && s.length < 60)
      .filter((s) => !s.match(/^\d+$/)) // Filter out pure numbers
      .slice(0, 50);

    if (skillItems.length === 0) return [];

    return [{ category: "Skills", items: [...new Set(skillItems)] }];
  }

  function extractProjects() {
    const section = findSectionByHeading("projects");
    if (!section) return [];

    const projects = [];
    const items = queryAll(
      ["li.artdeco-list__item", "li[class*='pvs-list__item']"],
      section
    );

    for (const item of items) {
      if (item.closest("li")?.closest("li")) continue;

      const proj = {
        name: "",
        description: [],
        date: "",
        url: undefined,
        technologies: [],
      };

      const nameSelectors = [
        "div[class*='display-flex'] span[aria-hidden='true']",
        ".t-bold span[aria-hidden='true']",
      ];
      proj.name = text(queryFirst(nameSelectors, item));

      const dateSelectors = [
        ".t-14.t-normal.t-black--light span[aria-hidden='true']",
        "time",
      ];
      proj.date = text(queryFirst(dateSelectors, item)) || "";

      const descContainer = queryFirst(
        [".pvs-list__outer-container", "[class*='show-more']"],
        item
      );
      if (descContainer) {
        proj.description = [text(descContainer)].filter(Boolean);
      }

      // Look for links
      const link = item.querySelector("a[href*='http']");
      if (link) {
        const href = attr(link, "href");
        if (href && !href.includes("linkedin.com")) {
          proj.url = href;
        }
      }

      if (proj.name) {
        projects.push(proj);
      }
    }

    return projects;
  }

  function extractContactInfo() {
    // Contact info is often in a modal or separate section
    // This is harder to get without clicking "Contact info"
    // We'll try to get what's visible

    const email = queryFirst(["a[href^='mailto:']", "[class*='email'] a"]);

    const website = queryFirst([
      "a[href*='://']:not([href*='linkedin.com'])",
      "[class*='website'] a",
    ]);

    const github = queryFirst(["a[href*='github.com']"]);

    return {
      email: email ? attr(email, "href").replace("mailto:", "") : undefined,
      website: website ? attr(website, "href") : undefined,
      github_url: github ? attr(github, "href") : undefined,
    };
  }

  function getRawText() {
    const main = document.querySelector("main") || document.body;
    const text = main.innerText || "";
    // Clean up and truncate
    return text.replace(/\s+/g, " ").trim().slice(0, 15000);
  }

  async function scrape() {
    console.log("[ResumeAI] Starting LinkedIn scrape...");

    // Scroll to load lazy content
    await autoScroll();
    await delay(500);

    const payload = {
      source: "linkedin-extension",
      url: window.location.href,
      scraped_at: new Date().toISOString(),
    };

    // Extract all sections
    const nameData = extractName();
    payload.first_name = nameData.first_name;
    payload.last_name = nameData.last_name;

    payload.headline = extractHeadline();
    payload.location = extractLocation();
    payload.about = extractAbout();

    const contactInfo = extractContactInfo();
    payload.email = contactInfo.email;
    payload.website = contactInfo.website;
    payload.github_url = contactInfo.github_url;
    payload.linkedin_url = window.location.href;

    payload.work_experience = extractExperience();
    payload.education = extractEducation();
    payload.skills = extractSkills();
    payload.projects = extractProjects();

    // Raw text fallback for AI processing
    payload.raw_text = getRawText();

    console.log("[ResumeAI] Scrape complete:", {
      name: `${payload.first_name} ${payload.last_name}`,
      experiences: payload.work_experience?.length || 0,
      education: payload.education?.length || 0,
      skills: payload.skills?.[0]?.items?.length || 0,
      projects: payload.projects?.length || 0,
    });

    return payload;
  }

  // Message listener for scrape requests
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "LINKEDIN_SCRAPE_REQUEST") {
      const timeoutId = setTimeout(() => {
        sendResponse({
          ok: false,
          error: "Scrape timeout - page took too long to load",
        });
      }, SCRAPE_TIMEOUT_MS);

      scrape()
        .then((payload) => {
          clearTimeout(timeoutId);
          sendResponse({ ok: true, payload });
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.error("[ResumeAI] Scrape error:", err);
          sendResponse({ ok: false, error: err?.message || "Scrape failed" });
        });

      return true; // Async response
    }

    if (message?.type === "LINKEDIN_PING") {
      sendResponse({ ok: true, url: window.location.href });
      return true;
    }
  });

  console.log("[ResumeAI] LinkedIn content script loaded");
})();
