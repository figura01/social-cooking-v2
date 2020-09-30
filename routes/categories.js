const express = require("express");
const router = express.Router();
const Category = require("../models/Categories.js");

router.get("/", async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.render("categories/categories", {
            categories
        });

    } catch (errDb) {
        console.log(errDb);
    }
});

router.get("/create", (req, res, next) => {
    res.render("categories/create_form");
});

router.post("/create", async (req, res, next) => {
    try {
        const category = req.body;
        const foundCategory = await Category.find({
            label: category.label
        });
        console.log('----', foundCategory);
        if (!foundCategory) {
            console.log('Found a Category');
            req.flash("error", "Already Taken");
            res.redirect("/categoriess/create");

        } else {
            console.log('Dont found a category');
            const newCategory = await Category.create(category);
            console.log(newCategory);
            res.redirect("/categories");
        }

    } catch (errorDb) {
        next(errorDb);
    }

});

router.get("/:id/delete", async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.redirect("/categories");
    } catch (error) {
        next(error);
    }
});

router.get("/:id/edit", async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        console.log(category);
        res.render("categories/edit_form.hbs", {
            category: category
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/edit", async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, category, {
            new: true
        });
        res.redirect("/categories");

    } catch (errDb) {
        next(errDb);
    }
});

module.exports = router;