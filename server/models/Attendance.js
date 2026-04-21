const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    checkIn: { type: Date },
    checkOut: { type: Date },
    breaks: [{
        start: { type: Date },
        end: { type: Date }
    }],
    status: { type: String, enum: ['Present', 'On Break', 'Logged Out'], default: 'Logged Out' }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
