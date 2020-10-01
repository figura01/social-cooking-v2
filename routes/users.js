var express = require('express');
var router = express.Router();
const User = require("../models/Users");
const uploader = require("../config/cloudinary");
const bcrypt = require("bcrypt");
const Recipe = require('../models/Recipes');
const salt = 10;

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const users = await User.find({});

  res.render('users/users', {
    users
  });
});

router.get('/create', function (req, res, next) {
  console.log('GET Create user');
  res.render('users/create_form');
});

router.post('/create', uploader.single("avatar"), async (req, res, next) => {
  console.log('POST Create user');
  console.log('req.body: ', req.body);
  console.log('req.file: ', req.file);
  try {
    const newUser = req.body;
    if (req.file) {
      newUser.avatar = req.file.path;
    } else {
      res.redirect("/users/create");
    }
    console.log(newUser.email);
    const foundUser = await User.findOne({
      email: newUser.email
    });
    console.log('foundUser', foundUser);

    if (foundUser) {
      console.log('User founded');
      res.redirect("/users/create");
    } else {
      console.log('User not founded');
      newUser.username = `${newUser.firstname} ${newUser.lastname}`;
      newUser.password = bcrypt.hashSync(newUser.password, salt);
      console.log(newUser);

      const createdUser = await User.create(newUser);

      res.redirect("/users");
    }

  } catch (errDb) {
    console.log(errDb);
  }
});

router.get('/:id/edit', async (req, res, next) => {
  try {
    const userId = req.params.id;

    const foundUser = await User.findById(userId);
    console.log(foundUser);
    if (foundUser) {
      const hash = foundUser.password;


      res.render("users/edit_form", {
        user: foundUser
      });
    } else {
      res.redirect("/users");
    }


  } catch (errDb) {
    console.log(errDb);
  }

});

router.post('/:id/edit', uploader.single("newAvatar"), async (req, res, next) => {
  try {
    console.log('POST Edit User');
    console.group('-------req-body: ', req.body);

    console.log(req.params.id);
    const userId = req.params.id;
    const updatedUser = req.body;
    if (req.file) {
      updatedUser.avatar = req.file.path;
      delete updatedUser.oldAvatar;
    }
    if (req.body.newPassword) {
      const newPassword = bcrypt.hashSync(req.body.newPassword, salt);
      updatedUser.password = newPassword;
      delete updatedUser.newPassword;
      console.log(updatedUser);
    }
    //const currentUser = await User.findById(req.params.id);
    delete updatedUser.newPassword;
    console.log('-------updatedUser: ', updatedUser);

    const newUser = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true
    });
    console.log('newUser------', newUser);
    res.redirect('/users');



  } catch (errorDb) {
    console.log(errorDb);
  }

});

router.get('/:id/delete', async (req, res, next) => {
  const userId = req.params.id;
  await User.findByIdAndRemove(userId);
  res.redirect('/users');
});

router.get("/all", async (req, res, next) => {
  try {
    const users = await User.find({
      role: "user"
    });




    const mapUsers = users.map((user) => user.toObject());


    const promises = mapUsers.map(u => Recipe.find({
      owner: `${u._id}`
    }))

    Promise.all(promises).then(recipes => {
   
      mapUsers.forEach(user => {
        const foundRecipe = recipes.find(recipe => recipe[0] && recipe[0].owner.toString() === user._id.toString())
        user.nbRecipes = foundRecipe ?  foundRecipe.length : 0
      })
      console.log(mapUsers);
    })
    
    // for (let user of mapUsers) {
    //   const recipes = await Recipe.find({
    //     owner: `${user._id}`
    //   })
    //   user.nbRecipes = recipes.length;
    // }
    // console.log(mapUsers)

    res.render("users/show_all", {
      users: mapUsers
    });
  } catch (errDb) {
    console.log(errDb);
  }

});

module.exports = router;