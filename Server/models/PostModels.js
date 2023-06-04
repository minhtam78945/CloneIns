const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    avaUrl: {
      type: String,
    },
    image: {
      type: String,
    },
    cloundinaryId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      minlength: 10,
    },
    description: {
      type: String,
      required: true,
      minlength: 4,
    },
    tag: {
      type: Number,
      //      required: true,
      default: 0,
    },
    upLike: {
      type: Array,
      default: [],
    },
    dislike: {
      type: Array,
      default: [],
    },
    comment: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Post", postSchema);
