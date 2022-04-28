const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const geolocation = require("geolocation");
var _ = require("lodash");

mongoose.connect("mongodb://127.0.0.1:27017/medicalDB");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(cookieParser());

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  fullName: String,
  dob: String,
  mobile: String,
  height: Number,
  weight: Number,
  gender: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    }
  }
});

const MedicineSchema = new mongoose.Schema({
  medicineName: String,
  disease: String,
  maker: String,
  stockAvailable: Number,
  cost: Number
});

const MedicalStoreSchema = new mongoose.Schema({
  email: String,
  password: String,
  medicines: {
    antipyretics: [String],
    analgesics: [String],
    antiseptics: [String],
    antimalarial: [String],
    anaesthetics: [String],
    antiinflammatory: [String],
    antidotes: [String],
    antibacterials: [String],
    antifungal: [String],
    antiviral: [String],
    vaccines: [String],
    contraceptives: [String]
  },
  storeName: String,
  phoneNumber: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    }
  }
});



MedicalStoreSchema.index({location: "2dsphere"});

const User = mongoose.model("User", UserSchema);

const MedicalStore = mongoose.model("MedicalStore", MedicalStoreSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/medi.html");
});

app.get("/createAccountUser", function (req, res) {
  res.sendFile(__dirname + "/createAccount1.html");
});

app.get("/createAccountStore", function (req, res) {
  res.sendFile(__dirname + "/createAccount2.html");
})

app.post("/userLogin", function(req, res) {
  const email = req.body.userName;
  const password = req.body.password;

  User.findOne({email: email}, function (err, user) {
    if (err) {
      console.log(err);
    }
    else {
      if (user) {
        if (user.password == password) {
          res.cookie("user", email);

          res.redirect("/home");
        }
      }
    }
  })
});

app.post("/storeLogin", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  MedicalStore.findOne({email: email}, function (err, user) {
    if (err) {
      console.log(err);
    }
    else {
      if (user) {
        if (user.password == password) {
          res.cookie("user", email);
            res.render("listStoreMedicines", {antipyretics: user.medicines.antipyretics, analgesics: user.medicines.analgesics,
              antiseptics: user.medicines.antiseptics, antimalarials: user.medicines.antimalarial, anaesthetics: user.medicines.anaesthetics,
             antiinflammatory: user.medicines.antiinflammatory, antidotes: user.medicines.antidotes, antibacterials: user.medicines.antibacterials,
            antifungal: user.medicines.antifungal, antiviral: user.medicines.antiviral, vaccines: user.medicines.vaccines,
          contraceptives: user.medicines.contraceptives});
        }
      }

      else {
        res.sendFile(__dirname + "/noStore.html");
      }
    }
  })
});

app.post("/createAccountUser", function (req, res) {

  var checked;

  if (req.body.male) {
    checked = "Male";
  }

  else {
    checked = "Female";
  }

  if (req.body.password != req.body.confirmPassword) {
    res.sendFile(__dirname + "/createAccountUser");
  }

  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.fullName,
    dob: req.body.dob,
    mobile: req.body.mobileNumber,
    height: req.body.height,
    weight: req.body.weight,
    gender: checked
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      res.sendFile(__dirname + "/medi.html");
    }
  })
});

app.post("/createAccountStore", function (req, res) {
  if (req.body.password != req.body.confirmPassword) {
    alert("Check your password.");
    res.sendFile(__dirname + "/createAccountStore");
  }

  const newStore = new MedicalStore({
    email: req.body.email,
    storeName: req.body.medicalStoreName,
    password: req.body.password,
    phoneNumber: req.body.storePhoneNumber,
    address: req.body.address,
    location: {
      type: "Point",
      coordinates: [req.body.longitude, req.body.latitude]
    },
  });

  newStore.save(function (err) {
    if (err) {
      console.log(err);
    }

    else {
      res.sendFile(__dirname + "/medi.html");
    }
  })
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});

app.post("/getlocation", function (req, res) {
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const email = req.cookies.user;

  res.cookie("user", email);
  res.cookie("longitude", longitude);
  res.cookie("latitude", latitude);

  User.findOneAndUpdate({email: email}, {$set: {'location.coordinates': [longitude, latitude]}}, null, function (err, doc) {

  });

  MedicalStore.find({
    location: {
      $near: {
        $maxDistance: 5000,
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      }
    }
  }).find(function (err, results) {
    if (err) {
      console.log(err);
    }



    res.render("listNearbyStores", {stores: results});

  });

});

app.get("/locateNearbyStores", function (req, res) {
  res.sendFile(__dirname + "/home.html");
})

app.get("/searchMedicines", function(req, res) {
  res.render("searchMedicines");
})

app.get("/logout", function (req, res) {
  res.clearCookie("user");
  res.clearCookie("latitude");
  res.clearCookie("longitude");
  res.redirect("/");
})

app.post("/search", function (req, res) {
  var medicineName = req.body.searchBar;

  var flag = false;

  MedicalStore.find({
    location: {
      $near: {
        $maxDistance: 5000,
        $geometry: {
          type: "Point",
          coordinates: [req.cookies.longitude, req.cookies.latitude]
        }
      }
    }
  }).find(function (err, results) {
    if (err) {
      console.log(err);
    }

    var stores = [];

    for (var i = 0; i < results.length; i++) {
      flag = false;
        for (var j = 0; j < results[i].medicines.antipyretics.length; j++) {
          if (results[i].medicines.antipyretics[j] == medicineName) {
            flag = true;
            break;
          }

          if (results[i].medicines.vaccines[j] == medicineName) {
            flag = true;
            break;
          }

          if (results[i].medicines.antiinflammatory[j] == medicineName) {
            flag = true;
            break;
          }

          if (results[i].medicines.analgesics[j] == medicineName) {
            flag = true;
            break;
          }

          if (results[i].medicines.antiviral[j] == medicineName) {
            flag = true;
            break;
          }

          if (results[i].medicines.antifungal[j] == medicineName) {
            flag = true;
            break;
          }

        }

        if (flag == true) {
          stores.push(results[i]);
        }

    }

    res.render("listNearbyStores", {stores: stores});
  });

});

app.get("/addNewMedicine", function (req, res) {

  res.sendFile(__dirname + "")

});

app.get("/userProfile", function (req, res) {

  const email = req.cookies.user;

  User.findOne({email: email}, function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      if (result) {

        res.render("userProfile", {result: result});

      }
    }
  });

});

app.post("/editForm", function(req, res) {

  const email = req.body.email;


});

app.get("/addNewMedicine", function(req, res) {
  res.sendFile(__dirname + "/addNewMedicine.html");
})

app.listen(8000, function () {
  console.log("Running...");
});
