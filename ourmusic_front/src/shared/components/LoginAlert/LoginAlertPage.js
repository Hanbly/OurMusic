import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";

import { AuthContext } from "../../../context/auth-context";

import "./LoginAlertPage.css";

const LoginAlertPage = ({ show, onClose }) => {
  // --- 状态管理 ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalModel, setModalModel] = useState("login"); // 'login', 'register', 'forgotPassword', 'resetPassword'
  const [countdown, setCountdown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const auth = useContext(AuthContext);

  // ---副作用钩子---

  // 在组件加载时检查URL中是否带有重置密码的token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setModalModel("resetPassword");
      // 清理URL，避免刷新时重复触发
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 当模态框显示状态改变时，重置所有表单状态
  useEffect(() => {
    if (!show) {
      // 延迟重置以等待关闭动画完成
      setTimeout(() => {
        setUsername("");
        setPassword("");
        setEmail("");
        setVerificationCode("");
        setError("");
        setSuccessMessage("");
        // 只有在没有重置token的情况下才返回登录页
        if (!resetToken) {
          setModalModel("login");
        }
        setCountdown(0);
        setIsCodeSent(false);
      }, 300);
    }
  }, [show, resetToken]);

  // 验证码发送倒计时
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- 辅助函数 ---

  // 切换表单模式 (登录、注册、忘记密码)
  const switchMode = (mode) => {
    setModalModel(mode);
    // 清空所有输入和消息
    setUsername("");
    setPassword("");
    setEmail("");
    setVerificationCode("");
    setError("");
    setSuccessMessage("");
    setCountdown(0);
    setIsCodeSent(false);
  };

  // --- 事件处理函数 ---

  // 发送注册验证码
  const handleSendCode = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setError("");
    axios
      .post(`/api/user/send-email/${email}`)
      .then(() => {
        setSuccessMessage("验证码已发送至您的邮箱，请查收！");
        setIsCodeSent(true);
        setCountdown(60);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "发送验证码失败");
      });
  };
  
  // 发送重置密码邮件
  const handleSendResetLink = (event) => {
    event.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setError("");
    setSuccessMessage("");
    axios
      .post(`/api/user/send-reset-email/${email}`)
      .then(() => {
        setSuccessMessage("重置密码链接已发送至您的邮箱，请检查并点击链接以继续。");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "发送失败，请确认邮箱是否已注册。");
      });
  };

  // 提交登录表单
  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    axios
      .post("/api/user/login", { userName: username, password: password })
      .then((response) => {
        auth.login(response.data.data);
        onClose();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "用户名或密码错误");
      });
  };

  // 提交注册表单
  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    axios
      .post("/api/user/register", {
        userName: username,
        password: password,
        email: email,
        validateCode: verificationCode,
      })
      .then(() => {
        setSuccessMessage("注册成功！请使用您的新账号登录。");
        switchMode("login");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "注册失败，请检查输入信息。");
      });
  };


  if (!show) {
    return null;
  }

  // --- JSX 渲染 ---

  const loginForm = (
    <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>
        <IoClose size={24} />
      </button>
      <h1>登录</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleLoginSubmit}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error-message">{error}</p>}
        <div className="form-links">
            <span className="switch-form-link" onClick={() => switchMode('forgotPassword')}>忘记密码？</span>
        </div>
        <button type="submit" className="form-button">登录</button>
      </form>
      <div className="switch-form-container">
        没有账号？<span className="switch-form-link" onClick={() => switchMode('register')}>立即注册</span>
      </div>
    </div>
  );

  const registerForm = (
    <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>
        <IoClose size={24} />
      </button>
      <h1>注册</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleRegisterSubmit}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <div className="email-input-group">
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="button" className="form-button" onClick={handleSendCode} disabled={countdown > 0}>
            {countdown > 0 ? `重新发送(${countdown})` : '发送验证码'}
          </button>
        </div>
        <input type="text" placeholder="验证码" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required disabled={!isCodeSent} />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="form-button" disabled={!isCodeSent}>注册</button>
      </form>
      <div className="switch-form-container">
        已有账号？<span className="switch-form-link" onClick={() => switchMode('login')}>返回登录</span>
      </div>
    </div>
  );
  
  const forgotPasswordForm = (
    <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
            <IoClose size={24} />
        </button>
        <h1>重置密码</h1>
        <p className="form-description">请输入您的注册邮箱，我们将向您发送重置密码的链接。</p>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleSendResetLink}>
            <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="form-button">发送重置链接</button>
        </form>
        <div className="switch-form-container">
            记起密码了？<span className="switch-form-link" onClick={() => switchMode('login')}>返回登录</span>
        </div>
    </div>
  );

  // 根据 modalModel 决定渲染哪个表单
  const renderForm = () => {
    switch(modalModel) {
      case 'register':
        return registerForm;
      case 'forgotPassword':
        return forgotPasswordForm;
      case 'login':
      default:
        return loginForm;
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      {renderForm()}
    </div>
  );
};

export default LoginAlertPage;