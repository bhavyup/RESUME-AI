// app-bridge.js - Bridge between extension and ResumeAI web app
// Injected into ResumeAI pages to enable communication

(function () {
  "use strict";

  const EXTENSION_SOURCE = "resumeai-extension";
  const APP_SOURCE = "resumeai-app";

  // Receive messages from extension background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "RESUMEAI_LINKEDIN_RESULT") {
      try {
        // Forward to web app via window.postMessage
        window.postMessage(
          {
            source: EXTENSION_SOURCE,
            type: "linkedin-import-result",
            payload: message.payload,
            timestamp: Date.now(),
          },
          window.location.origin
        );
        sendResponse({ ok: true });
      } catch (err) {
        console.error("[ResumeAI Bridge] Error forwarding result:", err);
        sendResponse({ ok: false, error: err?.message });
      }
      return true;
    }
  });

  // Listen for messages from web app
  window.addEventListener("message", (event) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin) return;

    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.source !== APP_SOURCE) return;

    // Handle ping request (extension detection)
    if (data.type === "linkedin-extension-ping") {
      window.postMessage(
        {
          source: EXTENSION_SOURCE,
          type: "linkedin-extension-pong",
          requestId: data.requestId,
          version: chrome.runtime.getManifest?.()?.version || "unknown",
        },
        window.location.origin
      );
      return;
    }

    // Handle start scrape request
    if (data.type === "linkedin-extension-start") {
      const { profileUrl, token, requestId } = data.payload || {};

      const preferredModel = localStorage.getItem("resumeai-default-model");

      chrome.runtime.sendMessage(
        {
          type: "LINKEDIN_START_FROM_APP",
          payload: { profileUrl, token, preferredModel },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            window.postMessage(
              {
                source: EXTENSION_SOURCE,
                type: "linkedin-extension-start-failed",
                requestId,
                error:
                  chrome.runtime.lastError.message ||
                  "Extension communication failed",
              },
              window.location.origin
            );
            return;
          }

          if (response?.ok) {
            window.postMessage(
              {
                source: EXTENSION_SOURCE,
                type: "linkedin-extension-started",
                requestId,
              },
              window.location.origin
            );
          } else {
            window.postMessage(
              {
                source: EXTENSION_SOURCE,
                type: "linkedin-extension-start-failed",
                requestId,
                error: response?.error || "Failed to start LinkedIn import",
              },
              window.location.origin
            );
          }
        }
      );
      return;
    }

    // Handle get config request
    if (data.type === "linkedin-extension-get-config") {
      chrome.runtime.sendMessage({ type: "GET_CONFIG" }, (response) => {
        window.postMessage(
          {
            source: EXTENSION_SOURCE,
            type: "linkedin-extension-config",
            requestId: data.requestId,
            config: response || {},
          },
          window.location.origin
        );
      });
      return;
    }
  });

  // Announce extension presence
  window.postMessage(
    {
      source: EXTENSION_SOURCE,
      type: "linkedin-extension-ready",
      version: chrome.runtime.getManifest?.()?.version || "unknown",
    },
    window.location.origin
  );

  console.log("[ResumeAI Bridge] App bridge loaded");
})();
