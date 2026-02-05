// assets/verify.js
// TPF Verify v1 — file hash verification only

const statusEl = document.getElementById("status");
const statusMsgEl = document.getElementById("statusMsg");
const serialEl = document.getElementById("serial");
const fileEl = document.getElementById("file");
const verifyBtn = document.getElementById("verifyBtn");
const resultEl = document.getElementById("result");

function setStatus(text, color, msg) {
  statusEl.textContent = text;
  statusEl.style.color = color;
  statusMsgEl.textContent = msg || "";
}

// Compute SHA-256 (hex, lowercase)
async function sha256Hex(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Load and validate Verify v1 manifest
async function loadManifestV1() {
  const res = await fetch("manifest.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Manifest load failed (${res.status})`);
  }

  const data = await res.json();

  if (
    !data ||
    data.verify_version !== "v1" ||
    !Array.isArray(data.items)
  ) {
    throw new Error(
      "Unsupported manifest schema. Expected verify_version:v1 with items[]."
    );
  }

  return data.items.map(item => ({
    item_id: item.item_id || "",
    item_name: item.item_name || "",
    sha256: String(item.sha256 || "").toLowerCase().trim(),
    notes: item.notes || ""
  }));
}

function formatValidResult(hit, fileHash, serial) {
  const lines = [
    "✅ VALID",
    "",
    `Item: ${hit.item_name || "(unnamed item)"}`,
    `ID:   ${hit.item_id || "(no id)"}`
  ];

  if (hit.notes) {
    lines.push(`Notes: ${hit.notes}`);
  }

  lines.push("");
  lines.push("SHA-256:");
  lines.push(fileHash);

  if (serial) {
    lines.push("");
    lines.push(`(Serial entered: ${serial} — not verified in v1)`);
  }

  return lines.join("\n");
}

function formatInvalidResult(fileHash, serial) {
  const lines = [
    "❌ INVALID",
    "",
    "File hash not found in manifest.json.",
    "",
    "SHA-256:",
    fileHash
  ];

  if (serial) {
    lines.push("");
    lines.push(`(Serial entered: ${serial} — not verified in v1)`);
  }

  return lines.join("\n");
}

// Main verification handler
verifyBtn.addEventListener("click", async () => {
  resultEl.textContent = "";
  setStatus("Checking…", "gray", "Computing hash and comparing to manifest…");

  try {
    const file = fileEl.files && fileEl.files[0];
    if (!file) {
      setStatus("Idle", "gray", "Please select a file.");
      resultEl.textContent = "⚠ No file selected.";
      return;
    }

    const serial = (serialEl.value || "").trim();

    const fileHash = (await sha256Hex(file)).toLowerCase();
    const items = await loadManifestV1();

    const hit = items.find(it => it.sha256 === fileHash);

    if (hit) {
      setStatus(
        "Valid",
        "green",
        "File hash matches a published TPF reference."
      );
      resultEl.textContent = formatValidResult(hit, fileHash, serial);
    } else {
      setStatus(
        "Invalid",
        "crimson",
        "File hash not found in Verify v1 manifest."
      );
      resultEl.textContent = formatInvalidResult(fileHash, serial);
    }
  } catch (err) {
    setStatus("Error", "crimson", "Verification failed.");
    resultEl.textContent =
      "❌ ERROR\n\n" + (err && err.message ? err.message : String(err));
  }
});

// Initial system check
(function init() {
  if (!window.crypto || !crypto.subtle) {
    setStatus(
      "Error",
      "crimson",
      "Your browser does not support SHA-256 (crypto.subtle)."
    );
    return;
  }

  setStatus(
    "Ready",
    "green",
    "Upload a file to verify it against manifest.json."
  );
})();
