function protectedAdminRoute(req, res, next) {
    if (req.session.currentUser && req.session.currentUser.role === "admin") {
      next();
    } else {
      req.flash("error", "Forbidden");
      res.redirect("/");
      // res.render("ForbiddenPage.hbs")
    }
  }
  
  module.exports = protectedAdminRoute;