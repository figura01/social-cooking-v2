require("dotenv").config();
const Category = require("../models/Categories");
const mongoose = require("mongoose");

const categories = [{
        label: "Asie",
    },
    {
        label: "North America",
    },
    {
        label: "South America",
    },
    {
        label: "Europe",
    },

    {
        label: "Africa",
    },
    {
        label: "Oceania"
    }
];

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((self) => {
        Category.create(categories)
            .then((dbResult) => {
                console.log(dbResult);
            })
            .catch((error) => {
                console.log(error);
            });
    })
    .catch((error) => {
        console.log(error);
    });