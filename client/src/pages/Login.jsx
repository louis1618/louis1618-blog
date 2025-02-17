import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/auth.module.css';
import logo from '../assets/img/logo_background.svg';
import { AuthContext } from '../AuthContext';

function Login() {
  const [userHandle, setUserHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/home'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(userHandle, password);
    if (result.success) {
      navigate(redirect, { replace: true });
    } else {
      setError(result.message);
    }
  };

  if (isAuthenticated) {
    navigate(redirect);
    return null;
  }

  return (
    <main>
      <div className={styles.container}>
        <div className={styles.header2}>
          <img src={logo} alt="louis1618" className={styles.logo_img} />
        </div>

        <form onSubmit={handleSubmit}>
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
          <button className={styles.custombutton} type="submit">
            로그인
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        <div className={styles.signupLink}>
          <p>
            계정이 없으신가요? <a href="/auth/signup">회원가입</a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
