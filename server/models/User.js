const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String }, // Keep for compatibility
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Sales'], default: 'Sales' },
    employeeId: { type: String, unique: true },
    language: { type: [String], default: [] },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    department: { type: String, default: 'Sales' },
    assignedLeadsCount: { type: Number, default: 0 },
    closedLeadsCount: { type: Number, default: 0 },
    lastLeadAssignedAt: { type: Date, default: null }
});

UserSchema.index({ role: 1, language: 1, lastLeadAssignedAt: 1, assignedLeadsCount: 1 });

module.exports = mongoose.model('User', UserSchema);
