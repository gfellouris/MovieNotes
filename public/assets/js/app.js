function showMsg(msg, css) {
  $("#message").html(msg);
  $("#message").attr("class", css);
  $("#message").show();
  
}
function hideMsg() {
  $("#message").empty();
  $("#message").hide();
}

$(".search-form").on("submit", function(event) {
  event.preventDefault();
  var searchQuery = $("#movie-search")
    .val()
    .trim();

  $.get("/api/scrape/" + searchQuery, {}).then(function() {
    location.reload();
  });
});

$(document).on("click", ".fa-trash-alt", function() {
  var delId = $(this).attr("id");

  $.get("/api/delete/" + delId, function(data) {
    console.log(data);
    if (data) {
      showMsg("Movie " + delId + " deleted.","alert alert-danger");
    } else {
      showMsg("Movie " + delId + " not found.","alert alert-danger");
    }
    location.reload();
  });
});