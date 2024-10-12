let isOn = true;
chrome.runtime.sendMessage({ isOn: isOn });

document.addEventListener("mouseup", function (event) {
  if (isOn) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      console.log(selectedText);
      const apiUrl = "https://amanpatel.in/api/sgpt.php"; // api_url
      const requestBody = { message: selectedText };

      fetch(apiUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.response.choices[0].text);
        })
        .catch((error) => console.log(error));

      // Capture and send snapshot
      captureSnapshot(event);
    }
  }
});

function captureSnapshot(event) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const captureData = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  };

  chrome.runtime.sendMessage({action: "captureSnapshot"}, function(response) {
    if (response && response.imgSrc) {
      cropImage(response.imgSrc, captureData)
        .then(croppedImageBlob => {
          const formData = new FormData();
          formData.append("image", croppedImageBlob, "snapshot.png");

          const api2Url = "https://amanpatel.in/api/upload.php"; // Replace with your actual API2 URL
          fetch(api2Url, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Snapshot uploaded successfully:", data);
            })
            .catch((error) => {
              console.error("Error uploading snapshot:", error);
            });
        })
        .catch(error => {
          console.error("Error cropping image:", error);
        });
    } else {
      console.error("Failed to capture snapshot");
    }
  });
}

function cropImage(imageSrc, cropData) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = cropData.width;
      canvas.height = cropData.height;

      // Calculate the device pixel ratio
      const dpr = window.devicePixelRatio || 1;

      // Scale the crop coordinates and dimensions
      const scaledX = cropData.x * dpr;
      const scaledY = cropData.y * dpr;
      const scaledWidth = cropData.width * dpr;
      const scaledHeight = cropData.height * dpr;

      ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight, 0, 0, cropData.width, cropData.height);

      canvas.toBlob(resolve, 'image/png');
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.toggle === "toggle") {
    isOn = !isOn;
    chrome.runtime.sendMessage({ isOn: isOn });
  }
});

chrome.storage.sync.get("isOn", function (data) {
  isOn = data.isOn;
  if (isOn === undefined) {
    isOn = true;
    chrome.storage.sync.set({ isOn: isOn });
  }
  chrome.runtime.sendMessage({ isOn: isOn });
});