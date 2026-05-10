const API_BASE = "https://phishguard-backend-6ypq.onrender.com/api";

const urlInput = document.getElementById("urlInput");
const scanBtn = document.getElementById("scanBtn");
const loading = document.getElementById("loading");
const resultCard = document.getElementById("resultCard");
const errorBox = document.getElementById("errorBox");
const currentTabUrl = document.getElementById("currentTabUrl");
const useCurrentBtn = document.getElementById("useCurrentBtn");

let currentTab = null;

// Load current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    currentTab = tabs[0];
    const url = tabs[0].url || "";
    const short = url.length > 40 ? url.substring(0, 40) + "..." : url;
    currentTabUrl.textContent = short;
  }
});

// Use current tab URL
useCurrentBtn.addEventListener("click", () => {
  if (currentTab && currentTab.url) {
    urlInput.value = currentTab.url;
  }
});

// Scan on Enter key
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") scanUrl();
});

// Scan button
scanBtn.addEventListener("click", scanUrl);

function scanUrl() {
  const url = urlInput.value.trim();
  if (!url) {
    showError("Please enter a URL to scan.");
    return;
  }

  // Reset UI
  hideAll();
  loading.classList.add("show");
  scanBtn.disabled = true;

  fetch(`${API_BASE}/scan/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Server error: " + res.status);
      return res.json();
    })
    .then((data) => {
      loading.classList.remove("show");
      scanBtn.disabled = false;
      showResult(data);
    })
    .catch((err) => {
      loading.classList.remove("show");
      scanBtn.disabled = false;
      showError("Could not reach PhishGuard server. Make sure you are connected to the internet.");
    });
}

function showResult(data) {
  resultCard.classList.remove("safe", "suspicious", "phishing");
  resultCard.classList.add("show");

  const verdict = (data.verdict || "UNKNOWN").toUpperCase();
  const finalScore = Math.round((data.final_score || 0) * 100);
  const mlScore = Math.round((data.ml_score || 0) * 100);
  const urlScore = Math.round((data.url_risk_score || 0) * 100);

  document.getElementById("finalScore").textContent = finalScore + "%";
  document.getElementById("mlScore").textContent = mlScore + "%";
  document.getElementById("urlScore").textContent = urlScore + "%";

  setTimeout(() => {
    document.getElementById("finalBar").style.width = finalScore + "%";
    document.getElementById("mlBar").style.width = mlScore + "%";
    document.getElementById("urlBar").style.width = urlScore + "%";
  }, 100);

  if (verdict.includes("SAFE") || verdict.includes("TRUSTED")) {
    resultCard.classList.add("safe");
    document.getElementById("verdictIcon").textContent = "✅";
    document.getElementById("verdictText").textContent = "SAFE";
    document.getElementById("verdictSub").textContent = "No threats detected";
    document.getElementById("finalBar").className = "score-fill fill-safe";
  } else if (verdict.includes("SUSPICIOUS")) {
    resultCard.classList.add("suspicious");
    document.getElementById("verdictIcon").textContent = "⚠️";
    document.getElementById("verdictText").textContent = "SUSPICIOUS";
    document.getElementById("verdictSub").textContent = "Proceed with caution";
    document.getElementById("finalBar").className = "score-fill fill-warn";
  } else {
    resultCard.classList.add("phishing");
    document.getElementById("verdictIcon").textContent = "🚨";
    document.getElementById("verdictText").textContent = "PHISHING";
    document.getElementById("verdictSub").textContent = "Do NOT visit this site!";
    document.getElementById("finalBar").className = "score-fill fill-danger";
  }
}

function showError(msg) {
  errorBox.textContent = "⚠️ " + msg;
  errorBox.classList.add("show");
}

function hideAll() {
  loading.classList.remove("show");
  resultCard.classList.remove("show");
  errorBox.classList.remove("show");
  document.getElementById("finalBar").style.width = "0%";
  document.getElementById("mlBar").style.width = "0%";
  document.getElementById("urlBar").style.width = "0%";
}
