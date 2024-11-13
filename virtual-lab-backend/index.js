const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'https://virtual-lab-yan5.vercel.app/', 
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(express.static(path.join(__dirname, '../src')));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000, })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

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

app.post('/api/progress', async (req, res) => {
    try {
        const { username, currentChapter, currentQuestionIndex, score, answer } = req.body;
        
        console.log('Received progress data:', {
            username,
            currentChapter,
            currentQuestionIndex,
            score,
            answer
        });

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        let progress = await UserProgress.findOne({ username });
        
        if (progress) {
            progress.currentChapter = currentChapter;
            progress.currentQuestionIndex = currentQuestionIndex;
            progress.score = score;
            if (answer) {
                progress.answers.push({
                    chapter: answer.chapter,
                    questionIndex: answer.questionIndex,
                    isCorrect: answer.isCorrect,
                    timestamp: new Date()
                });
            }
        } else {
            progress = new UserProgress({
                username,
                currentChapter,
                currentQuestionIndex,
                score,
                answers: answer ? [{
                    chapter: answer.chapter,
                    questionIndex: answer.questionIndex,
                    isCorrect: answer.isCorrect,
                    timestamp: new Date()
                }] : []
            });
        }

        await progress.save();
        console.log('Progress saved successfully:', progress);
        
        res.status(200).json({
            message: 'Progress saved successfully',
            progress
        });
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({
            message: 'Error saving progress',
            error: error.message
        });
    }
});

app.get('/api/progress/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log('Fetching progress for user:', username);

        const progress = await UserProgress.findOne({ username });
        
        if (!progress) {
            console.log('No progress found for user:', username);
            return res.status(404).json({ message: 'No progress found' });
        }

        console.log('Progress found:', progress);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            message: 'Error fetching progress',
            error: error.message
        });
    }
});

const userProgressSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        unique: true 
    },
    currentChapter: { 
        type: String, 
        default: '' 
    },
    currentQuestionIndex: { 
        type: Number, 
        default: 0 
    },
    score: { 
        type: Number, 
        default: 0 
    },
    answers: [{
        chapter: String,
        questionIndex: Number,
        isCorrect: Boolean,
        timestamp: { 
            type: Date, 
            default: Date.now 
        }
    }]
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        req.session.userId = user._id;

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

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Tidak terautentikasi' });
    }
};

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal logout' });
        }
        res.json({ message: 'Berhasil logout' });
    });
});