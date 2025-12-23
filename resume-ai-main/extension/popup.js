// popup.js - Extension popup controller

const DOM = {
  scrapeCurrentBtn: document.getElementById("scrape-current"),
  openLinkedInBtn: document.getElementById("open-linkedin"),
  scrapeUrlBtn: document.getElementById("scrape-url"),
  profileUrlInput: document.getElementById("profile-url"),
  tokenInput: document.getElementById("token"),
  status: document.getElementById("status"),
  currentPageContainer: document.getElementById("current-page-container"),
  currentPageText: document.getElementById("current-page-text"),
};

let currentLinkedInTab = null;

function setStatus(message, type = "info") {
  DOM.status.textContent = message;
  DOM.status.className = `status visible ${type}`;
}

function clearStatus() {
  DOM.status.className = "status";
}

function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = '<div class="spinner"></div> Processing...';
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
}

async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.url?.includes("linkedin.com/in/")) {
      currentLinkedInTab = tab;
      DOM.currentPageContainer.style.display = "flex";
      DOM.scrapeCurrentBtn.style.display = "flex";
      DOM.openLinkedInBtn.style.display = "none";

      // Extract username from URL for display
      const match = tab.url.match(/linkedin\.com\/in\/([^/?]+)/);
      const username = match?.[1] || "Profile";
      DOM.currentPageText.textContent = `linkedin.com/in/${username}`;
    } else {
      currentLinkedInTab = null;
      DOM.currentPageContainer.style.display = "none";
      DOM.scrapeCurrentBtn.style.display = "none";
      DOM.openLinkedInBtn.style.display = "flex";
    }
  } catch (err) {
    console.error("Error checking current tab:", err);
  }
}

async function scrapeCurrentTab() {
  if (!currentLinkedInTab?.id) {
    setStatus("No LinkedIn profile tab detected", "error");
    return;
  }

  setLoading(DOM.scrapeCurrentBtn, true);
  clearStatus();
  setStatus("Scraping profile...", "info");

  try {
    const token = DOM.tokenInput.value.trim() || undefined;

    const response = await chrome.runtime.sendMessage({
      type: "POPUP_SCRAPE_CURRENT",
      tabId: currentLinkedInTab.id,
      token,
    });

    if (response?.ok) {
      setStatus("Import successful! Check ResumeAI for review.", "success");
    } else {
      throw new Error(response?.error || "Import failed");
    }
  } catch (err) {
    console.error("Scrape error:", err);
    setStatus(err?.message || "Something went wrong", "error");
  } finally {
    setLoading(DOM.scrapeCurrentBtn, false);
  }
}

async function openLinkedInAndScrape() {
  setLoading(DOM.openLinkedInBtn, true);
  clearStatus();
  setStatus("Opening LinkedIn...", "info");

  try {
    // Open LinkedIn homepage or user's profile
    const tab = await chrome.tabs.create({
      url: "https://www.linkedin.com/feed/",
      active: true,
    });

    setStatus(
      "Navigate to your profile and click 'Import This Profile'",
      "info"
    );

    // Close popup - user will use extension on LinkedIn page
    setTimeout(() => window.close(), 1500);
  } catch (err) {
    console.error("Error opening LinkedIn:", err);
    setStatus("Failed to open LinkedIn", "error");
    setLoading(DOM.openLinkedInBtn, false);
  }
}

async function scrapeFromUrl() {
  const url = DOM.profileUrlInput.value.trim();

  if (!url) {
    setStatus("Please enter a LinkedIn profile URL", "error");
    DOM.profileUrlInput.focus();
    return;
  }

  if (!url.includes("linkedin.com/in/")) {
    setStatus("Invalid URL. Expected: linkedin.com/in/username", "error");
    return;
  }

  setLoading(DOM.scrapeUrlBtn, true);
  clearStatus();
  setStatus("Opening profile and importing...", "info");

  try {
    const token = DOM.tokenInput.value.trim() || undefined;

    const response = await chrome.runtime.sendMessage({
      type: "LINKEDIN_START_FROM_APP",
      payload: { profileUrl: url, token },
    });

    if (response?.ok) {
      setStatus("Import successful! Check ResumeAI for review.", "success");
    } else {
      throw new Error(response?.error || "Import failed");
    }
  } catch (err) {
    console.error("URL scrape error:", err);
    setStatus(err?.message || "Something went wrong", "error");
  } finally {
    setLoading(DOM.scrapeUrlBtn, false);
  }
}

// Event listeners
DOM.scrapeCurrentBtn.addEventListener("click", scrapeCurrentTab);
DOM.openLinkedInBtn.addEventListener("click", openLinkedInAndScrape);
DOM.scrapeUrlBtn.addEventListener("click", scrapeFromUrl);

DOM.profileUrlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") scrapeFromUrl();
});

// Initialize
checkCurrentTab();
