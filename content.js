var isOn = true;
chrome.runtime.sendMessage({isOn: isOn});

document.addEventListener("mouseup", function() {
  if (isOn) {
  var selectedText = window.getSelection().toString();
  selectedText = selectedText.replace(/\s+/g, " ");
  if (selectedText) {
      console.log(selectedText);
      var apiUrl = "api_url"; //api_url
  var requestBody = { message: selectedText };

  fetch(apiUrl, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.response.choices[0].text);
  })
  .catch(error => console.log(error));
  }}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.toggle === "toggle") {
      isOn = !isOn;
      chrome.runtime.sendMessage({isOn: isOn});
    }
  });
  chrome.storage.sync.get("isOn", function(data) {
    var isOn = data.isOn;
    if (isOn === undefined) {
      isOn = true;
      chrome.storage.sync.set({isOn: isOn});
    }
    chrome.runtime.sendMessage({isOn: isOn});
  });
  