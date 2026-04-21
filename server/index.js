require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();

// Models
const User = require('./models/User');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');

const { assignLeadToUser, handleBulkUpload } = require('./controllers/leadController');

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_crm')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_key';

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt: ${email}`);
        
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}`);
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
        console.log(`Login success: ${email}`);
        res.json({ token, user: { 
            id: user._id, 
            _id: user._id,
            name: user.name, 
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email, 
            role: user.role,
            department: user.department
        } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// PROFILE UPDATE
app.patch('/api/users/profile', async (req, res) => {
    try {
        const { userId, ...updates } = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DASHBOARD ROUTES
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { userId, role } = req.query;
        
        if (role === 'Sales' && userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.json({
                    assignedLeads: 0,
                    closedLeads: 0,
                    pendingFollowups: 0,
                    myLeads: []
                });
            }
            const myLeads = await Lead.find({ assignedTo: userId }).sort({ date: -1 }).limit(5);
            const pendingFollowups = await Lead.countDocuments({ assignedTo: userId, status: 'Scheduled' });
            
            return res.json({
                assignedLeads: user.assignedLeadsCount || 0,
                closedLeads: user.closedLeadsCount || 0,
                pendingFollowups,
                myLeads
            });
        }

        const unassignedLeads = await Lead.countDocuments({ assignedTo: null });
        const activeSalesPeople = await User.countDocuments({ role: 'Sales', status: 'Active' });
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const assignedThisWeek = await Lead.countDocuments({ date: { $gte: sevenDaysAgo }, assignedTo: { $ne: null } });

        const totalLeads = await Lead.countDocuments();
        const closedLeads = await Lead.countDocuments({ status: 'Closed' });
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

        res.json({ unassignedLeads, assignedThisWeek, activeSalesPeople, conversionRate, totalLeads });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/dashboard/activities', async (req, res) => {
    try {
        const activities = await Activity.find().sort({ timestamp: -1 }).limit(7);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/dashboard/active-sales-people', async (req, res) => {
    try {
        const items = await User.find({ role: 'Sales' }).sort({ assignedLeadsCount: -1 }).limit(10);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// EMPLOYEE ROUTES
app.get('/api/employees', async (req, res) => {
    try {
        const { page = 1, search = '' } = req.query;
        const limit = 8;
        const query = { role: 'Sales' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const employees = await User.find(query)
            .sort({ _id: -1 })
            .limit(limit)
            .skip((page - 1) * limit);
        const total = await User.countDocuments(query);
        res.json({ employees, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { firstName, lastName, email, language, department } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const generateId = () => {
            const part = () => Math.random().toString(16).substring(2, 6);
            return `#${part()}-${part()}-${part()}`;
        };

        const hashedPassword = await bcrypt.hash(email, 10);
        const employee = new User({ 
            firstName, lastName, 
            name: `${firstName} ${lastName}`, 
            email, language, department,
            password: hashedPassword, 
            role: 'Sales',
            employeeId: generateId()
        });
        await employee.save();
        
        const activity = new Activity({ description: `Employee ${employee.name} created` });
        await activity.save();
        
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/employees/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, language, department } = req.body;
        const employee = await User.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        if (firstName) employee.firstName = firstName;
        if (lastName) employee.lastName = lastName;
        if (firstName || lastName) employee.name = `${firstName || employee.firstName} ${lastName || employee.lastName}`;
        if (email) employee.email = email;
        if (language) employee.language = language;
        if (department) employee.department = department;

        await employee.save();
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/employees/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await User.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Bulk Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// LEAD ROUTES
app.post('/api/leads/manual', async (req, res) => {
    try {
        const lead = await assignLeadToUser(req.body);
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/leads/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded');
        const result = await handleBulkUpload(req.file.path);
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Cleanup
        }
        res.json(result);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/leads', async (req, res) => {
    try {
        const { userId, role, search, page = 1, limit = 10 } = req.query;
        let query = {};
        
        if (role === 'Sales' && userId) {
            query.assignedTo = userId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const totalLeads = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('assignedTo', 'firstName lastName name email');

        res.json({
            leads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: parseInt(page),
            totalLeads
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/leads/:id', async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lead Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Consolidated Duplicate Routes Above

// ATTENDANCE ROUTES
const Attendance = require('./models/Attendance');

app.get('/api/attendance/today', async (req, res) => {
    try {
        const { userId } = req.query;
        const today = new Date();
        today.setHours(0,0,0,0);
        const log = await Attendance.findOne({ userId, date: { $gte: today } });
        res.json(log || { status: 'Absent', breaks: [], checkIn: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance/checkin', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let log = await Attendance.findOne({ userId, date: { $gte: today } });
        if (!log) {
            log = new Attendance({ userId, checkIn: new Date(), status: 'Present' });
            await log.save();
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance/break', async (req, res) => {
    try {
        const { userId, type } = req.body;
        const today = new Date();
        today.setHours(0,0,0,0);
        let log = await Attendance.findOne({ userId, date: { $gte: today } });
        
        if (!log) return res.status(400).json({ message: 'Must check-in first' });

        if (type === 'start') {
            const hasActiveBreak = log.breaks.some(b => !b.end);
            if (!hasActiveBreak) {
                log.breaks.push({ start: new Date() });
                log.status = 'On Break';
            } else {
                return res.status(400).json({ message: 'Break already active' });
            }
        } else {
            if (log.breaks.length > 0) {
                const lastBreak = log.breaks[log.breaks.length - 1];
                if (!lastBreak.end) lastBreak.end = new Date();
            }
            log.status = 'Present';
        }
        await log.save();
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance/checkout', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date();
        today.setHours(0,0,0,0);
        let log = await Attendance.findOne({ userId, date: { $gte: today } });
        if (!log) return res.status(400).json({ message: 'Log not found' });

        log.checkOut = new Date();
        log.status = 'Logged Out';
        
        // Auto-close any open break
        if (log.breaks.length > 0) {
            const lastBreak = log.breaks[log.breaks.length - 1];
            if (!lastBreak.end) lastBreak.end = new Date();
        }
        
        await log.save();
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/attendance/dashboard-summary/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid ID' });

        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's log
        const todayLog = await Attendance.findOne({ 
            userId, 
            date: { $gte: today, $lt: tomorrow } 
        });
        
        // Previous shift log(s)
        const prevLogs = await Attendance.find({ 
            userId, 
            date: { $lt: today } 
        }).sort({ date: -1 }).limit(1);
        const prevLog = prevLogs[0];
        
        // History of last 4 logs for breaks
        const historyLogs = await Attendance.find({ 
            userId 
        }).sort({ date: -1 }).limit(5); // Including today possibly

        const breakHistory = [];
        historyLogs.forEach(log => {
            log.breaks.forEach(b => {
                breakHistory.push({
                    start: b.start,
                    end: b.end,
                    date: log.date
                });
            });
        });

        res.json({
            todayCheckIn: todayLog ? todayLog.checkIn : null,
            previousCheckOut: prevLog ? (prevLog.checkOut || prevLog.checkIn) : null,
            isCheckedIn: todayLog ? (!!todayLog.checkIn && !todayLog.checkOut) : false,
            isOnBreak: todayLog ? todayLog.status === 'On Break' : false,
            breakHistory: breakHistory.sort((a,b) => new Date(b.start) - new Date(a.start)).slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
