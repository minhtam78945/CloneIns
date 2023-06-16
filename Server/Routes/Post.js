const postContronller = require("../Controller/PostController");
const middwareController = require("../Controller/middwareController");
const router = require("express").Router();
const upload = require("../utils/multer");
// Create the Post
router.post(
  "/", // EP
  upload.single("image"),
  middwareController.verifyToken,
  postContronller.createThePost
);
//Deleted Post
router.delete(
  "/:id",
  middwareController.verifyTokenAndUserPostAuthorization,
  postContronller.deletePost
);
//update pots
router.put(
  "/:id",
  middwareController.verifyTokenAndUserPostAuthorization,
  postContronller.updatePost
);
// Like and dislike pots
router.put(
  "/:id/like",
  middwareController.verifyToken,
  postContronller.likeAndDislike
);
router.put(
  "/:id/dislike",
  middwareController.verifyToken,
  postContronller.disLikeAndLike
);
module.exports = router;
