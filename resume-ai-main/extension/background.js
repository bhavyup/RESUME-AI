// background.js - Service worker for ResumeAI LinkedIn extension

const ENV = {
  // Will be replaced during build or read from storage
  API_BASE: null,
  APP_URL: null,
};

// Determine API base from current environment
async function getApiBase() {
  if (ENV.API_BASE) return ENV.API_BASE;

  // Check storage for saved preference
  const stored = await chrome.storage.local.get(["apiBase"]);
  if (stored.apiBase) {
    ENV.API_BASE = stored.apiBase;
    ENV.APP_URL = stored.apiBase;
    return ENV.API_BASE;
  }

  // Default based on extension ID or fallback
  // In production, check if we're installed from store
  const manifest = chrome.runtime.getManifest();
  const isDev =
    manifest.version.includes("dev") || !chrome.runtime.id.startsWith("ext");

  ENV.API_BASE = isDev ? "http://localhost:3000" : "https://resumelm.com";
  ENV.APP_URL = ENV.API_BASE;

  return ENV.API_BASE;
}

// Wait for tab to fully load
function waitForTabComplete(tabId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const listener = (updatedId, info) => {
      if (updatedId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // Timeout fallback
    const checkInterval = setInterval(async () => {
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error("Tab load timeout"));
        return;
      }

      try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.status === "complete") {
          clearInterval(checkInterval);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      } catch {
        clearInterval(checkInterval);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error("Tab no longer exists"));
      }
    }, 500);
  });
}

// Ensure content script is injected
async function ensureContentScript(tabId) {
  try {
    // Try to ping the content script
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "LINKEDIN_PING",
    });
    if (response?.ok) return true;
  } catch {
    // Content script not loaded, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });
      // Wait a moment for script to initialize
      await new Promise((r) => setTimeout(r, 500));
      return true;
    } catch (err) {
      console.error("Failed to inject content script:", err);
      return false;
    }
  }
  return true;
}

// Send result to ResumeAI app
async function deliverResultToApp(result) {
  const appUrl = await getApiBase();

  try {
    // Find existing ResumeAI tab
    const appTabs = await chrome.tabs.query({ url: `${appUrl}/*` });
    let targetTab = appTabs.find((t) => t.url?.includes("/profile"));

    if (!targetTab && appTabs.length > 0) {
      targetTab = appTabs[0];
    }

    if (!targetTab) {
      // Create new tab
      targetTab = await chrome.tabs.create({
        url: `${appUrl}/profile`,
        active: true,
      });
      await waitForTabComplete(targetTab.id);
      // Wait for app-bridge to load
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (targetTab?.id) {
      // Try to send message
      try {
        await chrome.tabs.sendMessage(targetTab.id, {
          type: "RESUMEAI_LINKEDIN_RESULT",
          payload: { result },
        });
      } catch {
        // Bridge might not be loaded, inject it
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          files: ["app-bridge.js"],
        });
        await new Promise((r) => setTimeout(r, 300));
        await chrome.tabs.sendMessage(targetTab.id, {
          type: "RESUMEAI_LINKEDIN_RESULT",
          payload: { result },
        });
      }

      // Bring tab to focus
      await chrome.tabs.update(targetTab.id, { active: true });
      return true;
    }
  } catch (err) {
    console.error("Failed to deliver result to app:", err);
    throw err;
  }

  return false;
}

// Call the ingest API
async function callIngestAPI(payload, token, preferredModel) {
  const apiBase = await getApiBase();
  const url = `${apiBase}/api/linkedin-ingest`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["x-linkedin-token"] = token;
  }

  if (preferredModel) {
    headers["x-preferred-model"] = preferredModel;
  }

  console.log(`[ResumeAI BG] calling API with model: ${preferredModel || 'server-default'}`);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Main scrape flow
async function runScrapeFlow(profileUrl, token, preferredModel) {
  console.log("[ResumeAI BG] Starting scrape flow for:", profileUrl);

  // Validate URL
  if (!profileUrl?.includes("linkedin.com/in/")) {
    throw new Error(
      "Invalid LinkedIn profile URL. Expected format: https://www.linkedin.com/in/username"
    );
  }

  // Normalize URL
  let targetUrl = profileUrl.trim();
  if (!targetUrl.startsWith("http")) {
    targetUrl = `https://${targetUrl}`;
  }

  // Open LinkedIn tab
  const tab = await chrome.tabs.create({ url: targetUrl, active: true });

  try {
    await waitForTabComplete(tab.id);

    // Extra wait for dynamic content
    await new Promise((r) => setTimeout(r, 2000));

    // Ensure content script is loaded
    const scriptReady = await ensureContentScript(tab.id);
    if (!scriptReady) {
      throw new Error("Could not load scraper on LinkedIn page");
    }

    // Run scrape
    console.log("[ResumeAI BG] Sending scrape request to content script");
    const scrapeRes = await chrome.tabs.sendMessage(tab.id, {
      type: "LINKEDIN_SCRAPE_REQUEST",
    });

    if (!scrapeRes?.ok) {
      throw new Error(
        scrapeRes?.error ||
          "Scraping failed - LinkedIn may have blocked the request"
      );
    }

    console.log("[ResumeAI BG] Scrape successful, calling API");

    // Send to API
    const apiRes = await callIngestAPI(scrapeRes.payload, token, preferredModel);

    if (!apiRes?.result) {
      throw new Error("API did not return processed result");
    }

    console.log("[ResumeAI BG] API processing complete, delivering to app");

    // Deliver to app
    await deliverResultToApp(apiRes.result);

    return { ok: true, result: apiRes.result };
  } catch (err) {
    console.error("[ResumeAI BG] Scrape flow error:", err);
    throw err;
  }
}

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[ResumeAI BG] Received message:", message?.type);

  // Handle scrape result from popup
  if (message?.type === "LINKEDIN_SCRAPE_RESULT") {
    (async () => {
      try {
        const apiRes = await callIngestAPI(message.payload, message.token);

        if (apiRes?.result) {
          await deliverResultToApp(apiRes.result);
          sendResponse({ ok: true, data: apiRes });
        } else {
          sendResponse({ ok: false, error: "No result from API" });
        }
      } catch (err) {
        console.error("[ResumeAI BG] Ingest error:", err);
        sendResponse({ ok: false, error: err?.message || "Processing failed" });
      }
    })();
    return true;
  }

  // Handle start request from app
  if (message?.type === "LINKEDIN_START_FROM_APP") {
    (async () => {
      try {
        const { profileUrl, token, preferredModel } = message.payload || {};
        const result = await runScrapeFlow(profileUrl, token, preferredModel);
        sendResponse({ ok: true, ...result });
      } catch (err) {
        console.error("[ResumeAI BG] Start from app error:", err);
        sendResponse({ ok: false, error: err?.message || "Import failed" });
      }
    })();
    return true;
  }

  // Handle popup requesting scrape on current tab
  if (message?.type === "POPUP_SCRAPE_CURRENT") {
    (async () => {
      try {
        const { token, tabId } = message;

        // Ensure content script
        await ensureContentScript(tabId);

        // Scrape
        const scrapeRes = await chrome.tabs.sendMessage(tabId, {
          type: "LINKEDIN_SCRAPE_REQUEST",
        });
        if (!scrapeRes?.ok) {
          throw new Error(scrapeRes?.error || "Scraping failed");
        }

        // Send to API
        const apiRes = await callIngestAPI(scrapeRes.payload, token);

        if (apiRes?.result) {
          await deliverResultToApp(apiRes.result);
          sendResponse({ ok: true, data: apiRes });
        } else {
          sendResponse({ ok: false, error: "No result from API" });
        }
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || "Failed" });
      }
    })();
    return true;
  }

  // Get current config
  if (message?.type === "GET_CONFIG") {
    (async () => {
      const apiBase = await getApiBase();
      sendResponse({ apiBase });
    })();
    return true;
  }

  // Set config
  if (message?.type === "SET_CONFIG") {
    (async () => {
      const { apiBase } = message;
      if (apiBase) {
        await chrome.storage.local.set({ apiBase });
        ENV.API_BASE = apiBase;
        ENV.APP_URL = apiBase;
      }
      sendResponse({ ok: true });
    })();
    return true;
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[ResumeAI] Extension installed/updated");
  await getApiBase();
});

console.log("[ResumeAI] Background service worker loaded");
