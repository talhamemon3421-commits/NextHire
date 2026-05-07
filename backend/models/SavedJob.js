const { Schema, model, Types: { ObjectId } } = require('mongoose');

const savedJobSchema = new Schema({
    user: { 
        type: ObjectId, 
        ref: 'User', 
        required: true 
    },
    job: { 
        type: ObjectId, 
        ref: 'Job', 
        required: true 
    },
    savedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Prevent a user from saving the same job twice
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = model('SavedJob', savedJobSchema);