package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Dao.CommentDao;
import com.hanbly.ourmusic_api.Service.MusicService;
import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.MusicDtoDetail;
import com.hanbly.ourmusic_api.pojo.dto.MusicDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicEditDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.*;

@RestController
@RequestMapping("/api/music")
public class MusicController {

    @Autowired
    private MusicService musicService;
    @Autowired
    private CommentDao commentDao;

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #music.userId")
    @PostMapping        // URL: localhost:8080/api/music  method: POST
    public ResponseMessage<MusicDto> addMusic(@Validated @RequestBody MusicDto music) {
        Music newMusic = musicService.addMusic(music);
        return ResponseMessage.success(transformMusicEntityToDto(newMusic));
    }

    @PreAuthorize(value = "hasRole('admin') or @securityCheckService.checkMusicsUserId(#musics, authentication.principal.getUserId())")
    @PostMapping("/batch")        // URL: localhost:8080/api/music/batch  method: POST
    public ResponseMessage<List<MusicDto>> addMusicBatch(@Validated @RequestBody List<MusicDto> musics) {
        List<Music> newMusics = musicService.addManyMusic(musics);
        return ResponseMessage.success(transformMusicEntityListToDtoList(newMusics));
    }


    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
    @GetMapping("/{musicId}")        // URL: localhost:8080/api/music/{musicId}  method: GET
    public ResponseMessage<MusicDtoDetail> getMusic(@PathVariable Integer musicId) {
        MusicDtoDetail music = musicService.getMusicByMusicId(musicId);
        return ResponseMessage.success(music);
    }

    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
    @GetMapping("/batch-by-user")        // URL: localhost:8080/api/music/batch-by-user?userId=...  method: GET
    public ResponseMessage<List<MusicDto>> getMusicByUser(@RequestParam Integer userId) {
        List<MusicDto> musicList = musicService.findMusicByUserId(userId);
        if(musicList == null || musicList.isEmpty()){
            return ResponseMessage.success("音乐列表为空", null);
        }
        return ResponseMessage.success(musicList);
    }

    /**
     * 根据多种可选条件分页查询音乐列表
     * @param musicGenre       流派ID (可选)
     * @param musicName      音乐名称 (可选)
     * @param musicArtist 艺术家名称 (可选)
     * @param musicAlbum  专辑名称 (可选)
     * @param musicYear   发行年份 (可选)
     * @return              筛选后的音乐信息
     */
    @GetMapping("/batch")     // URL: localhost:8080/api/music/batch?musicGenre=...&musicName=...&musicArtist=...&musicAlbum=...&musicYear=...&mode=...  method:GET
    public ResponseMessage<List<MusicDto>> findMusicBySomething(
            @RequestParam(required = false) String musicGenre,
            @RequestParam(required = false) String musicName,
            @RequestParam(required = false) String musicArtist,
            @RequestParam(required = false) String musicAlbum,
            @RequestParam(required = false) String musicYear,
            @RequestParam(required = true) String mode) {

        List<MusicDto> musicList = musicService.findMusicBySomething(musicGenre, musicName, musicArtist, musicAlbum, musicYear, mode);
        if(musicList == null || musicList.isEmpty()){
            return ResponseMessage.success("音乐列表为空", null);
        }
        return ResponseMessage.success(musicList);
    }

    @GetMapping("/week-hot")     // URL: localhost:8080/api/music/week-hot  method:GET
    public ResponseMessage<List<MusicDto>> findWeekHotMusicList() {
        List<MusicDto> musicList = musicService.findWeekHotMusicList();
        if(musicList == null || musicList.isEmpty()){
            return ResponseMessage.success("本周最热音乐列表为空", null);
        }
        return ResponseMessage.success(musicList);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #music.userId")
    @PutMapping      // URL: localhost:8080/api/music  method:PUT
    public ResponseMessage<MusicEditDto> updateMusic(@Validated @RequestBody MusicEditDto music) {
        Music updatedMusic = musicService.updateMusic(music);
        return ResponseMessage.success(transformMusicEntityToEditDto(updatedMusic));
    }

//    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
//    @PutMapping("/{musicId}/{state}")      // URL: localhost:8080/api/music/{musicId}/{state}  method:PUT
//    public ResponseMessage<Void> updateMusicLikeCount(@PathVariable Integer musicId, @PathVariable String state) {
//        musicService.updateMusicLikeCount(musicId, state);
//        return ResponseMessage.success();
//    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping("/{musicId}/user/{userId}")        // URL: localhost:8080/api/music/{musicId}/user/{userId}  method: DELETE
    public ResponseMessage<Void> deleteMusic(@PathVariable Integer musicId, @PathVariable Integer userId) {
        musicService.deleteMusicByMusicId(musicId);
        return ResponseMessage.success();
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping("/batch/user/{userId}")        // URL: localhost:8080/api/music/batch?ids=...&ids=... 等/user/{userId}  method: DELETE
    public ResponseMessage<Void> deleteMusics(@RequestParam("ids") List<Integer> musicIds, @PathVariable Integer userId) {
        musicService.deleteMusicsByMusicIds(musicIds);
        return ResponseMessage.success();
    }

}
