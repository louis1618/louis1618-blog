const bcrypt = require('bcrypt');
const { getUsersCollection } = require('../models/db');
const rateLimit = require('express-rate-limit');

const saltRounds = 10;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 1분
    max: 100, // 1분에 10번 요청 가능
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    statusCode: 429,
    headers: true,
    keyGenerator: (req) => req.ip,
});

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 1분
    max: 100, // 1분에 10번 요청 가능
    message: '회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    statusCode: 429, 
    headers: true,
    keyGenerator: (req) => req.ip,
});

async function signup(req, res) {
    const { userHandle, password } = req.body;

    try {
        const usersCollection = getUsersCollection();
        const existingUser = await usersCollection.findOne({ userHandle });

        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await usersCollection.insertOne({ userHandle, password: hashedPassword, rank: 0 });

        res.status(200).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

async function login(req, res) {
    const { userHandle, password } = req.body;

    try {
        const usersCollection = getUsersCollection();
        const user = await usersCollection.findOne({ userHandle });

        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        if (!user.password) {
            return res.status(500).json({ message: '비밀번호 데이터가 손상되었습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        req.session.user = {
            id: user._id,
            user_handle: user.userHandle,
            rank: user.rank,
        };

        res.status(200).json({ message: '로그인 성공', user: { user_handle: user.userHandle, rank: user.rank } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

async function logout(req, res) {
    try {
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        res.status(200).json({ message: '로그아웃 되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
}

function getClientUserInfo(req, res) {
    if (req.session.user) {
        res.status(200).json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ isAuthenticated: false, message: '인증되지 않은 사용자입니다.' });
    }    
}

// Rate Limiting 미들웨어
module.exports = { 
    signup: [signupLimiter, signup],
    login: [loginLimiter, login],
    logout, 
    getClientUserInfo 
};
