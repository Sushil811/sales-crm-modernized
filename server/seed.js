const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_crm';
        await mongoose.connect(uri);
        console.log('Connected to DB...');
        await mongoose.connection.dropDatabase();

        // 1. Ensure Admin
        let admin = await User.findOne({ email: 'admin@canova.com' });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            admin = new User({
                firstName: 'System', lastName: 'Administrator',
                name: 'System Administrator',
                email: 'admin@canova.com',
                password: hashedPassword,
                role: 'Admin',
                employeeId: '#admin-001'
            });
            await admin.save();
        }

        // 2. Ensure Sales User
        let sales = await User.findOne({ email: 'sales@canova.com' });
        if (!sales) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            sales = new User({
                firstName: 'Rajesh', lastName: 'Mehta',
                name: 'Rajesh Mehta',
                email: 'sales@canova.com',
                password: hashedPassword,
                role: 'Sales',
                employeeId: '#sales-001',
                department: 'Direct Sales',
                language: ['English', 'Hindi']
            });
            await sales.save();
        }

        console.log('Database dropped for fresh start');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminData = {
            firstName: 'Rajesh',
            lastName: 'Mehta',
            name: 'Rajesh Mehta',
            email: 'admin@crm.com',
            password: hashedPassword,
            role: 'Admin',
            language: ['English', 'Hindi'],
            status: 'Active'
        };

        const adminUser = await User.findOneAndUpdate(
            { email: 'admin@crm.com' },
            adminData,
            { upsert: true, new: true }
        );
        console.log('Admin user ensured');

        // Seed Sales People
        const salesStaff = [
            { firstName: 'Amit', lastName: 'Desai', name: 'Amit Desai', email: 'amit@crm.com', language: ['Hindi', 'English'], status: 'Active' },
            { firstName: 'Suman', lastName: 'Rao', name: 'Suman Rao', email: 'suman@crm.com', language: ['Marathi', 'English'], status: 'Active' },
            { firstName: 'Vikram', lastName: 'Singh', name: 'Vikram Singh', email: 'vikram@crm.com', language: ['Hindi', 'Kannada'], status: 'Inactive' }
        ];

        const generateId = () => {
            const part = () => Math.random().toString(16).substring(2, 6);
            return `#${part()}-${part()}-${part()}`;
        };

        for (const staff of salesStaff) {
            const hashedPassword = await bcrypt.hash('sales123', 10);
            await User.findOneAndUpdate(
                { email: staff.email },
                { 
                    ...staff, 
                    password: hashedPassword, 
                    role: 'Sales',
                    employeeId: generateId(),
                    department: 'Sales'
                },
                { upsert: true }
            );
        }
        console.log('Sales staff seeded');

        // Seed some Activities
        const Activity = require('./models/Activity');
        await Activity.deleteMany({});
        await Activity.insertMany([
            { description: 'You were assigned 3 more new lead' },
            { description: 'You Closed a deal today' },
            { description: 'Upcoming Follow-up' },
            { description: 'You assigned a lead to Priya' },
            { description: 'Jay closed a deal' }
        ]);
        console.log('Activities seeded');

        // Seed some Leads
        const Lead = require('./models/Lead');
        await Lead.deleteMany({});
        const amit = await User.findOne({ email: 'amit@crm.com' });
        await Lead.create([
            { name: 'Rohan Sharma', email: 'rohan@gmail.com', language: 'Hindi', source: 'Instagram', status: 'Closed', assignedTo: amit._id },
            { name: 'Priya Patel', email: 'priya@outlook.com', language: 'English', source: 'LinkedIn', status: 'Ongoing', assignedTo: amit._id }
        ]);
        await amit.updateOne({ $set: { assignedLeadsCount: 2, closedLeadsCount: 1 } });
        // Seed some Attendance
        const Attendance = require('./models/Attendance');
        await Attendance.deleteMany({});
        const todayAt = (h, m) => {
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        };
        const pastDay = (days, h, m) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            d.setHours(h, m, 0, 0);
            return d;
        };

        await Attendance.create([
            {
                userId: amit._id,
                date: pastDay(1, 0, 0),
                checkIn: pastDay(1, 9, 30),
                checkOut: pastDay(1, 18, 15),
                status: 'Logged Out',
                breaks: [
                    { start: pastDay(1, 13, 0), end: pastDay(1, 13, 45) },
                    { start: pastDay(1, 16, 0), end: pastDay(1, 16, 15) }
                ]
            },
            {
                userId: amit._id,
                date: pastDay(2, 0, 0),
                checkIn: pastDay(2, 10, 0),
                checkOut: pastDay(2, 17, 30),
                status: 'Logged Out',
                breaks: [
                    { start: pastDay(2, 12, 30), end: pastDay(2, 13, 30) }
                ]
            }
        ]);
        console.log('Attendance seeded');

    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

seedAdmin();
