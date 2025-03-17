const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Import helmet for security headers
const rateLimit = require('express-rate-limit'); // Import rate limiting
const app = express();
const port = process.env.PORT || 3000;
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Middleware
app.use(helmet()); // Use helmet to set security headers
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Parse JSON bodies

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

// Set up multer middleware with a file size limit of 10 MB.
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
    },
});

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || '',
    database: process.env.DATABASE || 'suntech',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// API endpoint for user registration
app.post('/register', upload.single('photo'), (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'No data received' });
    }
    const {
        name,
        fatherName,
        motherName,
        email,
        dob,
        gender,
        address,
        mobile,
        aadhaar,
        qualification,
        course
    } = req.body;
    const photo = req.file ? req.file.path : null;
    const userId = uuidv4();

    const sql = 'INSERT INTO users (id, name, fatherName, motherName, email, dob, gender, address, mobile, aadhaar, qualification, course, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [userId, name, fatherName, motherName, email, dob, gender, address, mobile, aadhaar, qualification, course, photo], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.status(201).json({
            id: userId,
            name,
            fatherName,
            motherName,
            email,
            dob,
            gender,
            address,
            mobile,
            aadhaar,
            qualification,
            course,
            photo,
        });
    });
});

// API endpoint for fetching all users
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Failed to fetch users' });
            return;
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});