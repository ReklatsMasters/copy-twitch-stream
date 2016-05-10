'use strict'

chrome.runtime.onMessage.addListener(function (url, sender, done) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send()

  done(xhr.responseText)
})

//Listen for when a Tab changes state
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(changeInfo && changeInfo.status == "complete") {
    
    chrome.tabs.sendMessage(tabId, {data: tab})
  }
})
