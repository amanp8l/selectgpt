var isOn;

function updateIcon() {
  var newBadgeText = isOn ? "On" : "Off";
  chrome.browserAction.setBadgeText({text: newBadgeText});
}

function toggle() {
  isOn = !isOn;
  chrome.storage.sync.set({isOn: isOn});
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, { toggle: "toggle" });
    }
  });
  updateIcon();
}

chrome.storage.sync.get("isOn", function(data) {
  isOn = data.isOn;
  if (isOn === undefined) {
    isOn = true;
    chrome.storage.sync.set({isOn: isOn});
  }
  updateIcon();
});

chrome.browserAction.onClicked.addListener(function(tab) {
  toggle();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.isOn !== undefined) {
    isOn = request.isOn;
    updateIcon();
  }
});