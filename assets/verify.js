// assets/verify.js
// TPF Verify v1 — file integrity verification (SHA-256 only)

const statusEl = document.getElementById("status");
const statusMsgEl = document.getElementById("statusMsg");
const fileEl = document.getElementById("file");
const verifyBtn = document.getElementById("verifyBtn");
const resultEl = document.getElementById("result");

function setStatusChip(text, type, msg) {
  statusEl.textContent = text;

  statusEl.className = "status-chip";
  if (type === "ok") statusEl.classList.add("status-chip--ok");
  else if (type === "bad") statusEl.classList.add("status-chip--bad");
  else if (type === "warn") statusEl.classList.add("status-chip--warn");
  else statusEl.classList.add("status-chip--neutral");

  statusMsgEl.textContent = msg || "";
}

function setResultState(state) {
  // state: neutral | ok | bad | warn
  resultEl.className = "result";
  if (state === "ok") resultEl.classList.add("result--ok");
  else if (state === "bad") resultEl.classList.add("result--bad");
  else if (state === "warn") resultEl.classList.add("result--warn");
  else resultEl.classList.add("result--neutral");
}

async function sha256Hex(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function loadManifestV1() {
  const res = await fetch("manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest load failed (${res.status})`);

  const data = await res.json();
  if (!data || data.verify_version !== "v1" || !Array.isArray(data.items)) {
    throw new Error("Unsupported manifest schema (expected Verify v1)");
  }

  return data.items.map(item => ({
    item_id: item.item_id || "",
    item_name: item.item_name || "",
    sha256: String(item.sha256 || "").toLowerCase().trim(),
    notes: item.notes || ""
  }));
}

function formatValid(hit, hash) {
  const out = [];
  out.push("VALID");
  out.push("");
  out.push(`Item:  ${hit.item_name || "(unnamed)"}`);
  out.push(`ID:    ${hit.item_id || "(no id)"}`);
  if (hit.notes) out.push(`Notes: ${hit.notes}`);
  out.push("");
  out.push("SHA-256:");
  out.push(hash);
  return out.join("\n");
}

function formatInvalid(hash) {
  return [
    "INVALID",
    "",
    "File hash not found in manifest.json.",
    "",
    "SHA-256:",
    hash
  ].join("\n");
}

verifyBtn.addEventListener("click", async () => {
  resultEl.textContent = "";
  setResultState("neutral");
  setStatusChip("Checking", "neutral", "Computing hash and comparing to manifest…");

  try {
    const file = fileEl.files && fileEl.files[0];
    if (!file) {
      setStatusChip("Idle", "neutral", "Please select a file.");
      setResultState("warn");
      resultEl.textContent = "No file selected.";
      return;
    }

    const hash = (await sha256Hex(file)).toLowerCase();
    const items = await loadManifestV1();
    const hit = items.find(it => it.sha256 === hash);

    if (hit) {
      setStatusChip("Valid", "ok", "File hash matches a published TPF reference.");
      setResultState("ok");
      resultEl.textContent = formatValid(hit, hash);
    } else {
      setStatusChip("Invalid", "bad", "File hash not found in Verify v1 manifest.");
      setResultState("bad");
      resultEl.textContent = formatInvalid(hash);
    }
  } catch (err) {
    setStatusChip("Error", "warn", "Verification failed.");
    setResultState("warn");
    resultEl.textContent =
      "ERROR\n\n" + (err && err.message ? err.message : String(err));
  }
});

(function init() {
  if (!window.crypto || !crypto.subtle) {
    setStatusChip("Error", "warn", "Your browser does not support SHA-256 (crypto.subtle).");
    setResultState("warn");
    return;
  }

  setStatusChip("Ready", "ok", "Upload a file to verify it against manifest.json.");
  setResultState("neutral");
})();
