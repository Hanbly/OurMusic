import React, { useState, useContext } from "react";
import { NavLink, Link } from "react-router-dom";

import { AuthContext } from "../../../context/auth-context";

import "./NavLinks.css";

const NavLinks = (props) => {
  // const [userId, setUserId] = useState(props.userId);
  // 受父组件影响，不能这样写

  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        {props.userId ? (
          <NavLink to={`/${props.userId}/userInfo`} exact>
            个人信息
          </NavLink>
        ) : null}
      </li>
      <li>
        {props.userId ? (
          // <Link to={`/${props.userId}/userInfo`} exact>
          <img
            src={props.userImage}
            alt="头像"
            className="nav-links__user-image"
          />
          // </Link>
        ) : null}
      </li>
      <li>
        {/* 为登录注册按钮添加特殊类名 */}
        {props.userId === null ? (
          <NavLink
            to={``}
            exact
            className="nav-links__cta"
            onClick={auth.openLoginModal}
          >
            登录/注册
          </NavLink>
        ) : null}
      </li>
    </ul>
  );
};

export default NavLinks;
