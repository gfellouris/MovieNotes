$(".search-form").on("submit", function(event) {
  event.preventDefault();
  var searchQuery = $("#movie-search")
    .val()
    .trim();

  $.get("/api/scrape/" + searchQuery, {}).then(function() {
    location.reload();
  });
});
