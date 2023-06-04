const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const authRoute = require("./Routes/auth.js");
const userRoute = require("./Routes/user.js");
const postRoute = require("./Routes/Post.js");
dotenv.config();
mongoose
  .connect(process.env.MONGOOSEdb_URL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log({ err });
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

app.get("/v1/", (req, res) => {
  res.send("Hello Word");
});

app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);
app.use("/v1/post", postRoute);

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running");
});
