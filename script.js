const backendURL = "https://ascii-video.onrender.com/convert";

const videoInput = document.getElementById("videoInput");
const uploadArea = document.getElementById("upload-area");
const browse = document.getElementById("browse");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const statusText = document.getElementById("status");
const brightnessInput = document.getElementById("brightness");
const brightnessValue = document.getElementById("brightness-value");

let selectedFile = null;

// Drag & drop handlers
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.style.background = "#21262d";
});
uploadArea.addEventListener("dragleave", () => {
  uploadArea.style.background = "transparent";
});
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  selectedFile = e.dataTransfer.files[0];
  showPreview(selectedFile);
});

browse.addEventListener("click", () => videoInput.click());
videoInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  showPreview(selectedFile);
});

brightnessInput.addEventListener("input", () => {
  brightnessValue.textContent = brightnessInput.value;
});

function showPreview(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.style.display = "block";
}

// Handle conversion
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please upload a video first!");
    return;
  }

  const width = document.getElementById("width").value;
  const brightness = brightnessInput.value;

  const formData = new FormData();
  formData.append("video", selectedFile);
  formData.append("width", width);
  formData.append("brightness", brightness);

  convertBtn.disabled = true;
  convertBtn.textContent = "⏳ Processing...";
  progressBar.style.width = "0%";
  statusText.textContent = "Uploading video...";

  try {
    const response = await fetch(backendURL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server Error: " + response.status);
    }

    // Track progress (fake progress while waiting)
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < 95) {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
      }
    }, 400);

    const blob = await response.blob();
    clearInterval(progressInterval);

    progressBar.style.width = "100%";
    progressText.textContent = "100%";
    statusText.textContent = "✅ Conversion complete! Downloading file...";

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii_video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    statusText.textContent = "❌ " + err.message;
  } finally {
    convertBtn.disabled = false;
    convertBtn.textContent = "🎬 Convert to ASCII";
  }
});

