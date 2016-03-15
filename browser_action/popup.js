chrome.tabs.getSelected(null, function(tab) {
  window.domain = new URL(tab.url);
  $("#currentDomain").text(window.domain.hostname.replace("www.", ""));

  launchSearch();
});

function launchSearch(){
  //search for posts on domain
  console.log("URL",window.domain);
  $.ajax({
    url : 'https://api.producthunt.com/v1/posts/all?search[url]=' + window.domain,
    type : 'GET',
    headers:{
      'Authorization' : 'PH_BEARER_TOKEN',
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    },
    success : function(json){
      $(".results").slideDown(300);
      $(".loader").hide();
      var posts = json.posts
      if(posts.length===0){
        //No result
        $("#currentDomain").append(" - <small>Not hunted</small>")
        $(".huntit").toggle();
      }else{
        if(posts.length === 1) //singular vs. plural
          $("#currentDomain").append(" - <small>hunted "+posts.length+ " time</small>")
        else
          $("#currentDomain").append(" - <small>hunted "+posts.length+ " times</small>")

        $.each(posts,function(key,p){
          $(".results").append(getEmbedCode(p))
        })
      }
    },
    error : function() {
      console.log("ERRR");
    }
  });
}

function getEmbedCode(product){
  var s = '<div class="row product-details">';
        s += "<div class=\"col-xs-1\" style=\"text-align:center;\">"
          s += "<a class=\"p-votecount\" href=\""+product.discussion_url+"\"  target=\"_blank\">"
            s+= "<span><i class=\"fa fa-caret-up\"></i></span>"
            s+= "<span>"+ product.votes_count +"</span>"
          s += "</a>"
          s += "&nbsp;"
            s += "<a class=\"p-comcount\" href=\""+product.discussion_url+"\" target=\"_blank\">"
            s+= "<span><i class=\"fa fa-comment-o\"></i></span>"
            s+= "<span>"+ product.comments_count +"</span>"
          s += "</a>"
        s+= "</div>" // end col-xs-1
        s += "<div class=\"col-xs-3\">"
          s += "<img class=\"p-thumbnail\" src=\""+product.thumbnail.image_url+"\" />"
        s+= "</div>"
    s+= "<div class=\"col-xs-8  p-description\">"
      s += "<h3 class=\"p-name\"><a href=\""+product.redirect_url+"\" target=\"_blank\">"+product.name+"</a></h3>"
      s += "<h4 class=\"p-tagline\">"+product.tagline+"</h4>"
      s += "<h5>Posted by <a href=\""+product.user.profile_url+"\" target=\"_blank\">"+product.user.username +"</a>&nbsp;"+moment(product.created_at).fromNow()+"</h5>"
    s+= "</div>"
  s+= '</div>'
  return s;
}

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('huntBtn');
    link.addEventListener('click', function() {
        chrome.runtime.sendMessage("test");
    });
});
