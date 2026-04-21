const fs = require('fs');
const csv = require('csv-parser');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

/**
 * Assigns a lead to an eligible user based on language and threshold.
 * Business Logic:
 * - Language must match.
 * - User must be 'Active'.
 * - Round Robin among users under threshold (current count < 3).
 * - Sort by lastLeadAssignedAt to ensure true round-robin.
 */
const assignLeadToUser = async (leadData) => {
    // 1. Find eligible users (matching language, active, under threshold of 3)
    const eligibleUsers = await User.find({
        language: { $in: [leadData.language] },
        status: 'Active',
        role: 'Sales',
        assignedLeadsCount: { $lt: 3 } 
    }).sort({ lastLeadAssignedAt: 1 });

    let assignedTo = null;
    let userName = 'unassigned';

    if (eligibleUsers.length > 0) {
        const target = eligibleUsers[0];
        assignedTo = target._id;
        userName = target.firstName + ' ' + target.lastName;
        
        // Update user stats
        await User.findByIdAndUpdate(assignedTo, {
            $inc: { assignedLeadsCount: 1 },
            $set: { lastLeadAssignedAt: new Date() }
        });
    }

    const lead = new Lead({
        name: leadData.name,
        email: leadData.email,
        source: leadData.source || 'CSV Import',
        date: leadData.date ? new Date(leadData.date) : new Date(),
        location: leadData.location,
        language: leadData.language,
        assignedTo,
        status: 'Ongoing',
        type: 'Warm'
    });

    await lead.save();

    // Log Activity
    const activityDesc = assignedTo 
        ? `${userName} was assigned 1 more new lead (${lead.name})`
        : `New unassigned lead: ${lead.name}`;
        
    const activity = new Activity({
        description: activityDesc,
        timestamp: new Date()
    });
    await activity.save();

    return lead;
};

const handleBulkUpload = async (filePath) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const assignedLeads = [];
                    // Process sequentially to avoid race conditions with lead thresholds
                    for (const leadData of results) {
                        const normalizedData = {};
                        Object.keys(leadData).forEach(key => {
                            normalizedData[key.toLowerCase()] = leadData[key];
                        });
                        const lead = await assignLeadToUser(normalizedData);
                        assignedLeads.push(lead);
                    }
                    resolve(assignedLeads);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err) => reject(err));
    });
};

module.exports = { assignLeadToUser, handleBulkUpload };
