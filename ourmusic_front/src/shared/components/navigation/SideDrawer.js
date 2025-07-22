import React from 'react';
import './SideDrawer.css';

const SideDrawer = (props) => {
  // 根据 props.isExpanded 添加 'expanded' 类
  const classes = `side-drawer ${props.isExpanded ? 'expanded' : ''}`;

  return (
    <aside className={classes} onClick={props.onClick}>
      {props.children}
    </aside>
  );
};

export default SideDrawer;