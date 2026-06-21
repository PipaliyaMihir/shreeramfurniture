const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);
const { wrapModel } = require('../utils/dbFallback');

const defaultUsers = [
  {
    _id: '60c72b2f9b1d8a23c4d5e6f7',
    name: 'Shree Ram Admin',
    email: 'admin@shreeramfurniture.com',
    password: '$2b$10$5yllI94CO/nIxQr0870DOe/wBv5W2L4hjK8FyH2QeVdAmNQyuA2DK', // bcrypt of Admin@123
    role: 'admin',
  }
];

module.exports = wrapModel(UserModel, 'User', defaultUsers);
