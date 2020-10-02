const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const userSchema = new Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: String,
    genre: {
        type: String,
        enum: ["men", "women"],
        default: "men",
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    favRecipes: [{
        type: Schema.Types.ObjectId,
        ref: "Recipe",
    }],
    favUsers: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        default: [],
    },
    followers: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        default: [],
    },
    avatar: {
        type: String,
    }
});

userSchema.pre('remove', function (next) {
    // Remove all the assignment docs that reference the removed person.
    this.model('User').remove({
        user: this._id
    }, next);
});

const User = mongoose.model("User", userSchema);

module.exports = User;