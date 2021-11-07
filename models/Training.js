const mongoose = require('mongoose');
const  slugify  = require('slugify');
const Schema = mongoose.Schema;

const TrainingSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type:String,
    unique: true
  }, 
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
}
});

TrainingSchema.pre('validate', function(next){
  this.slug = slugify(this.name, {
    lower:true,
    strict:true
  })
  next();
})

const Training = mongoose.model('Training', TrainingSchema);
module.exports = Training; 