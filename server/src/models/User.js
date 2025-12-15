const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const permissionsConfig = require('../config/permissions.json');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['FARMER', 'MILL_OPERATOR', 'QUALITY_INSPECTOR', 'BUYER', 'ADMIN'],
        default: 'FARMER',
    },
    permissions: [{
        type: String,
    }],
}, {
    timestamps: true,
});

// Middleware to set permissions based on role before saving
userSchema.pre('save', function (next) {
    if (this.isModified('role') || this.isNew) {
        this.permissions = permissionsConfig[this.role] || [];
    }
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.getPermissionsForRole = function (role) {
    return permissionsConfig[role] || [];
};

const User = mongoose.model('User', userSchema);

module.exports = User;
