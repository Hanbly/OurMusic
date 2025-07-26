// MainNavigation.js

import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { VscListSelection } from "react-icons/vsc";
import { FaSearch, FaTimes } from "react-icons/fa";

import { AuthContext } from "../../../context/auth-context";
import axiosClient from "../../../api-config";
import MusicSearchResult from "../../../musics/pages/MusicSearchResult";

import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import SideLinks from "./SideLinks";
import "./MainNavigation.css";

const MainNavigation = (props) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  const history = useHistory();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hotSongs, setHotSongs] = useState([]);
  const [searchResults, setSearchResults] = useState({
    songs: [],
    collections: [],
  });
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]); // 新增 State
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);

  const toggleDrawer = () => {
    setDrawerIsOpen(!drawerIsOpen);
  };

  // 新增: 获取搜索历史的函数
  const fetchSearchHistory = async () => {
    if (!auth.userId || searchHistory.length > 0) return;
    try {
      const response = await axiosClient.get(
        `/api/search/${auth.userId}/s-history`
      );
      const payload = response.data && response.data.data;
      const data = Array.isArray(payload) ? payload : [];
      setSearchHistory(data);
    } catch (error) {
      console.error("获取搜索历史失败:", error);
      setSearchHistory([]);
    }
  };

  const fetchHotSongs = async () => {
    if (hotSongs.length > 0) return;
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/api/music/week-hot");
      setHotSongs(response.data.data || []);
    } catch (error) {
      console.error("获取热歌榜失败:", error);
    }
    setIsLoading(false);
  };

  const fetchSearchResults = async (term) => {
    if (!term) return;
    setIsLoading(true);
    // 在 SearchBar.js 或您的父组件中

    try {
      // 准备请求
      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          musicGenre: term,
          musicName: term,
          musicArtist: term,
          musicAlbum: term,
          musicYear: term,
          mode: "simple",
          size: 5, // 建议为预览结果限制数量
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", {
        params: {
          collectionName: term,
          collectionGenre: term,
          mode: "simple",
          size: 3, // 建议为预览结果限制数量
        },
      });

      // 使用 Promise.allSettled 以增加容错性
      const [musicResult, collectionResult] = await Promise.allSettled([
        musicRequest,
        collectionRequest,
      ]);

      // --- 核心修改点：分别解析每个请求的结果 ---

      // 解析音乐结果
      const songs =
        musicResult.status === "fulfilled" &&
        musicResult.value.data.code === 200 &&
        musicResult.value.data.data
          ? musicResult.value.data.data.content || [] // 从 Page 对象中提取 content
          : [];

      // 解析歌单结果
      const collections =
        collectionResult.status === "fulfilled" &&
        collectionResult.value.data.code === 200 &&
        collectionResult.value.data.data
          ? collectionResult.value.data.data.content || [] // 从 Page 对象中提取 content
          : [];

      // 设置最终结果
      setSearchResults({ songs, collections });
    } catch (error) {
      // 这个 catch 主要捕获代码本身的错误，而不是API请求的失败
      console.error("搜索逻辑处理失败:", error);
      setSearchResults({ songs: [], collections: [] });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm) {
        fetchSearchResults(searchTerm);
      } else {
        setSearchResults({ songs: [], collections: [] });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchRelatedSearches = async (term) => {
      try {
        const response = await axiosClient.get(`/api/search/by-a-root/${term}`);
        const payload = response.data && response.data.data;
        const data = Array.isArray(payload) ? payload : [];
        setRelatedSearches(data);
      } catch (error) {
        console.error("获取相关搜索失败:", error);
        setRelatedSearches([]);
      }
    };

    const timerId = setTimeout(() => {
      if (searchTerm) {
        fetchRelatedSearches(searchTerm);
      } else {
        setRelatedSearches([]);
      }
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (!searchTerm) {
      fetchHotSongs();
      fetchSearchHistory(); // 修改: 同时获取搜索历史
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (searchContainerRef.current) {
      const input = searchContainerRef.current.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/s/${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchFocused(false);

      axiosClient.post("/api/search", {
        searchContent: searchTerm.trim(),
        searchType: "POSITIVE",
        userId: auth.userId,
      });
    }
  };

  const id = auth.userId;
  const userName = auth.userName;

  return (
    <React.Fragment>
      <SideDrawer isExpanded={drawerIsOpen}>
        <nav className="main-navigation__drawer-nav">
          <SideLinks userId={id} keyValue={id} />
        </nav>
      </SideDrawer>

      <button className="main-navigation__menu-btn" onClick={toggleDrawer}>
        <span className="main-navigation__menu-icon">
          <VscListSelection />
        </span>
      </button>

      <MainHeader isSideDrawerExpanded={drawerIsOpen}>
        <div className="main-navigation__left-content">
          <h1 className="main-navigation__title">
            <Link to="/">OurMusic</Link>
          </h1>
          <div
            className={`main-navigation__search-container ${
              isSearchFocused ? "search-container--active" : ""
            }`}
            ref={searchContainerRef}
          >
            <form
              className="main-navigation__search-form"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="search-form__input"
                placeholder="搜索音乐、歌单、艺术家、专辑"
                onFocus={handleSearchFocus}
                onChange={handleInputChange}
                value={searchTerm}
              />
              {searchTerm && (
                <FaTimes
                  className="search-form__clear-icon"
                  onClick={clearSearch}
                />
              )}
              <button type="submit" className="search-form__submit-button">
                <FaSearch />
              </button>
            </form>
            {isSearchFocused && (
              <MusicSearchResult
                hotSongs={hotSongs}
                searchResults={searchResults}
                relatedSearches={relatedSearches}
                searchHistory={searchHistory} // 修改: 传递 prop
                searchTerm={searchTerm}
                isLoading={isLoading}
                setIsSearchFocused={setIsSearchFocused}
                axiosClient={axiosClient}
                auth={auth}
              />
            )}
          </div>
        </div>

        <nav className="main-navigation__header-nav">
          <NavLinks
            userId={id}
            userImage={auth.userImage}
            userName={userName}
            keyValue={id}
          />
        </nav>
      </MainHeader>

      <main className={`main-content ${drawerIsOpen ? "shifted" : ""}`}>
        {props.children}
      </main>
    </React.Fragment>
  );
};

export default MainNavigation;
