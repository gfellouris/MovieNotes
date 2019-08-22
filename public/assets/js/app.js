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
      showMsg("Movie " + delId + " deleted.", "alert alert-danger");
    } else {
      showMsg("Movie " + delId + " not found.", "alert alert-danger");
    }
    location.reload();
  });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/movienote/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
  $("#myModal").modal("hide");
  location.reload();
});

// Whenever someone clicks a p tag
$(document).on("click", ".addnote", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  $("#myModal").modal("show");
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/api/movie/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h6>" + data.title + "</h6>");
      $("#notes").append("<hr>");
      // An input to enter a new title
      $("#notes").append(
        "<input class='form-control' type='text' id='titleinput' name='title' placeholder='Enter title for note...'>"
      );
      $("#notes").append("<hr>");
      // A textarea to add a new note body
      $("#notes").append(
        "<textarea class='form-control' type='text' id='bodyinput' name='body' placeholder='Enter body of note...'></textarea>"
      );
      $("#notes").append("<hr>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append(
        "<button class='btn btn-primary' type='button' data-id='" +
          data._id +
          "' id='savenote'>Save Note</button>"
      );

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});
