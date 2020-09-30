const hbs = require("hbs");

hbs.registerHelper("isEqualString", function (value1, value2, options) {

    return (value1.toString() == value2.toString()) ? options.fn(this) : options.inverse(this);
});


hbs.registerHelper("includesId", function (arrId, id, options) {

    if (arrId.includes(id)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

hbs.registerHelper("includesIdInAOO", function (val1, id, options) {
    console.log(val1);
    console.log(id);
    return (val1 == id) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("isSameId", function (value1, value2, options) {
    if (value1.toString() === value2.toString()) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});