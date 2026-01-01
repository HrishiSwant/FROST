const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const database = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database pool
database.initialize();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ============================================
// SIGNUP ENDPOINT
// ============================================
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const checkUserSql = 'SELECT id FROM users WHERE email = :email';
        const existingUser = await database.execute(checkUserSql, { email });

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertSql = 'INSERT INTO users (name, email, password) VALUES (:name, :email, :password)';
        
        await database.execute(insertSql, {
            name,
            email,
            password: hashedPassword
        });

        // Get the inserted user ID
        const getUserSql = 'SELECT id FROM users WHERE email = :email';
        const userResult = await database.execute(getUserSql, { email });
        const userId = userResult.rows[0].ID;

        // Generate JWT token
        const token = jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: userId, name, email }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// ============================================
// LOGIN ENDPOINT
// ============================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const sql = 'SELECT id, name, email, password FROM users WHERE email = :email';
        const result = await database.execute(sql, { email });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.ID, email: user.EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.ID,
                name: user.NAME,
                email: user.EMAIL
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ============================================
// GET USER PROFILE (Protected Route)
// ============================================
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const sql = 'SELECT id, name, email, created_at FROM users WHERE id = :id';
        const result = await database.execute(sql, { id: req.user.id });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.ID,
            name: user.NAME,
            email: user.EMAIL,
            createdAt: user.CREATED_AT
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// ============================================
// DASHBOARD DATA ENDPOINT (Protected)
// ============================================
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get total users count
        const userCountSql = 'SELECT COUNT(*) as count FROM users';
        const userCountResult = await database.execute(userCountSql);
        const totalUsers = userCountResult.rows[0].COUNT;

        // You can add more queries here for your dashboard data
        res.json({
            totalUsers,
            revenue: 45678, // Replace with actual query
            activeSessions: 892, // Replace with actual query
            recentActivity: [
                { id: 1, description: 'New user registered', time: '2 hours ago' },
                { id: 2, description: 'Payment received', time: '3 hours ago' },
                { id: 3, description: 'Profile updated', time: '5 hours ago' }
            ]
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error fetching dashboard data' });
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing Oracle connection pool');
    await database.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing Oracle connection pool');
    await database.close();
    process.exit(0);
});