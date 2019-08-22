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

var PORT = process.env.PORT || 8080;

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

var ObjectID = require('mongodb').ObjectID; 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/movieScrape";
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/movieScrape", { useNewUrlParser: true });

// Functions
// Used by multiple routes to diplay the movies from mongodb
function displayMovies(response) {
  db.Movie.find({}).then(function(dbMovie) {
    response.render("index", { movies: dbMovie });
  });
}

app.get("/api/delete/:id", function(req, res) {
  // var objId = req.params.id;
  let objId = ObjectID(req.params.id);
  db.Movie.deleteOne({"_id": objId}).then(function(dbMovie) {
    res.send(dbMovie);
  });
});

app.get("/index", function(req, res) {
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


// Route for saving/updating a Movie's associated Note
app.post("/api/movienote/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Movie.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbMovie) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbMovie);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/movie/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Movie.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbMovie) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbMovie);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
