const postContronller = require("../Controller/PostController");
const middwareController = require("../Controller/middwareController");
const router = require("express").Router();
const upload = require("../utils/multer");
router.post(
  "/", // EP
  upload.single("image"),
  middwareController.verifyToken,
  postContronller.createThePost
);

module.exports = router;
