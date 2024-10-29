const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Allow requests from Live Server
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../src')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// API Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        
        res.status(201).json({ 
            message: 'User created successfully',
            username: user.username 
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Error creating user', 
            error: error.message 
        });
    }
});


// ... rest of your server code (login route, etc.)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Catch-all route for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/signup.html'));
});

const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi' });
        }

        // Cari user berdasarkan username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        // Login berhasil
        res.status(200).json({ 
            message: 'Login berhasil',
            username: user.username
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan saat login', 
            error: error.message 
        });
    }
});

const userProgressSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    currentChapter: { type: String, default: '' },
    currentQuestionIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
});
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// Get user progress
app.get('/api/progress/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const progress = await UserProgress.findOne({ username });
        
        if (!progress) {
            return res.status(404).json({ message: 'No progress found' });
        }
        
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
});


