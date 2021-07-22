const  { model, Schema } = require('mongoose');

const PostSchema = new Schema({
  body: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  comments: [
    {
      body: { type: String, trim: true },
      username: { type: String, trim: true },
      created_at: { type: String, default: new Date().toISOString() },
    }
  ],
  likes: [
    {
      username: { type: String, trim: true },
      created_at: { type: String, default: new Date().toISOString() },
    }
  ],
  user: { type: Schema.Types.ObjectId, ref: 'Users' },
  created_at: { type: String, default: new Date().toISOString() },
});

module.exports = model('Post', PostSchema);

/**
 * 
 * title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  creatorName: { type: String, trim: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  tags: { type: [String]},
  selectedFile: { type: String, required: true, trim: true },
  likes: { type: [String], default: [] },
  comments: { type: [String], default: [] },
  place: { type: String, trim: true },
  created_at: { type: Date, default: new Date()},
  updated_at: { type: Date, default: new Date()}
 */