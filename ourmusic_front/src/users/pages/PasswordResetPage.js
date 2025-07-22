import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import './PasswordResetPage.css'; 
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {token} = useParams();

  const history = useHistory();

  useEffect(() => {    
    if (token) {
    } else {
      setError('无效的重置链接，未找到令牌。');
    }
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('无法提交，令牌丢失。');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致。');
      return;
    }

    axios
      .post('/api/user/password/refresh', {
        newPassword: newPassword,
        email: email,
        token: token,
      })
      .then(() => {
        setSuccessMessage('密码重置成功！3秒后将跳转到首页，您可以使用新密码登录。');
        setTimeout(() => {
          history.push('/'); 
        }, 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.message || '密码重置失败，链接可能已过期或信息不正确。');
      });
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h1>设置新密码</h1>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!successMessage && (
          <form onSubmit={handleSubmit}>
            <p>请输入您的注册邮箱和新密码。</p>
            <input
              type="email"
              placeholder="您的注册邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="确认新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="form-button" disabled={!token}>
              确认修改
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;