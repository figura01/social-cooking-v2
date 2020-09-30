require("dotenv").config();
const Tag = require("../models/Tags");
const mongoose = require("mongoose");

const tags = [{
        label: "Hot",
    },
    {
        label: "Meal",
    },
    {
        label: "Chicken",
    },
    {
        label: "Olive oil",
    },
    {
        label: "Traditional",
    },
    {
        label: "Cheap",
    },
    {
        label: "Fish",
    },
    {
        label: "Black pepper"
    },
    {
        label: "green pepper"
    },
    {
        label: "Spicy"
    },
    {
        label: "Vegan"
    }
];

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((self) => {
        Tag.create(tags)
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