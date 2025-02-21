import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/auth.module.css';
import logo from '../assets/img/logo_background.svg';

function Signup() {
  const [DisplayName, setDisplayName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateInputs = () => {
    if (DisplayName.length > 30) {
      setError('이름은 최대 30자까지 가능합니다.');
      return false;
    }

    const userHandleRegex = /^[a-zA-Z0-9_]{1,15}$/;
    if (!userHandleRegex.test(userHandle)) {
      setError('아이디는 영문, 숫자, 밑줄(_)만 사용 가능하며 최대 15자입니다.');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('비밀번호는 최소 8자, 영문/숫자/특수문자(@$!%*#?&)를 포함해야 합니다.');
      return false;
    }

    if (password !== passwordCheck) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) return;

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DisplayName, userHandle, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/auth/login');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <main>
      <div className={styles.container}>
        <div className={styles.header2}>
          <div className={styles.logo}>
            <img src={logo} alt="louis1618" className={styles.logo_img} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="DisplayName">이름:</label>
          <input
            type="text"
            id="DisplayName"
            value={DisplayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <label htmlFor="userHandle">아이디:</label>
          <input
            type="text"
            id="userHandle"
            value={userHandle}
            onChange={(e) => setUserHandle(e.target.value)}
            required
          />

          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="password_check">비밀번호 확인:</label>
          <input
            type="password"
            id="password_check"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            required
          />

          <button className={styles.custombutton} type="submit">회원가입</button>
        </form>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <div className={styles.signupLink}>
          <p>계정이 있으신가요? <a href="/auth/login">로그인</a></p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
