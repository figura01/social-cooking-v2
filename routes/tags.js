const express = require("express");
const router = express.Router();
const Tag = require("../models/Tags.js");
const protectedAdminRoute = require("../middlewares/protectedAdminRoute");

router.get("/", protectedAdminRoute, async (req, res, next) => {
    try {
        const tags = await Tag.find({});
        res.render("tags/tags", {
            tags
        });

    } catch (errDb) {
        console.log(errDb);
    }
});

router.get("/create", protectedAdminRoute, (req, res, next) => {
    res.render("tags/create_form");
});

router.post("/create", protectedAdminRoute, async (req, res, next) => {
    try {
        const tag = req.body;
        const foundTag = await Tag.find({
            label: tag.label
        });
        console.log('----', foundTag);
        if (!foundTag) {
            console.log('Found a tag');
            req.flash("error", "Already Taken");
            res.redirect("/tags/create");

        } else {
            console.log('Dont found a tag');
            const newTag = await Tag.create(tag);
            console.log(newTag);
            res.redirect("/tags");
        }

    } catch (errorDb) {
        next(errorDb);
    }

});

router.get("/:id/delete", protectedAdminRoute, async (req, res, next) => {
    try {
        const tagId = req.params.id;
        await Tag.findByIdAndDelete(tagId);
        res.redirect("/tags");
    } catch (error) {
        next(error);
    }
});

router.get("/:id/edit", protectedAdminRoute, async (req, res, next) => {
    try {
        const tagId = req.params.id;
        const tag = await Tag.findById(tagId);
        console.log(tag);
        res.render("tags/edit_form.hbs", {
            tag: tag
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/edit", protectedAdminRoute, async (req, res, next) => {
    try {
        const tagId = req.params.id;
        const tag = req.body;
        const updatedTag = await Tag.findByIdAndUpdate(tagId, req.body, {
            new: true
        });
        res.redirect("/tags");

    } catch (errDb) {
        next(errDb);
    }
});


module.exports = router;