import React from 'react';

import './MainHeader.css';

const MainHeader = (props) => {
  // 添加一个 'shifted' 类来响应侧边栏的展开/收缩
  const classes = `main-header ${props.isSideDrawerExpanded ? 'shifted' : ''}`;
  return <header className={classes}>{props.children}</header>;
};

export default MainHeader;