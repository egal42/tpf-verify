// ===== System status check =====
(async function checkStatus() {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  statusEl.textContent = "Checking…";
  statusEl.style.color = "gray";

  try {
    const res = await fetch("/manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Manifest not reachable");

    statusEl.textContent = "Online";
    statusEl.style.color = "green";
  } catch (e) {
    statusEl.textContent = "Offline";
    statusEl.style.color = "red";
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

  if (!serial) return out("❌ Please enter a serial ID.");
  if (!fileInput.files.length) return out("❌ Please upload a file.");

  try {
    const file = fileInput.files[0];
    const buffer = await file.arrayBuffer();

    // Compute SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Load manifest (no cache so updates show immediately)
    const res = await fetch("/manifest.json", { cache: "no-store" });
    const manifest = await res.json();

    const match = (manifest.shares || []).find(s => s.serial === serial);

    if (!match) {
      return out(
        `❌ Serial not found.\n\nEntered: ${serial}\n\nComputed SHA-256:\n${hashHex}`
      );
    }

    if ((match.sha256 || "").toLowerCase() !== hashHex.toLowerCase()) {
      return out(
        `❌ Hash mismatch.\n\nExpected:\n${match.sha256}\n\nGot:\n${hashHex}`
      );
    }

    return out(
      `✅ VALID\n\nSerial: ${match.serial}\nShare: ${match.share_no}/${manifest.shares_total}\nCO₂ share: ${match.co2_kg} kg\n\nSHA-256:\n${hashHex}`
    );

  } catch (e) {
    return out("❌ Error:\n" + (e?.message || e));
  }
});
