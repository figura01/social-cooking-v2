const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipes.js");
const Category = require("../models/Categories");
const Tag = require("../models/Tags");
const User = require("../models/Users");
const upoloader = require("../config/cloudinary");

router.get('/', async (req, res, next) => {
    try {
        const recipes = await Recipe.find({});
        res.render("recipes/recipes", {
            recipes
        });
    } catch (errDb) {
        console.log(errDb)
    }

});

router.get('/create', async (req, res, next) => {
    try {
        const tags = await Tag.find({});
        const categories = await Category.find({});
        const users = await User.find({
            role: "user"
        });
        res.render("recipes/create_form", {
            tags,
            categories,
            users,
        });
    } catch (errorDb) {
        console.log(errorDb);
    }

});

router.post('/create', upoloader.single("image"), async (req, res, next) => {
    try {
        console.log('POST create Recipe');
        console.log(req.body);
        const recipe = req.body;
        if (req.file) {
            recipe.image = req.file.path;
        }

        const newRecipe = await Recipe.create(recipe);
        res.redirect("/recipes/");
    } catch (errDb) {
        console.log(errDb);
    }

});

router.get('/:id/edit', upoloader.single("image"), async (req, res, next) => {
    console.log("GET recipe to Edit");
    try {
        const recipeId = req.params.id;

        const tags = await Tag.find({});
        const foundRecipe = await Recipe.findById(recipeId);
        const categories = await Category.find({});
        const users = await User.find({});
        console.log(users);
        console.log('all catagories: ', categories);


        console.log('foundRecipe: ', foundRecipe);
        res.render("recipes/edit_form", {
            recipe: foundRecipe,
            tags,
            categories,
            users
        });
    } catch (errDb) {
        console.log(errDb);
    }
});

router.post('/:id/edit', upoloader.single("image"), async (req, res, next) => {
    console.log('POST Edit Form');
    const recipeId = req.params.id;
    const updatedRecipe = req.body;

    try {

    } catch(errDb) {
        console.log(errDb);
    }

});

module.exports = router;