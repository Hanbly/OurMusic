package com.hanbly.ourmusic_api.Utils;

import com.hanbly.ourmusic_api.pojo.*;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.dto.*;
import org.springframework.beans.BeanUtils;

import java.util.ArrayList;
import java.util.List;

public class TransformEntityToDto {

    public static UserDto transformUserEntityToDto(User entity) {
        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(entity, userDto, "userAvatarFileId", "userAvatarFileUrl", "password");
        if(entity.getUserAvatarFile() != null){
            userDto.setUserAvatarFileId(entity.getUserAvatarFile().getCustomFileId());
            userDto.setUserAvatarFileUrl(entity.getUserAvatarFile().getFileUrl());
        }
        return userDto;
    }

    public static MusicDto transformMusicEntityToDto(Music entity) {
        MusicDto musicDto = new MusicDto();
        BeanUtils.copyProperties(entity, musicDto,
                "musicImageFileId", "musicImageFileUrl", "musicFileId", "musicFileUrl", "userId");
        CustomFile imageFile = entity.getMusicImageFile();
        CustomFile musicFile = entity.getMusicFile();
        if(imageFile != null){
            musicDto.setMusicImageFileId(imageFile.getCustomFileId());
            musicDto.setMusicImageFileUrl(imageFile.getFileUrl());
        }
        if(musicFile != null){
            musicDto.setMusicFileId(musicFile.getCustomFileId());
            musicDto.setMusicFileUrl(musicFile.getFileUrl());
        }
        if(entity.getUser() != null){
            musicDto.setUserId(entity.getUser().getUserId());
        }
        return musicDto;
    }

    public static MusicEditDto transformMusicEntityToEditDto(Music entity) {
        MusicEditDto musicEditDto = new MusicEditDto();
        BeanUtils.copyProperties(entity, musicEditDto, "musicImageFileId", "musicImageFileUrl", "userId");
        CustomFile imageFile = entity.getMusicImageFile();
        if(imageFile != null){
            musicEditDto.setMusicImageFileId(imageFile.getCustomFileId());
            musicEditDto.setMusicImageFileUrl(imageFile.getFileUrl());
        }
        if(entity.getUser() != null){
            musicEditDto.setUserId(entity.getUser().getUserId());
        }
        return musicEditDto;
    }

    public static MusicDtoDetail transformMusicEntityToDetailDto(Music entity, List<CommentDto> commentsDto) {
        MusicDtoDetail musicDetailDto = new MusicDtoDetail();
        BeanUtils.copyProperties(entity, musicDetailDto,
                "musicImageFileId", "musicImageFileUrl", "musicFileId", "musicFileUrl", "userDto", "commentDto");
        CustomFile imageFile = entity.getMusicImageFile();
        CustomFile musicFile = entity.getMusicFile();
        if(imageFile != null){
            musicDetailDto.setMusicImageFileId(imageFile.getCustomFileId());
            musicDetailDto.setMusicImageFileUrl(imageFile.getFileUrl());
        }
        if(musicFile != null){
            musicDetailDto.setMusicFileId(musicFile.getCustomFileId());
            musicDetailDto.setMusicFileUrl(musicFile.getFileUrl());
        }
        if(entity.getUser() != null){
            musicDetailDto.setUserDto(transformUserEntityToDto(entity.getUser()));
        }
        if(commentsDto != null){
            musicDetailDto.setCommentsDto(commentsDto);
        }
        return musicDetailDto;
    }

    public static List<MusicDto> transformMusicEntityListToDtoList(List<Music> entityList) {
        List<MusicDto> dtoList = new ArrayList<>();
        entityList.forEach(entity -> {
            dtoList.add(transformMusicEntityToDto(entity));
        });
        return dtoList;
    }

    public static MusicCollectionDto transformCollectionEntityToDto(MusicCollection entity) {
        MusicCollectionDto musicCollectionDto = new MusicCollectionDto();
        BeanUtils.copyProperties(entity, musicCollectionDto, "collectionImageFileId", "collectionImageFileUrl", "userId", "musicIds");
        CustomFile collectionImageFile = entity.getCollectionImageFile();
        if(collectionImageFile != null){
            musicCollectionDto.setCollectionImageFileId(collectionImageFile.getCustomFileId());
            musicCollectionDto.setCollectionImageFileUrl(collectionImageFile.getFileUrl());
        }
        if(entity.getUser() != null){
            User entityUser = entity.getUser();
            musicCollectionDto.setUser(transformUserEntityToDto(entityUser));
        }
        if(entity.getMusics() != null && !entity.getMusics().isEmpty()){
            List<MusicDto> dtoMusics = getCollectionDtoMusics(entity);
            musicCollectionDto.setMusics(dtoMusics);
        }
        else{
            musicCollectionDto.setMusics(new ArrayList<>());
        }
        return musicCollectionDto;
    }

    private static List<MusicDto> getCollectionDtoMusics(MusicCollection entity) {
        List<MusicDto> dtoMusics = new ArrayList<>();
        List<Music> musicList = entity.getMusics();

        musicList.forEach(music -> {
            MusicDto aDto = new MusicDto();
            BeanUtils.copyProperties(music, aDto, "musicImageFileId", "musicImageFileUrl", "musicFileId", "musicFileUrl");
            CustomFile musicImageFile = music.getMusicImageFile();
            CustomFile musicFile = music.getMusicFile();
            if(musicImageFile != null){
                aDto.setMusicImageFileId(musicImageFile.getCustomFileId());
                aDto.setMusicImageFileUrl(musicImageFile.getFileUrl());
            }
            if(musicFile != null){
                aDto.setMusicFileId(musicFile.getCustomFileId());
                aDto.setMusicFileUrl(musicFile.getFileUrl());
            }
            dtoMusics.add(aDto);
        });
        return dtoMusics;
    }

    public static List<MusicCollectionDto> transformCollectionEntityListToDtoList(List<MusicCollection> entityList) {
        List<MusicCollectionDto> collectionDtoList = new ArrayList<>();
        for (MusicCollection entity : entityList) {
            collectionDtoList.add(transformCollectionEntityToDto(entity));
        }
        return collectionDtoList;
    }

    public static MusicCollectionDtoDetail transformCollectionEntityToDetailDto(MusicCollection entity, List<CommentDto> commentsDto){
        MusicCollectionDtoDetail musicCollectionDetailDto = new MusicCollectionDtoDetail();
        BeanUtils.copyProperties(entity, musicCollectionDetailDto, "collectionImageFileId", "collectionImageFileUrl", "userId", "musicIds");
        CustomFile collectionImageFile = entity.getCollectionImageFile();
        if(collectionImageFile != null){
            musicCollectionDetailDto.setCollectionImageFileId(collectionImageFile.getCustomFileId());
            musicCollectionDetailDto.setCollectionImageFileUrl(collectionImageFile.getFileUrl());
        }
        if(entity.getUser() != null){
            User entityUser = entity.getUser();
            musicCollectionDetailDto.setUser(transformUserEntityToDto(entityUser));
        }
        if(entity.getMusics() != null && !entity.getMusics().isEmpty()){
            List<MusicDto> dtoMusics = getCollectionDtoMusics(entity);
            musicCollectionDetailDto.setMusics(dtoMusics);
        }
        if(commentsDto != null){
            musicCollectionDetailDto.setCommentDto(commentsDto);
        }
        else{
            musicCollectionDetailDto.setMusics(new ArrayList<>());
        }
        return musicCollectionDetailDto;
    }

    public static CommentDto transformCommentEntityToDto(Comment entity) {
        CommentDto commentDto = new CommentDto();
        BeanUtils.copyProperties(entity, commentDto, "musicDto", "userDto");
        if(entity.getCommentOwnerType() != null && entity.getCommentOwnerId() != null){
            commentDto.setCommentOwnerType(entity.getCommentOwnerType());
            commentDto.setCommentOwnerId(entity.getCommentOwnerId());
        }
        if(entity.getUser() != null){
            commentDto.setUserDto(transformUserEntityToDto(entity.getUser()));
        }
        return commentDto;
    }

    public static List<CommentDto> transformCommentEntityListToDtoList(List<Comment> entityList) {
        List<CommentDto> commentDtoList = new ArrayList<>();
        for (Comment entity : entityList) {
            commentDtoList.add(transformCommentEntityToDto(entity));
        }
        return commentDtoList;
    }

    public static SubCommentDto transformSubCommentEntityToDto(Comment entity){
        SubCommentDto subCommentDto = new SubCommentDto();
        subCommentDto.setSubCommentId(entity.getCommentId());
        subCommentDto.setSubCommentContent(entity.getCommentContent());
        subCommentDto.setSubCommentTimestamp(entity.getCommentTimestamp());

        subCommentDto.setSubCommentOwnerType(entity.getCommentOwnerType());
        subCommentDto.setSubCommentOwnerId(entity.getCommentOwnerId());

        subCommentDto.setUserDto(TransformEntityToDto.transformUserEntityToDto(entity.getUser()));
        return subCommentDto;
    }

    public static List<SubCommentDto> transformSubCommentListEntityToDtoList(List<Comment> entityList) {
        List<SubCommentDto> subCommentsDto = new ArrayList<>();
        for (Comment entity : entityList) {
            subCommentsDto.add(transformSubCommentEntityToDto(entity));
        }
        return subCommentsDto;
    }

    public static SearchMsgDto transformSearchEntityToDto(Search entity) {
        SearchMsgDto searchMsgDto = new SearchMsgDto();
        BeanUtils.copyProperties(entity, searchMsgDto);
        return searchMsgDto;
    }

    public static List<SearchMsgDto> transformSearchEntityListToDtoList(List<Search> entityList) {
        List<SearchMsgDto> searchMsgDtoList = new ArrayList<>();
        for (Search entity : entityList) {
            searchMsgDtoList.add(transformSearchEntityToDto(entity));
        }
        return searchMsgDtoList;
    }

}
