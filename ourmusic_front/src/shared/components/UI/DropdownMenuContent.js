// src/shared/components/UI/DropdownMenuContent.js

import React, { useContext } from "react";
import { FaRegStar } from "react-icons/fa";
import { GrShareOption, GrInstallOption } from "react-icons/gr";
import { MdEdit, MdDelete } from "react-icons/md";
import { RiPlayListAddLine } from "react-icons/ri";
import { AuthContext } from "../../../context/auth-context";

import './DropdownMenuContent.css';

const DropdownMenuContent = React.forwardRef((props, ref) => {
  const {
    music,
    isOwner = false,
    onClose,
    onAddToPlaylist,
    onCollect,
    onShare,
    onEdit,
    onDelete,
    onDownload,
  } = props;

  const auth = useContext(AuthContext);

  // 封装一个通用的点击处理器，它会先检查登录状态，然后执行操作，最后关闭菜单
  const handleItemClick = (action) => {
    // 确保 action 是一个函数再执行
    if (typeof action !== 'function') {
        console.warn("DropdownMenuContent: Provided action is not a function.");
        return () => onClose();
    }
    return () => {
      if (!auth.userId) {
        auth.openLoginModal();
      } else {
        action(music);
      }
      onClose();
    };
  };

  return (
    <ul className="dropdown-menu" ref={ref}>
      {/* 确保只在提供了对应回调函数时才渲染列表项 */}
      {onAddToPlaylist && (
        <li onClick={handleItemClick(onAddToPlaylist)}>
          <RiPlayListAddLine /> 添加到下一首播放
        </li>
      )}
      {onCollect && (
        <li onClick={handleItemClick(onCollect)}>
          <FaRegStar /> 收藏到歌单
        </li>
      )}
      {onShare && (
        <li onClick={handleItemClick(onShare)}>
          <GrShareOption /> 分享
        </li>
      )}

      {isOwner ? (
        <>
          {onEdit && (
            <li onClick={handleItemClick(onEdit)}>
              <MdEdit /> 编辑
            </li>
          )}
          {onDelete && (
            <li onClick={handleItemClick(onDelete)}>
              <MdDelete /> 删除
            </li>
          )}
        </>
      ) : (
        <>
          {onDownload && (
            <li onClick={handleItemClick(onDownload)}>
              <GrInstallOption /> 下载
            </li>
          )}
        </>
      )}
    </ul>
  );
});

export default DropdownMenuContent;