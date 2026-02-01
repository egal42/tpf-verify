// ===== System status check =====
(async function checkStatus() {
  const statusEl = document.getElementById("status");
  const statusMsgEl = document.getElementById("statusMsg");
  if (!statusEl) return;

  // Initial state
  statusEl.textContent = "Checking…";
  statusEl.style.color = "gray";
  if (statusMsgEl) statusMsgEl.textContent = "Checking system…";

  try {
    const res = await fetch("manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Manifest not reachable");

    // Online
    statusEl.textContent = "Online";
    statusEl.style.color = "green";
    if (statusMsgEl) statusMsgEl.textContent = "The verification system is ready and operational.";
  } catch (e) {
    // Offline
    statusEl.textContent = "Offline";
    statusEl.style.color = "red";
    if (statusMsgEl) statusMsgEl.textContent = "Verification is temporarily unavailable. Please try again later.";
  }
})();

// ===== Verification logic =====
const resultEl = document.getElementById("result");
const button = document.getElementById("verifyBtn");

function out(txt) {
  resultEl.textContent = txt;
}

button.addEventListener("click", async () => {
  out("Verifying…");

  const serial = document.getElementById("serial").value.trim();
  const fileInput = document.getElementById("file");

  if (!serial) return out("❌ INVALID\nReason: Missing serial ID.");
  if (!fileInput.files.length) return out("❌ INVALID\nReason: No file uploaded.");

  try {
    const file = fileInput.files[0];
    const buffer = await file.arrayBuffer();

    // Compute SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Load manifest (no cache so updates show immediately)
    const res = await fetch("manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Manifest not reachable");

    const manifest = await res.json();
    const match = (manifest.shares || []).find(s => s.serial === serial);

    if (!match) {
      return out(
        `❌ INVALID\nReason: Serial not found.\n\nEntered: ${serial}\n\nComputed SHA-256:\n${hashHex}`
      );
    }

    if ((match.sha256 || "").toLowerCase() !== hashHex.toLowerCase()) {
      return out(
        `❌ INVALID\nReason: Hash mismatch.\n\nExpected:\n${match.sha256}\n\nGot:\n${hashHex}`
      );
    }

    return out(
      `✅ VALID\n\nSerial: ${match.serial}\nShare: ${match.share_no}/${manifest.shares_total}\nCO₂ share: ${match.co2_kg} kg\n\nSHA-256:\n${hashHex}`
    );

  } catch (e) {
    return out("❌ INVALID\nReason: Error.\n\n" + (e?.message || e));
  }
});
