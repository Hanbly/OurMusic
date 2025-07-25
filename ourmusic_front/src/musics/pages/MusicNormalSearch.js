import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";

import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";

import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";
import { BsChevronRight, BsChevronDown } from "react-icons/bs";

import "./MusicNormalSearch.css";

const FilterDropdown = ({ label, name, options, activeValue, onFilterChange, openFilter, setOpenFilter }) => {
  const ref = useRef(null);
  const isOpen = openFilter === name;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        if (isOpen) {
            setOpenFilter(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setOpenFilter, isOpen]);

  const handleSelect = (value) => {
    onFilterChange(name, value);
    setOpenFilter(null);
  };

  const selectedOptionLabel = options.find(opt => opt === activeValue) || label;

  return (
    <div className="filter-container" ref={ref}>
      <button className={`filter-button ${isOpen ? 'active' : ''}`} onClick={() => setOpenFilter(isOpen ? null : name)}>
        <span>{activeValue === 'all' ? label : selectedOptionLabel}</span>
        {isOpen ? <BsChevronDown /> : <BsChevronRight />}
      </button>
      {isOpen && (
        <ul className="filter-dropdown-list">
          <li
            className={`filter-dropdown-item ${activeValue === 'all' ? 'selected' : ''}`}
            onClick={() => handleSelect('all')}
          >
            {label}
          </li>
          {options.map(option => (
            <li
              key={option}
              className={`filter-dropdown-item ${activeValue === option ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MusicNormalSearch = () => {
  const { searchKey } = useParams();

  const [musicResults, setMusicResults] = useState([]);
  const [collectionResults, setCollectionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [musicFilters, setMusicFilters] = useState({
    artist: "all",
    album: "all",
    musicGenre: "all",
    year: "all",
  });

  const [collectionFilters, setCollectionFilters] = useState({
    collectionGenre: "all",
  });
  
  const [openFilter, setOpenFilter] = useState(null);

  const { playTrack } = useAudio();

  useEffect(() => {
    if (!searchKey) {
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      setMusicFilters({ artist: "all", album: "all", musicGenre: "all", year: "all" });
      setCollectionFilters({ collectionGenre: "all" });
      setOpenFilter(null);

      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          musicGenre: searchKey,
          musicName: searchKey,
          musicArtist: searchKey,
          musicAlbum: searchKey,
          musicYear: searchKey,
          mode: "search",
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", {
        params: {
          collectionName: searchKey,
          collectionGenre: searchKey,
          mode: "search",
        },
      });

      try {
        const [musicResponse, collectionResponse] = await Promise.all([
          musicRequest,
          collectionRequest,
        ]);
        setMusicResults(musicResponse.data?.data || []);
        setCollectionResults(collectionResponse.data?.data || []);
      } catch (err) {
        setError("加载搜索结果失败，请检查网络连接或稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchKey]);

  const handleMusicFilterChange = (name, value) => {
    setMusicFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleCollectionFilterChange = (name, value) => {
    setCollectionFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
    }));
  };

  const filterOptions = useMemo(() => {
    const artists = [...new Set(musicResults.map(m => m.musicArtist).filter(Boolean))].sort();
    const albums = [...new Set(musicResults.map(m => m.musicAlbum).filter(Boolean))].sort();
    const musicGenres = [...new Set(musicResults.map(m => m.musicGenre).filter(Boolean))].sort();
    const collectionGenres = [...new Set(collectionResults.map(c => c.collectionGenre).filter(Boolean))].sort();
    const years = [...new Set(musicResults.map(m => m.musicYear?.substring(0, 4)).filter(Boolean))].sort((a, b) => b - a);
    return { artists, albums, musicGenres, collectionGenres, years };
  }, [musicResults, collectionResults]);

  const displayedMusic = useMemo(() => {
    return musicResults.filter(music => {
      const artistMatch = musicFilters.artist === 'all' || music.musicArtist === musicFilters.artist;
      const albumMatch = musicFilters.album === 'all' || music.musicAlbum === musicFilters.album;
      const genreMatch = musicFilters.musicGenre === 'all' || music.musicGenre === musicFilters.musicGenre;
      const yearMatch = musicFilters.year === 'all' || music.musicYear?.startsWith(musicFilters.year);
      return artistMatch && albumMatch && genreMatch && yearMatch;
    });
  }, [musicResults, musicFilters]);

  const displayedCollections = useMemo(() => {
    return collectionResults.filter(collection => {
      const genreMatch = collectionFilters.collectionGenre === 'all' || collection.collectionGenre === collectionFilters.collectionGenre;
      return genreMatch;
    });
  }, [collectionResults, collectionFilters]);

  const handlePlayAll = (musics) => {
    if (musics && musics.length > 0) {
      playTrack(musics[0], musics);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在努力搜索...</span>
        </div>
      );
    }

    if (error) {
      return <div className="search-status-feedback error">{error}</div>;
    }
    
    const hasOriginalResults = musicResults.length > 0 || collectionResults.length > 0;
    if (!hasOriginalResults) {
        return <div className="search-status-feedback">{`未能搜索到与 “${searchKey}” 相关的内容`}</div>;
    }

    const hasFilteredResults = displayedMusic.length > 0 || displayedCollections.length > 0;
    if (!hasFilteredResults) {
        return <div className="search-status-feedback">在当前筛选条件下，没有找到相关内容</div>;
    }

    return (
      <div className="search-results-container">
        {musicResults.length > 0 && displayedMusic.length > 0 && (
          <section className="search-results-section">
            <div className="section-header">
                <h3 className="section-title"><IoMusicalNotes /> 单曲</h3>
                <div className="section-filters">
                    {filterOptions.artists.length > 1 && (
                        <FilterDropdown label="所有艺术家" name="artist" options={filterOptions.artists} activeValue={musicFilters.artist} onFilterChange={handleMusicFilterChange} openFilter={openFilter} setOpenFilter={setOpenFilter} />
                    )}
                    {filterOptions.albums.length > 1 && (
                        <FilterDropdown label="所有专辑" name="album" options={filterOptions.albums} activeValue={musicFilters.album} onFilterChange={handleMusicFilterChange} openFilter={openFilter} setOpenFilter={setOpenFilter} />
                    )}
                    {filterOptions.musicGenres.length > 1 && (
                        <FilterDropdown label="所有风格" name="musicGenre" options={filterOptions.musicGenres} activeValue={musicFilters.musicGenre} onFilterChange={handleMusicFilterChange} openFilter={openFilter} setOpenFilter={setOpenFilter} />
                    )}
                    {filterOptions.years.length > 1 && (
                        <FilterDropdown label="所有年份" name="year" options={filterOptions.years} activeValue={musicFilters.year} onFilterChange={handleMusicFilterChange} openFilter={openFilter} setOpenFilter={setOpenFilter} />
                    )}
                </div>
            </div>
            <div className="music-list-container">
              {displayedMusic.map((music) => (
                <MusicListItemPublicLongVer music={music} key={music.musicId} width="100%" />
              ))}
            </div>
          </section>
        )}

        {collectionResults.length > 0 && displayedCollections.length > 0 && (
          <section className="search-results-section">
            <div className="section-header">
                <h3 className="section-title"><IoAlbums /> 歌单</h3>
                <div className="section-filters">
                    {filterOptions.collectionGenres.length > 1 && (
                        <FilterDropdown label="所有风格" name="collectionGenre" options={filterOptions.collectionGenres} activeValue={collectionFilters.collectionGenre} onFilterChange={handleCollectionFilterChange} openFilter={openFilter} setOpenFilter={setOpenFilter} />
                    )}
                </div>
            </div>
            <ul className="collection-list-container">
              {displayedCollections.map((collection) => (
                <CollectionListItemPublic
                  key={collection.collectionId}
                  collection={collection}
                  onPlayAll={() => handlePlayAll(collection.musics)}
                  width="700px"
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="music-normal-search-page">
      <header className="search-header">
        <h1>搜索到 "{searchKey}" ：</h1>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicNormalSearch;