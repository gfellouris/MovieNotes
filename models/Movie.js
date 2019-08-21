var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MovieSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true,
    unique: true
  },
  overview: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  release_date: {
    type: String,
    required: true
  },

  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Movie with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Movie = mongoose.model("Movie", MovieSchema);

// Export the Movie model
module.exports = Movie;
