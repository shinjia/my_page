const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const startCameraBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");

const countdown = document.getElementById("countdown");
const message = document.getElementById("message");

const previewArea = document.getElementById("previewArea");
const photoPreview = document.getElementById("photoPreview");
const downloadLink = document.getElementById("downloadLink");

let cameraStream = null;

// 開啟 Webcam
async function startCamera() {
  try {
    if (cameraStream) {
      stopCamera();
    }

    message.textContent = "正在開啟 Webcam...";

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user"
      },
      audio: false
    });

    video.srcObject = cameraStream;
    captureBtn.disabled = false;
    startCameraBtn.textContent = "重新開啟 Webcam";
    message.textContent = "Webcam 已開啟，可以拍照。";

  } catch (error) {
    console.error(error);
    captureBtn.disabled = true;
    message.textContent = "無法開啟 Webcam，請確認瀏覽器已允許攝影機權限。";
  }
}

// 停止 Webcam
function stopCamera() {
  if (!cameraStream) return;

  cameraStream.getTracks().forEach(track => track.stop());
  cameraStream = null;
}

// 等待指定毫秒
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 倒數 3、2、1
async function startCountdown() {
  captureBtn.disabled = true;
  startCameraBtn.disabled = true;

  message.textContent = "準備拍照...";

  for (let number = 3; number >= 1; number--) {
    countdown.textContent = number;
    await sleep(1000);
  }

  countdown.textContent = "";
  takePhoto();

  captureBtn.disabled = false;
  startCameraBtn.disabled = false;
}

// 擷取目前 Webcam 畫面
function takePhoto() {
  if (!video.videoWidth || !video.videoHeight) {
    message.textContent = "Webcam 畫面尚未準備完成。";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  // 預覽畫面是鏡像，因此拍照時也做水平翻轉
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 模擬快門閃光
  video.classList.add("flash");
  setTimeout(() => {
    video.classList.remove("flash");
  }, 350);

  // 轉成 JPG
  const photoData = canvas.toDataURL("image/jpeg", 0.92);

  photoPreview.src = photoData;
  previewArea.classList.remove("hidden");

  const now = new Date();

  const fileName =
    "webcam_" +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0") +
    ".jpg";

  downloadLink.href = photoData;
  downloadLink.download = fileName;

  message.textContent = "拍照完成，照片已自動下載。";

  // 自動下載；若瀏覽器阻擋，仍可按下「下載照片」
  downloadLink.click();
}

startCameraBtn.addEventListener("click", startCamera);

captureBtn.addEventListener("click", () => {
  if (!cameraStream) {
    message.textContent = "請先開啟 Webcam。";
    return;
  }

  startCountdown();
});

window.addEventListener("beforeunload", stopCamera);
