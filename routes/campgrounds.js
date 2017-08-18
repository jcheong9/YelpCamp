var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require('geocoder');


// INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.campground.name;
  var image = req.body.campground.image;
  var desc = req.body.campground.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var price = req.body.campground.price;
  geocoder.geocode(req.body.campground.location, function (err, data) {
      console.log(err);
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});
// NEW - show form to create new campgrounds
router.get("/new", middleware.isLoggedIn,function(req,res){
    res.render("campgrounds/new");
});

// SHOW -shows more info about one campground
router.get("/:id",function(req,res){
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            // render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground});
        }
    });
})

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req,res){
    // is user looged in?
    Campground.findById(req.params.id, function(err, foundCampground){
        console.log(err);
        res.render("campgrounds/edit", {campground : foundCampground});
    })
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
      console.log(err);
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTORY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
})


module.exports = router;