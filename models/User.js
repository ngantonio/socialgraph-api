const  { model, Schema } = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: {type: String, trim: true },
  email: {type: String, required: true, trim: true, unique:true },
  password: {type: String, required: true, trim: true },
  created_at: {type: String, trim: true, default: new Date().toISOString() }
})

module.exports = model('User', UserSchema);