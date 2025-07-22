package com.hanbly.ourmusic_api.Security;

import com.hanbly.ourmusic_api.pojo.dto.MusicDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("securityCheckService")
public class SecurityCheckService {

    public boolean checkMusicsUserId(List<MusicDto> musics, Integer userId) {
        if (musics == null || musics.isEmpty()) {
            return true;
        }
        boolean flag = true;
        for (MusicDto music : musics) {
            if (!music.getUserId().equals(userId)) {
                flag = false;
                break;
            }
        }
        return flag;
    }

}
