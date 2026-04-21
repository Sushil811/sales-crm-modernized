const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    source: { type: String },
    date: { type: Date, default: Date.now },
    location: { type: String },
    language: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['New', 'Ongoing', 'Closed', 'Scheduled'], default: 'New' },
    type: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm' },
    scheduledDate: { type: Date }
});

LeadSchema.index({ language: 1, status: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ date: -1 });
LeadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
