import React, { useRef } from 'react';
import ReactDOM from 'react-dom'; // 推荐使用 Portal，将面板渲染到 body 下，避免 z-index 问题
import { CSSTransition } from 'react-transition-group';
import './SidePanel.css';

const SidePanel = (props) => {
  // 1. 为两个独立的动画元素分别创建 ref
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  const content = (
    // 2. 使用 Fragment (<>) 包裹两个独立的动画组件
    <>
      {/* 动画一：背景遮罩层 */}
      <CSSTransition
        in={props.show}
        timeout={300}
        classNames="backdrop-fade" // 使用独立的 classNames
        mountOnEnter
        unmountOnExit
        nodeRef={backdropRef}
      >
        <div 
          ref={backdropRef} 
          className="side-panel-backdrop" 
          onClick={props.onClose}
        />
      </CSSTransition>

      {/* 动画二：内容面板 */}
      <CSSTransition
        in={props.show}
        timeout={300}
        classNames="side-panel-slide-up" // 使用独立的 classNames
        mountOnEnter
        unmountOnExit
        nodeRef={contentRef}
      >
        <div ref={contentRef} className="side-panel-content">
          {props.children}
        </div>
      </CSSTransition>
    </>
  );

  return ReactDOM.createPortal(content, document.getElementById('side-panel-root'));
};

export default SidePanel;