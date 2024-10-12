let isOn;

function updateIcon() {
  const newBadgeText = isOn ? "On" : "Off";
  chrome.action.setBadgeText({ text: newBadgeText });
}

function toggle() {
  isOn = !isOn;
  chrome.storage.sync.set({ isOn: isOn });
  chrome.tabs.query({}, function (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, { toggle: "toggle" });
    }
  });
  updateIcon();
}

chrome.storage.sync.get("isOn", function (data) {
  isOn = data.isOn;
  if (isOn === undefined) {
    isOn = true;
    chrome.storage.sync.set({ isOn: isOn });
  }
  updateIcon();
});

chrome.action.onClicked.addListener(function (tab) {
  toggle();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.isOn !== undefined) {
    isOn = request.isOn;
    updateIcon();
  } else if (request.action === "captureSnapshot") {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
      sendResponse({imgSrc: dataUrl});
    });
    return true; // Indicates that the response is asynchronous
  }
});