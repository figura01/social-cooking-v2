const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const uploader = require("../config/cloudinary");

const salt = 10;

router.get("/signin", async (req, res, next) => {
    res.render("auth/signin.hbs");
});

router.post("/signin", async (req, res, next) => {
    // DO something
    //   res.render("auth/signin.hbs");
    const {
        email,
        password
    } = req.body;
    const foundUser = await User.findOne({
        email: email
    });
    console.log(foundUser);
    if (!foundUser) {
        //   Display an error message telling the user that either the password
        // or the email is wrong
        //   res.redirect("/signup")
        req.flash("error", "Invalid credentials");
        res.redirect("/auth/signin");
        // res.render("auth/signin.hbs", { error: "Invalid credentials" });
    } else {
        const isSamePassword = bcrypt.compareSync(password, foundUser.password);
        if (!isSamePassword) {
            // Display an error message telling the user that either the password
            // or the email is wrong
            req.flash("error", "Invalid credentials");
            res.redirect("/auth/signin");
            // res.render("auth/signin.hbs", { error: "Invalid credentials" });
        } else {
            //
            // Authenticate the user...
            const userDocument = {
                ...foundUser
            };
            console.log(userDocument);
            const userObject = foundUser.toObject();
            delete userObject.password; // remove password before saving user in session
            // console.log(req.session, "before defining current user");
            req.session.currentUser = userObject; // Stores the user in the session
            // console.log(req.session, "AFTER defining current user");
            req.flash("success", "Successfully logged in...");
            res.redirect("/");
        }
    }
});

router.get("/signup", async (req, res, next) => {
    res.render("auth/signup.hbs");
});

router.post("/signup", uploader.single("avatar"), async (req, res, next) => {
    console.log('---req.body', req.body);
    const newUser = req.body;
    if (req.file) {
        newUser.avatar = req.file.path;
    }

    try {
        const foundUser = await User.findOne({
            email: newUser.email
        });

        if (foundUser) {
            res.render("auth/signup.hbs", {
                error: "Email already taken"
            });
        } else {
            const hashedPassword = bcrypt.hashSync(newUser.password, salt);
            newUser.password = hashedPassword;
            newUser.username = newUser.firstname + ' ' + newUser.lastname;
            const createdUser = await User.create(newUser);
            console.log(createdUser);
            res.redirect("/auth/signin");
        }
    } catch (error) {
        next(error);
    }
    //   res.render("auth/signup.hbs");
});

router.get("/logout", async (req, res, next) => {
    console.log(req.session.currentUser);
    req.session.destroy(function (err) {
        // cannot access session here
        // console.log(req.session.currentUser);
        res.redirect("/auth/signin");
    });
});

module.exports = router;