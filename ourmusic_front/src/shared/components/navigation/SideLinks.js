import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaMusic, FaComments } from "react-icons/fa";

import { AuthContext } from "../../../context/auth-context";

import "./SideLinks.css";

const SideLinks = (props) => {
  const auth = useContext(AuthContext);

  return (
    <ul className="side-links">
      <li>
        <NavLink to="/menu" exact>
          <span className="side-links__icon">
            <FaHome />
            <br />
            <p style={{ fontSize: "12px", margin: 0 }}> Home </p>
          </span>

          <span className="side-links__text">主页</span>
        </NavLink>
      </li>
      <li>
        {auth.userId ? (
          <NavLink to={`/${props.userId}/myMusics`} exact>
            <span className="side-links__icon">
              <FaMusic />
              <br />
              <p style={{ fontSize: "12px", margin: 0 }}>Musics</p>
            </span>
            <span className="side-links__text">我的音乐</span>
          </NavLink>
        ) : (
          <a onClick={() => auth.openLoginModal()}>
            <span className="side-links__icon">
              <FaMusic />
              <br />
              <p style={{ fontSize: "12px", margin: 0 }}>Musics</p>
            </span>
            <span className="side-links__text">我的音乐</span>
          </a>
        )}
      </li>
      <li>
        {auth.userId ? (
          <NavLink to={`/${props.userId}/talking`} exact>
            <span className="side-links__icon">
              <FaComments />
              <br />
              <p style={{ fontSize: "12px", margin: 0 }}>Comm</p>
            </span>
            <span className="side-links__text">论坛</span>
          </NavLink>
        ) : (
          <a onClick={() => auth.openLoginModal()}>
            <span className="side-links__icon">
              <FaComments />
              <br />
              <p style={{ fontSize: "12px", margin: 0 }}>Comm</p>
            </span>
            <span className="side-links__text">论坛</span>
          </a>
        )}
      </li>
    </ul>
  );
};

export default SideLinks;
