var express = require('express');
var router = express.Router();
const User = require("../models/Users");
const uploader = require("../config/cloudinary");
const bcrypt = require("bcrypt");
const Recipe = require('../models/Recipes');
const salt = 10;

const protectedAdminRoute = require("../middlewares/protectedAdminRoute");
const protectedUserRoute = require("../middlewares/protectedUserRoute");

/* GET users listing. */
router.get('/', protectedAdminRoute, async (req, res, next) => {
  const users = await User.find({});

  res.render('users/users', {
    users
  });
});

router.get('/create', protectedAdminRoute, function (req, res, next) {
  console.log('GET Create user');
  res.render('users/create_form');
});

router.post('/create', protectedAdminRoute, uploader.single("avatar"), async (req, res, next) => {
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

router.get('/:id/edit', protectedAdminRoute, async (req, res, next) => {
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

router.post('/:id/edit', protectedAdminRoute, uploader.single("newAvatar"), async (req, res, next) => {
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

router.get('/:id/delete', protectedAdminRoute, async (req, res, next) => {
  const userId = req.params.id;
  await User.findByIdAndRemove(userId);
  res.redirect('/users');
});

router.get("/all", async (req, res, next) => {
  try {
    const userConnected = res.locals.userId;
    const users = await User.find({
      role: "user",
      _id: {
        $ne: userConnected
      }
    });




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

      console.log('-------res.locals-------', res.locals);
      const isLogged = res.locals.isLoggedIn;

      res.render("users/show_all", {
        users: mapUsers,
        isLogged
      });
    });

    // for (let user of mapUsers) {
    //   const recipes = await Recipe.find({
    //     owner: `${user._id}`
    //   })
    //   user.nbRecipes = recipes.length;
    // }
    // console.log(mapUsers)


  } catch (errDb) {
    console.log(errDb);
  }

});

router.get('/:id/profile', protectedUserRoute, async (req, res, next) => {
  console.log('GET profile for user logged only');
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    const recipes = await Recipe.find({
      owner: userId
    });
    console.log(user);
    console.log(recipes);

    if (user) {
      res.render("users/profile", {
        user,
        recipes,
      });
    }
  } catch (errDb) {
    console.log(errDb);
  }

});

router.get('/:id/profile/edit', protectedUserRoute, async (req, res, next) => {
  console.log('GET profile for user logged only');
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    res.render("users/edit_profile_form", {
      user
    });
  } catch (errDb) {
    console.log(errDb);
  }

});


router.post('/:id/profile/edit', protectedUserRoute, uploader.single("newAvatar"), async (req, res, next) => {
  console.log('POST profile for user logged only');
  try {
    const userId = req.params.id;
    const user = req.body;

    console.log(user, userId);

    if (req.file) {
      user.avatar = req.file.path;
    }

    if (user.newPassword !== '') {
      console.log('check for a new password');
      user.password = bcrypt.hashSync(user.newPassword, salt);
    } else {
      console.log('keep old password');
    }
    user.username = user.firstname + ' ' + user.lastname;
    const updatedUser = await User.findByIdAndUpdate(userId, user, {
      new: true
    });
    console.log(updatedUser);
    const userObject = updatedUser.toObject();
    req.session.currentUser.avatar = userObject.avatar;
    req.session.currentUser.username = userObject.username;
    res.redirect(`/users/${userId}/profile`);

  } catch (errDb) {
    console.log(errDb);
  }
});

module.exports = router;