const express = require("express");
const router = express.Router();

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const catchAsync = require("../utils/catchAsync");
const campground = require("../controllers/campgrounds");

const { isLoggedIn, validateCamground, isAuthor } = require("../middleware");

router
  .route("/")
  .get(catchAsync(campground.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCamground,
    catchAsync(campground.createNewCamp)
  );

router.get("/new", isLoggedIn, campground.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campground.showCamp))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCamground,
    catchAsync(campground.updateCamp)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCamp));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campground.renderEditForm)
);

module.exports = router;
