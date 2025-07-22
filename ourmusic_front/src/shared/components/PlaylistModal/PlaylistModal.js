import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "../../../context/audio-context";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoPlaySharp } from "react-icons/io5";
import { MdDeleteOutline, MdClearAll } from "react-icons/md";
// 引入拖拽手柄图标
import { LuGripVertical } from "react-icons/lu";
import "./PlaylistModal.css";

// --- 修改后的 SortableItem 组件 ---
const SortableItem = ({ track, index, isPlaying, onPlay, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.musicId + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // setNodeRef 应用在最外层的 li 上，让 dnd-kit 知道这是可排序的节点
    <li
      ref={setNodeRef}
      style={style}
      className={`playlist-modal-item ${isPlaying ? "playing" : ""}`}
      // **关键改动**: 移除 dnd-kit 的 listeners，只保留 onPlay
      onClick={onPlay}
    >
      {/* **新增**: 拖拽手柄，dnd-kit 的监听器现在只作用于此 */}
      <div
        className="drag-handle"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()} // 阻止点击手柄时触发父级的 onPlay
      >
        <LuGripVertical />
      </div>

      <div className="playlist-item-play-indicator">
        {isPlaying ? (
          <IoPlaySharp className="playing-icon" />
        ) : (
          <span className="item-index">{index + 1}</span>
        )}
      </div>
      <div className="playlist-item-info">
        <span className="item-name">{track.musicName}</span>
        <span className="item-artist">{track.musicArtist}</span>
      </div>
      <button
        className="playlist-item-delete-btn"
        title="从列表中移除"
        // **关键改动**: 现在删除按钮的 stopPropagation 变得更加可靠
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <MdDeleteOutline />
      </button>
    </li>
  );
};

// --- PlaylistModal 组件保持不变 ---
const PlaylistModal = ({ triggerRef, onClose }) => {
  const { playlist, setPlaylist, currentTrack, setCurrentTrackByIndex } =
    useAudio();
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // 优化传感器，避免因微小移动就触发拖拽，使得点击更灵敏
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 只有在拖动超过5px时才激活拖拽
      },
    })
  );

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const modalTop = rect.top - 8;
      const modalRight = window.innerWidth - rect.right;
      setPosition({ top: modalTop, right: modalRight });
    }
  }, [triggerRef]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = playlist.findIndex(
        (t, i) => t.musicId + i === active.id
      );
      const newIndex = playlist.findIndex((t, i) => t.musicId + i === over.id);
      setPlaylist(arrayMove(playlist, oldIndex, newIndex));
    }
  };

  const handleRemoveTrack = (indexToRemove) => {
    const newPlaylist = playlist.filter((_, index) => index !== indexToRemove);
    setPlaylist(newPlaylist);
  };

  const handleClearAll = () => {
    setPlaylist([]);
    onClose();
  };

  const handlePlayTrack = (index) => {
    setCurrentTrackByIndex(index);
  };

  return (
    <div
      ref={modalRef}
      className="playlist-modal-container"
      style={{
        position: "fixed",
        top: position.top,
        right: position.right,
        transform: "translateY(-100%)",
      }}
      onMouseLeave={onClose}
    >
      <div className="playlist-modal-header">
        <h4>播放列表 ({playlist.length})</h4>
        <button
          className="playlist-modal-clear-btn"
          title="清空列表"
          onClick={handleClearAll}
        >
          <MdClearAll /> 清空
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={playlist.map((t, i) => t.musicId + i)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="playlist-modal-list">
            {playlist.map((track, index) => (
              <SortableItem
                key={track.musicId + index}
                track={track}
                index={index}
                isPlaying={currentTrack.musicId === track.musicId}
                onPlay={() => handlePlayTrack(index)}
                onRemove={() => handleRemoveTrack(index)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default PlaylistModal;
