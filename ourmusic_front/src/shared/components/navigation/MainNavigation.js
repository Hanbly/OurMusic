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
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);

  const toggleDrawer = () => {
    setDrawerIsOpen(!drawerIsOpen);
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
    try {
      const [musicResponse, collectionResponse] = await Promise.all([
        axiosClient.get(
          `/api/music/batch?musicGenre=${term}&musicName=${term}&musicArtist=${term}&musicAlbum=${term}&musicYear=${term}&mode=simple`
        ),
        axiosClient.get(
          `/api/collection/batch?&collectionName=${term}&collectionGenre=${term}&mode=simple`
        ),
      ]);
      setSearchResults({
        songs: musicResponse.data.data || [],
        collections: collectionResponse.data.data || [],
      });
    } catch (error) {
      console.error("搜索失败:", error);
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
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (searchContainerRef.current) {
        const input = searchContainerRef.current.querySelector('input');
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
        userId: auth.userId
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
                placeholder="搜索音乐、MV、歌单、用户"
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
                searchTerm={searchTerm}
                isLoading={isLoading}
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