// src/components/shared/EditModal.js

import React from 'react';
import { IoClose } from "react-icons/io5";
import ReactDOM from 'react-dom';

import './EditModal.css';

/**
 * 一个可复用的编辑模态框组件
 * @param {object} props
 * @param {boolean} props.show - 控制模态框的显示与隐藏
 * @param {function} props.onClose - 关闭模态框时调用的函数
 * @param {string} props.title - 模态框的标题
 * @param {React.ReactNode} props.children - 嵌入到模态框中的具体内容（通常是一个表单）
 */
const EditModal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">{title}</h2>
          <button type="button" className="edit-modal-close-button" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>
        <div className="edit-modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') // 指定挂载目标
  );
};

export default EditModal;