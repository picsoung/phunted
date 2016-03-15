var client = new Keen({
   projectId: "KEEN_PROJECT_ID", // String (required always)
   writeKey: "KEEN_WRITE_KEY",   // String (required for sending data)
 });

 var USER_ID = "";

function sendTabUrl() {
  chrome.tabs.query(
    {currentWindow: true, active : true},
    function(tabArray){
      if (tabArray[0]["url"] != window.currentDomain) {
        if(tabArray[0]["url"].indexOf('producthunt.com')==-1){ //when not producthunt
          // console.log(tabArray[0]);
          var site ={
            link: tabArray[0]["url"],
            title:tabArray[0]["title"]
          }
          chrome.storage.sync.set({'phunted': site}, function() {});
       }
        window.currentDomain = tabArray[0]["url"];//url_domain(tabArray[0]["url"]).replace("www.", "");
        updateIconColor();
      }
    }
  );
}

// When an URL changes
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    sendTabUrl();
});


// When active tab changes
chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
   sendTabUrl();
});


// API call to check if product is hunted
// credit to FGrante
// https://github.com/emailhunter/chrome-extension
function updateIconColor() {
  $.ajax({
    url : 'https://api.producthunt.com/v1/posts/all?search[url]=' + window.currentDomain,
    type : 'GET',
    headers:{
      'Authorization' : 'PH_BEARER_TOKEN',
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    },
    success : function(response){
      sendKeenEvent(window.currentDomain,response.posts.length);
      if (response.posts.length > 0) { setColoredIcon(); }
      else { setGreyIcon(); }
    },
    error : function() {
      setColoredIcon();
    }
  });
}

function setGreyIcon() {
  chrome.browserAction.setIcon({
    path : {
      "19": chrome.extension.getURL("shared/img/phunted19_grey.png"),
      "38": chrome.extension.getURL("shared/img/phunted38_grey.png")
    }
  });
}

function setColoredIcon() {
  chrome.browserAction.setIcon({
    path : {
      "19": chrome.extension.getURL("shared/img/phunted19.png"),
      "38": chrome.extension.getURL("shared/img/phunted38.png")
    }
  });
}

function url_domain(data) {
  var    a      = document.createElement('a');
         a.href = data;
  return a.hostname;
}

function sendKeenEvent(URL, nb_ph_posts){
  var event = {
    url: URL,
    domain: URI(URL).domain(),
    hunted: nb_ph_posts,
    user_id: USER_ID
  };
  client.addEvent("sitesVisited", event, function(err, res){});
}

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrom e.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (userid) {
        useToken(userid);
    } else {
        userid = getRandomToken();
        chrome.storage.sync.set({userid: userid}, function() {
            // useToken(userid);
            USER_ID = userid;
        });
    }
});

//wait for onclick event
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    chrome.storage.sync.get("phunted", function (obj) {
        var site = obj.phunted;
          var event = {
          url: site.link,
          domain: URI(site.link).domain(),
          name: site.title,
          user_id: USER_ID
        };
        client.addEvent("huntButtonClick", event, function(err, res){});
    });
});
