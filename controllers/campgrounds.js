const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res) => {
  const camp = await Campground.find({});
  res.render("campgrounds/index", { camp });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createNewCamp = async (req, res) => {
  // if (!req.body.campgrounds) throw new ExpressError("Invalid campground data", 400);
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const camp = new Campground(req.body.campground);
  camp.geometry = geoData.body.features[0].geometry;
  camp.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.author = req.user._id;
  await camp.save();
  req.flash("success", "Successfully create a new campground");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.showCamp = async (req, res) => {
  const camp = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!camp) {
    req.flash("error", "Couldn't find the campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};

module.exports.renderEditForm = async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  if (!camp) {
    req.flash("error", "Couldn't find the campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};

module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const camp = await Campground.findByIdAndUpdate(id, req.body.campground, {
    runValidators: true,
    new: true,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.image.push(...imgs);
  if (req.body.deleteImg) {
    for (let filename of req.body.deleteImg) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImg } } },
    });
  }
  camp.geometry = geoData.body.features[0].geometry;
  await camp.save();
  req.flash("success", "Updated the campground");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Deleted the campground");
  res.redirect("/campgrounds");
};
