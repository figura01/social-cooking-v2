const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipes.js");
const Category = require("../models/Categories");
const Tag = require("../models/Tags");
const User = require("../models/Users");
const upoloader = require("../config/cloudinary");
const protectedAdminRoute = require("../middlewares/protectedAdminRoute");
const protectedUserRoute = require("../middlewares/protectedUserRoute");
router.get('/', protectedAdminRoute, async (req, res, next) => {
    try {
        const recipes = await Recipe.find({});
        res.render("recipes/recipes", {
            recipes
        });
    } catch (errDb) {
        console.log(errDb);
    }

});

router.get('/create', protectedAdminRoute, async (req, res, next) => {
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

router.post('/create', protectedAdminRoute, upoloader.single("image"), async (req, res, next) => {
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

router.get('/:id/edit', protectedAdminRoute, upoloader.single("image"), async (req, res, next) => {
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

router.post('/:id/edit', protectedAdminRoute, upoloader.single("image"), async (req, res, next) => {

    try {
        console.log('POST Edit Form');
        const recipeId = req.params.id;
        console.log(recipeId);
        const updatedRecipe = req.body;
        if (req.file) {
            updatedRecipe.image = req.file.path;
        }

        updatedRecipe.steps.forEach((e, index) => {
            if (e === '') {
                updatedRecipe.steps.splice(index);
            }
        });
        console.log(updatedRecipe.steps.length);

        const update = await Recipe.findByIdAndUpdate(recipeId, updatedRecipe, {
            new: true
        });
        res.redirect('/recipes/');

    } catch (errDb) {
        console.log(errDb);
    }

});

router.get("/:id/delete", protectedAdminRoute, async (req, res, next) => {
    try {
        const recipeId = req.params.id;
        await Recipe.findByIdAndDelete(recipeId);
        res.redirect("/recipes");
    } catch (error) {
        next(error);
    }
});

router.get("/all", async (req, res, newt) => {
    try {
        const allRecipes = await Recipe.find({});
        console.log('all users recipes', allRecipes);

        res.render("recipes/show_all", {
            recipes: allRecipes,
            css: ["recipes-grid.css"]
        });

    } catch (errDb) {
        console.log(errDb);
    }
});

router.get("/:id/showone", async (req, res, newt) => {
    console.log('GET ONE recipe');
    try {
        const recipeId = req.params.id;
        console.log(recipeId);
        const cRp = await Recipe.findById(recipeId);
        console.log(cRp);
        res.render("recipes/show_one", {
            recipe: cRp
        });
    } catch (errDb) {
        console.log(errDb);
    }
});

router.get("/:id/user", async (req, res, next) => {
    console.log('GET All recipes from this user ');
    try {
        const userId = req.params.id;
        const recipes = await Recipe.find({
            owner: userId
        });

        const haveRecipe = recipes.length > 0 ? true : false;

        console.log(typeof res.locals.isLoggedIn);

        if (haveRecipe) {
            res.render("recipes/show_all_by_user", {
                recipes,
                haveRecipe,
            });
        } else {
            res.render("recipes/show_all_by_user", {
                message: "Sorry this user don't have shared any recipes"
            });
        }

    } catch (errDb) {
        console.log(errDb);
    }
});

router.get('/:id/my/show', protectedUserRoute, async (req, res, next) => {
    console.log('GET my recipes And show one');
    try {
        const recipeId = req.params.id;

        const foundRecipe = await Recipe.findById(recipeId);
        console.log(foundRecipe);
        console.log(foundRecipe.tags);
        /*
        const mapUsers = users.map((user) => {
            console.log(user);
            return user.toObject();
          });
      
      
        const promises = mapUsers.map(u => Recipe.find({
        owner: `${u._id}`
        }));
    
        Promise.all(promises).then(recipes => {
    
        mapUsers.forEach(user => {
            const foundRecipe = recipes.find(recipe => recipe[0] && recipe[0].owner.toString() === user._id.toString())
            user.nbRecipes = foundRecipe ? foundRecipe.length : 0
        });
        console.log(mapUsers);
        */
        const allTags = await Tag.find({});
        let mapTags = foundRecipe.tags.map((tag) => {
            return {
                id: tag
            }
        });

        console.log(mapTags);

        console.log('-----', mapTags);
        // const promisesTags = mapTags.map(tag => Tag.findById(
        //     tag
        // ));

        //console.log(promisesTags);

        res.render("recipes/show_my_one", {
            recipe: foundRecipe
        });
    } catch (errDb) {
        console.log(errDb);
    }

});

router.get('/my/create', protectedUserRoute, async (req, res, next) => {
    console.log('GET Create personnal recipe');
    console.log(res.locals.userId);

    const categories = await Category.find({});
    const tags = await Tag.find({});

    res.render("recipes/create_my_form", {
        tags,
        categories
    });
});

router.post('/my/create', protectedUserRoute, upoloader.single("image"), async (req, res, next) => {
    try {
        console.log('POST Create personnal recipe');
        const recipe = req.body;
        recipe.owner = res.locals.userId;

        if (req.file) {
            recipe.image = req.file.path;
        }

        console.log(recipe);
        const newRecipe = await Recipe.create(recipe);
        console.log(newRecipe);

        res.redirect(`/users/${res.locals.userId}/profile`);
    } catch (errDb) {
        console.log(errDb);

    }
});

router.get('/:id/my/edit', protectedUserRoute, async (req, res, next) => {
    try {
        console.log('GET EDIT personnal recipe');
        const recipeId = req.params.id;

        const recipe = await Recipe.findById(recipeId);
        const tags = await Tag.find({});
        const categories = await Category.find({});

        res.render("recipes/edit_my_form", {
            recipe,
            tags,
            categories,
        });
    } catch (errDb) {
        console.log(errDb);
    }

});

router.post('/:id/my/edit', protectedUserRoute, upoloader.single("image"), async (req, res, next) => {
    try {
        console.log('POST EDIT personnal recipe');
        const recipeId = req.params.id;
        const recipe = req.body;

        console.log(recipe);

        if (req.file) {
            console.log('have a file');
            recipe.image = req.file.path;
        } else {
            console.log('haven t  a file');
            recipe.image = recipe.oldImage;
            delete recipe.oldImage;
        }
        recipe.owner = res.locals.userId;
        console.log(recipe);

        const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, recipe, {
            new: true
        });

        res.redirect(`/users/${res.locals.userId}/profile`);
    } catch (errDb) {
        console.log(errDb);
    }


});

router.get('/:id/my/delete', protectedUserRoute, async (req, res, next) => {
    try {
        console.log('GET DELETE personnal recipe');
        const recipeId = req.params.id;

        const recipeDel = await Recipe.findByIdAndRemove(recipeId);

        res.redirect(`/users/${res.locals.userId}/profile`);

    } catch (errDb) {
        console.log(errDb);
    }
});


module.exports = router;