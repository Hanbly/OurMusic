import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";

import axiosClient from "../../api-config";
import { AuthContext } from "../../context/auth-context";
import { useNotification } from "../../context/notification-context";
import EditModal from "../../shared/components/EditModal/EditModal";

import "./UserInfo.css";

const UserInfo = () => {
  const { userId } = useParams(); // userId from URL is a string
  const auth = useContext(AuthContext);
  const { addToast } = useNotification();

  // --- 新增：权限判断 ---
  // 判断当前登录用户是否是该页面的所有者
  // 注意：useParams返回的userId是字符串，需要转为数字进行比较
  const isOwner = auth.isLoggedIn && auth.userId === Number(userId);

  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");

  // 各个编辑模态框的状态
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [showPasswordEditModal, setShowPasswordEditModal] = useState(false);
  const [showAvatarEditModal, setShowAvatarEditModal] = useState(false);
  const [showNickNameEditModal, setShowNickNameEditModal] = useState(false);
  const [showDescriptionEditModal, setShowDescriptionEditModal] =
    useState(false);

  // 表单数据状态
  const [newEmail, setNewEmail] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newNickName, setNewNickName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 新增：验证码相关状态
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isCodeButtonDisabled, setIsCodeButtonDisabled] = useState(false);

  // --- 数据获取逻辑 ---
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axiosClient.get(`/api/user/${userId}`);
        if (response.status === 200) {
          const data = response.data.data;
          setUserInfo(data);
          // 仅当是所有者时，才初始化可编辑字段的值
          if (isOwner) {
            setNewEmail(data.email);
            setNewNickName(data.userNickName || "");
            setNewDescription(data.userDescription || "");
          }
        } else {
          setError("获取用户信息失败，请稍后再试。");
        }
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          setError(
            `获取用户信息失败：${error.response.data.message || "服务器错误"}`
          );
        } else if (!error.response) {
          setError("网络连接失败，请检查您的网络。");
        }
      }
    };
    getUserInfo();
    // 依赖项中加入isOwner，确保在登录状态变化时能正确反应
  }, [userId, isOwner]);

  // 新增：处理倒计时的 effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsCodeButtonDisabled(false);
    }
    // 组件卸载或倒计时变化时清除计时器
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- 事件处理函数 (这些函数只会在isOwner为true时通过UI被触发) ---

  const handleSendCode = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      addToast("请输入有效的邮箱格式！", 'info');
      return;
    }
    setIsCodeButtonDisabled(true);
    try {
      const response = await axiosClient.post(
        `/api/user/send-email/${newEmail}`
      );
      if (response.status === 200) {
        addToast("验证码已成功发送至您的新邮箱，请注意查收。", 'success');
        setCountdown(60);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "验证码发送失败，请稍后再试。", 'error');
      setIsCodeButtonDisabled(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailEditModal(false);
    setNewEmail(userInfo.email);
    setVerificationCode("");
    setCountdown(0);
  };

  const handleEmailEdit = (event) => {
    event.preventDefault();
    if (!verificationCode) {
      addToast("请输入验证码！", 'info');
      return;
    }
    axiosClient
      .put(`/api/user/edit-info`, {
        userId: userId,
        email: newEmail,
        validateCode: verificationCode,
      })
      .then((res) => {
        if (res.status === 200) {
          addToast("邮箱修改成功", 'success');
          setUserInfo((p) => ({ ...p, email: newEmail }));
          closeEmailModal();
        }
      })
      .catch((err) => addToast(err.response?.data?.message || "邮箱修改失败", 'error'));
  };

  const handleNickNameEdit = (event) => {
    event.preventDefault();
    axiosClient
      .put(`/api/user/edit-info`, { userId: userId, userNickName: newNickName })
      .then((res) => {
        if (res.status === 200) {
          addToast("昵称修改成功", 'success');
          setUserInfo((p) => ({ ...p, userNickName: newNickName }));
          setShowNickNameEditModal(false);
        }
      })
      .catch((err) => addToast(err.response?.data?.message || "昵称修改失败", 'error'));
  };

  const handleDescriptionEdit = (event) => {
    event.preventDefault();
    axiosClient
      .put(`/api/user/edit-info`, {
        userId: userId,
        userDescription: newDescription,
      })
      .then((res) => {
        if (res.status === 200) {
          addToast("个人简介修改成功", 'success');
          setUserInfo((p) => ({ ...p, userDescription: newDescription }));
          setShowDescriptionEditModal(false);
        }
      })
      .catch((err) => addToast(err.response?.data?.message || "个人简介修改失败", 'error'));
  };

  const handlePasswordEdit = (event) => {
    event.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast("新密码和确认密码不匹配！", 'info');
      return;
    }
    if (passwords.current === passwords.new) {
      addToast("新密码和旧密码不能一致！", 'info');
      return;
    }
    axiosClient
      .put(`/api/user/edit-info`, {
        userId: userId,
        elderPassword: passwords.current,
        password: passwords.new,
      })
      .then((res) => {
        if (res.status === 200) {
          addToast("密码修改成功", 'success');
          setShowPasswordEditModal(false);
        }
      })
      .catch((err) => addToast(err.response?.data?.message || "密码修改失败", 'error'));
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAvatar) return;
    const formData = new FormData();
    formData.append("file", selectedAvatar);
    try {
      const uploadRes = await axiosClient.post("/api/files/upload", formData);
      const { customFileId, fileUrl } = uploadRes.data.data;
      const updateRes = await axiosClient.put(`/api/user/edit-info`, {
        userId: userId,
        userAvatarFileId: customFileId,
      });
      if (updateRes.status === 200) {
        addToast("头像更新成功！", 'success');
        auth.updateUserData({ userImage: fileUrl });
        setUserInfo((p) => ({ ...p, userAvatarFileUrl: fileUrl }));
        setShowAvatarEditModal(false);
        setAvatarPreview(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "操作失败", 'error');
    }
  };

  const handleLogout = async () => {
    if (window.confirm("确定要退出账号吗？")) {
      try {
        await axiosClient.post("/api/user/logout", {
          userId: userId,
          userName: userInfo?.userName,
        });
        addToast("成功退出登录", 'success');
        auth.logout();
        window.location.href = "/";
      } catch (error) {
        addToast("退出账号失败，或您已处于离线状态。", 'error');
        auth.logout();
        window.location.href = "/";
      }
    }
  };

  if (!userInfo) {
    return (
      <div className="user-info-page-container">
        <h1 className="loading-text">用户信息加载中...</h1>
      </div>
    );
  }

  return (
    <div className="user-info-page-container">
      <h1 className="page-title">个人信息</h1>
      <p className="page-description">
        {isOwner
          ? "以下信息将用于我们的各项服务，您可以随时进行管理。"
          : "正在查看其他用户的信息"}
      </p>

      {/* 基本信息卡片 */}
      <div className="info-card">
        <h2 className="card-heading">基本信息</h2>

        {/* --- 修改点 1：头像行 --- */}
        <div
          className={`info-row ${isOwner ? "clickable" : ""}`}
          onClick={isOwner ? () => setShowAvatarEditModal(true) : null}
        >
          <span className="row-label">头像</span>
          <div className="row-value-with-avatar">
            {isOwner && <span>添加或更换您的个人头像</span>}
            <img
              src={userInfo.userAvatarFileUrl || "/default-avatar.png"}
              alt={`${userInfo.userName}的头像`}
              className="row-avatar-img"
            />
          </div>
        </div>

        <div className="info-row">
          <span className="row-label">用户名</span>
          <span className="row-value">{userInfo.userName}</span>
        </div>

        {/* --- 修改点 2：昵称行 --- */}
        <div
          className={`info-row ${isOwner ? "clickable" : ""}`}
          onClick={isOwner ? () => setShowNickNameEditModal(true) : null}
        >
          <span className="row-label">昵称</span>
          <div className="row-value-with-arrow">
            <span className="row-value">
              {userInfo.userNickName || (isOwner ? "未设置" : "用户未设置昵称")}
            </span>
            {isOwner && (
              <span className="row-arrow">
                <FaChevronRight />
              </span>
            )}
          </div>
        </div>

        {/* --- 修改点 3：个人简介行 --- */}
        <div
          className={`info-row no-border ${isOwner ? "clickable" : ""}`}
          onClick={isOwner ? () => setShowDescriptionEditModal(true) : null}
        >
          <span className="row-label">个人简介</span>
          <div className="row-value-with-arrow">
            <span className="row-value row-value-description">
              {userInfo.userDescription ||
                (isOwner ? "介绍一下自己吧..." : "这个人很神秘，什么都没写...")}
            </span>
            {isOwner && (
              <span className="row-arrow">
                <FaChevronRight />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 统计数据卡片 (无修改，所有人可见) */}
      <div className="info-card">
        <h2 className="card-heading">统计数据</h2>
        <div className="info-row">
          <span className="row-label">分享歌曲</span>
          <span className="row-value">{userInfo.userSharedCount || 0} 首</span>
        </div>
        <div className="info-row">
          <span className="row-label">获赞数量</span>
          <span className="row-value">{userInfo.userLikedCount}</span>
        </div>
        <div className="info-row no-border">
          <span className="row-label">获藏数量</span>
          <span className="row-value">{userInfo.userCollectedCount}</span>
        </div>
      </div>

      {/* 联系信息与安全卡片 */}
      <div className="info-card">
        <h2 className="card-heading">联系信息与安全</h2>
        {/* --- 修改点 4：邮箱行 --- */}
        <div
          className={`info-row ${isOwner ? "clickable" : ""}`}
          onClick={isOwner ? () => setShowEmailEditModal(true) : null}
        >
          <span className="row-label">邮箱</span>
          <div className="row-value-with-arrow">
            <span className="row-value">{userInfo.email}</span>
            {isOwner && (
              <span className="row-arrow">
                <FaChevronRight />
              </span>
            )}
          </div>
        </div>
        {/* --- 修改点 5：密码行 --- */}
        <div
          className={`info-row no-border ${isOwner ? "clickable" : ""}`}
          onClick={isOwner ? () => setShowPasswordEditModal(true) : null}
        >
          <span className="row-label">密码</span>
          <div className="row-value-with-arrow">
            <span className="row-value">********</span>
            {isOwner && (
              <span className="row-arrow">
                <FaChevronRight />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- 修改点 6：操作按钮区域 --- */}
      {isOwner && (
        <div className="actions-container">
          <Link to={`/${userId}/myMusics`} className="action-button">
            前往我的音乐
          </Link>
          <button
            onClick={handleLogout}
            className="action-button logout-button"
          >
            退出账号
          </button>
        </div>
      )}

      {/* 模态框只会在isOwner为true时被触发显示，因此无需修改 */}
      {/* 所有的模态框... */}
      {isOwner && (
        <>
            <EditModal
            show={showAvatarEditModal}
            onClose={() => setShowAvatarEditModal(false)}
            title="更换您的头像"
            >
            <form onSubmit={handleAvatarSubmit} className="avatar-edit-form">
                <img
                src={avatarPreview || userInfo.userAvatarFileUrl || "/default-avatar.png"}
                alt="头像预览"
                className="avatar-preview"
                />
                <label htmlFor="avatar-upload" className="form-upload-button">
                选择图片
                </label>
                <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                style={{ display: "none" }}
                />
                <button
                type="submit"
                className="form-button"
                disabled={!selectedAvatar}
                >
                确认上传
                </button>
            </form>
            </EditModal>

            <EditModal
            show={showNickNameEditModal}
            onClose={() => setShowNickNameEditModal(false)}
            title="修改您的昵称"
            >
            <form onSubmit={handleNickNameEdit} className="edit-form">
                <div className="form-group">
                <label htmlFor="nickname">新昵称</label>
                <input
                    id="nickname"
                    type="text"
                    value={newNickName}
                    onChange={(e) => setNewNickName(e.target.value)}
                    placeholder="请输入您的新昵称"
                />
                </div>
                <button type="submit" className="form-button">
                确认修改
                </button>
            </form>
            </EditModal>

            <EditModal
            show={showDescriptionEditModal}
            onClose={() => setShowDescriptionEditModal(false)}
            title="修改您的个人简介"
            >
            <form onSubmit={handleDescriptionEdit} className="edit-form">
                <div className="form-group">
                <label htmlFor="description">个人简介</label>
                <textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows="5"
                    placeholder="介绍一下自己吧..."
                />
                </div>
                <button type="submit" className="form-button">
                确认修改
                </button>
            </form>
            </EditModal>

            <EditModal
            show={showEmailEditModal}
            onClose={closeEmailModal}
            title="修改您的邮箱"
            >
            <form onSubmit={handleEmailEdit} className="edit-form">
                <div className="form-group">
                <label htmlFor="email">新邮箱地址</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="请输入新邮箱地址"
                    style={{ flexGrow: 1 }}
                    required
                    />
                    <button
                    type="button"
                    className="form-button"
                    onClick={handleSendCode}
                    disabled={isCodeButtonDisabled}
                    >
                    {countdown > 0 ? `${countdown}秒后重发` : "发送验证码"}
                    </button>
                </div>
                </div>
                <div className="form-group">
                <label htmlFor="code">验证码</label>
                <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="请输入您收到的验证码"
                    required
                />
                </div>
                <button type="submit" className="form-button">
                确认修改
                </button>
            </form>
            </EditModal>

            <EditModal
            show={showPasswordEditModal}
            onClose={() => setShowPasswordEditModal(false)}
            title="修改您的密码"
            >
            <form onSubmit={handlePasswordEdit} className="edit-form">
                <div className="form-group">
                <label>当前密码</label>
                <input
                    type="password"
                    onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                    }
                    required
                />
                </div>
                <div className="form-group">
                <label>新密码</label>
                <input
                    type="password"
                    onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                    }
                    required
                />
                </div>
                <div className="form-group">
                <label>确认新密码</label>
                <input
                    type="password"
                    onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    required
                />
                </div>
                <button type="submit" className="form-button">
                更新密码
                </button>
            </form>
            </EditModal>
        </>
      )}
    </div>
  );
};

export default UserInfo;