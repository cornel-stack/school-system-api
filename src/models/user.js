const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"]
    },
    lastname: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return v.endsWith("@school.edu")
            },
            message: "Email must end with @school.edu"
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"],
        required: [true, "Role is required"],
    },
    studentId: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

userSchema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastname}`;    
});


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bycrypt.genSalt(10);
        this.password = await bycrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre(["find", "findOne"], function(next) {
    this.where({ isActive: true });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;