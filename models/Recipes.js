const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
title: String
description: String
Ingredients: [String]
Steps: [String]
Category: [ObjectId]
Type: enum [“Entrie”, “Plat”, “Dessert”]
Image: String
owner: ObjectId ref User

Favorites: [ObjectId] (Users)

*/

const recipeSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String
    },
    ingredients: {
        type: [String],
        default: []
    },
    steps: {
        type: [String],
        default: []
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },

    tags: [{
        type: Schema.Types.ObjectId,
        ref: "Tag",
    }],

    typePlate: {
        type: String,
        enum: ["Entrie", "Plat", "Dessert"],
        default: "Plat",
    },
    image: {
        type: String,
        default: null,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    }]
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;