const bcrypt = require('bcrypt');
const { getUsersCollection } = require('../models/db');
const rateLimit = require('express-rate-limit');

const saltRounds = 10;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    statusCode: 429,
    headers: true,
    keyGenerator: (req) => req.ip,
});

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    statusCode: 429, 
    headers: true,
    keyGenerator: (req) => req.ip,
});

// 유효성 검사 함수
function validateSignupData(DisplayName, userHandle, password) {
    if (DisplayName.length > 30) {
        return '이름은 최대 30자까지 가능합니다.';
    }

    const userHandleRegex = /^[a-zA-Z0-9_]{1,15}$/;
    if (!userHandleRegex.test(userHandle)) {
        return '아이디는 영문, 숫자, 밑줄(_)만 사용 가능하며 최대 15자입니다.';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return '비밀번호는 최소 8자, 영문/숫자/특수문자(@$!%*#?&)를 포함해야 합니다.';
    }

    return null;
}

// 회원가입 API
async function signup(req, res) {
    const { DisplayName, userHandle, password } = req.body;

    try {
        const validationError = validateSignupData(DisplayName, userHandle, password);
        if (validationError) {
            return res.status(400).json({ message: '서버 오류가 발생했습니다.' });
        }

        const usersCollection = getUsersCollection();
        const existingUser = await usersCollection.findOne({ userHandle });

        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await usersCollection.insertOne({ DisplayName, userHandle, password: hashedPassword, rank: 0 });

        res.status(200).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

// 로그인 API
async function login(req, res) {
    const { userHandle, password } = req.body;

    try {
        const usersCollection = getUsersCollection();
        let user = await usersCollection.findOne({ userHandle });

        if (!user) {
            return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        
        if (!user.password || user.rank === undefined || !user.DisplayName || !user.userHandle) {
            return res.status(404).json({ message: '로그인 할 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        req.session.user = {
            id: user._id,
            display_name: user.DisplayName,
            user_handle: user.userHandle,
            rank: user.rank,
        };

        res.status(200).json({
            message: '로그인 성공',
            user: { display_name: user.DisplayName, user_handle: user.userHandle, rank: user.rank },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '알 수 없는 오류가 발생했습니다.' });
    }
}

// 로그아웃 API
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

// 사용자 정보 조회 API
function getClientUserInfo(req, res) {
    if (req.session.user) {
        res.status(200).json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ isAuthenticated: false, message: '인증되지 않은 사용자입니다.' });
    }    
}

module.exports = { 
    signup: [signupLimiter, signup],
    login: [loginLimiter, login],
    logout, 
    getClientUserInfo 
};
