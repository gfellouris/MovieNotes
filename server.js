var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/movieScrape", { useNewUrlParser: true });

// Functions

function displayMovies(response) {
  db.Movie.find({}).then(function(dbMovie) {
    response.render("index", { movies: dbMovie });
  });
}

app.get("/home", function(req, res) {
  // res.send("Home Page");
  displayMovies(res);
});
// Routes
// A GET route for scraping the echoJS website
app.get("/api/scrape/:search", function(req, res) {
  //   console.log("scrape...");
  // First, we grab the body of the html with axios
  searchQuery = req.params.search;
  axios
    .get("https://www.themoviedb.org/search?query=" + searchQuery)
    .then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      //   console.log("finished call to tmdb");
      // Now, we grab every h2 within an Movie tag, and do the following:
      $(".info").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .find(".title")
          .text();
        result.link = $(this)
          .find(".title")
          .attr("href");
        result.release_date = $(this)
          .find("span")
          .text();
        result.overview = $(this)
          .find(".overview")
          .text();
        result.image = $(this)
          .siblings(".image_content")
          .find("img")
          .data("src");
        // console.log("result=" + JSON.stringify(result));
        // Create a new Movie using the `result` object built from scraping

        db.Movie.create(result)
          .then(function(dbMovie) {
            // View the added result in the console
            console.log(dbMovie);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
      displayMovies(res);

      //   res.send("Scrape Complete");
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
