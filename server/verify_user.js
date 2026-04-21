const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_crm');
    const user = await User.findOne({ email: 'admin@crm.com' });
    if (user) {
        console.log('User found:', user.email);
        const match = await bcrypt.compare('admin123', user.password);
        console.log('Password "admin123" matches:', match);
    } else {
        console.log('User NOT found');
    }
    await mongoose.disconnect();
};
check();
