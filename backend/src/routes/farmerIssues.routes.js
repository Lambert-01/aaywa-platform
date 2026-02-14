const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FarmerIssue = require('../models/FarmerIssue');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/issues');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/farmer-issues
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const issueData = req.body;

        // If a file was uploaded, add its path/url to data
        if (req.file) {
            issueData.photo_url = `/uploads/issues/${req.file.filename}`;
        }

        const newIssue = await FarmerIssue.create(issueData);
        res.status(201).json(newIssue);
    } catch (err) {
        console.error('Error creating issue:', err); // Log the full error object
        res.status(500).json({ error: 'Failed to create issue', details: err.message }); // Send details to client for debugging
    }
});

// GET /api/farmer-issues (For Dashboard)
router.get('/', async (req, res) => {
    try {
        const issues = await FarmerIssue.findAll();
        res.json(issues);
    } catch (err) {
        console.error('Error fetching issues:', err);
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

// PATCH /api/farmer-issues/:id (Update status/assignee)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to, resolution_notes } = req.body;

        const updatedIssue = await FarmerIssue.updateStatus(id, status, assigned_to, resolution_notes);

        if (!updatedIssue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json(updatedIssue);
    } catch (err) {
        console.error('Error updating issue:', err);
        res.status(500).json({ error: 'Failed to update issue' });
    }
});

module.exports = router;
