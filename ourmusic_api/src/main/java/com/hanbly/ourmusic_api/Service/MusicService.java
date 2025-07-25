package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.dto.MusicDtoDetail;
import com.hanbly.ourmusic_api.pojo.dto.MusicDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicEditDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MusicService {
    Music addMusic(MusicDto music);

    List<Music> addManyMusic(List<MusicDto> musics);

    MusicDtoDetail getMusicByMusicId(Integer musicId);

    List<MusicDto> findMusicBySomething(String genre, String musicName, String musicArtist, String musicAlbum, String musicYear, String mode);

    List<MusicDto> findWeekHotMusicList();

    Music updateMusic(MusicEditDto music);

//    void updateMusicLikeCount(Integer musicId, String state);

    void deleteMusicByMusicId(Integer musicId);

    void deleteMusicsByMusicIds(List<Integer> musicIds);

    Page<MusicDto> findMusicByUserId(Integer userId, Pageable pageable);
}
