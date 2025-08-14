package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.DataStats.CollectStatsDao;
import com.hanbly.ourmusic_api.Dao.DataStats.DislikeDao;
import com.hanbly.ourmusic_api.Dao.DataStats.LikeDao;
import com.hanbly.ourmusic_api.Dao.DataStats.PlayDao;
import com.hanbly.ourmusic_api.Dao.MusicCollectionDao;
import com.hanbly.ourmusic_api.Dao.MusicDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Service.DataStatsService;
import com.hanbly.ourmusic_api.pojo.DataStats.CollectStats;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.SimpleCollectStatsOwner;
import com.hanbly.ourmusic_api.pojo.DataStats.Dislike;
import com.hanbly.ourmusic_api.pojo.DataStats.Like;
import com.hanbly.ourmusic_api.pojo.DataStats.Play;
import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class DataStatsServiceImpl implements DataStatsService {
    private final LikeDao likeDao;
    private final UserDao userDao;
    private final DislikeDao dislikeDao;
    private final MusicDao musicDao;
    private final MusicCollectionDao musicCollectionDao;
    private final CollectStatsDao collectStatsDao;
    private final PlayDao playDao;

    public DataStatsServiceImpl(LikeDao likeDao, UserDao userDao, DislikeDao dislikeDao, MusicDao musicDao, MusicCollectionDao musicCollectionDao, CollectStatsDao collectStatsDao, PasswordEncoder encoder, PlayDao playDao) {
        this.likeDao = likeDao;
        this.userDao = userDao;
        this.dislikeDao = dislikeDao;
        this.musicDao = musicDao;
        this.musicCollectionDao = musicCollectionDao;
        this.collectStatsDao = collectStatsDao;
        this.playDao = playDao;
    }

    @Override
    public ResponseMessage<String> updateLike(String likeOwnerType, Integer likeOwnerId, Integer likeDidUserId) {
        if (likeOwnerType == null || likeOwnerId == null || likeDidUserId == null) {
            throw new IllegalArgumentException("参数错误");
        }
        Like.OwnerType ownerType = Like.OwnerType.valueOf(likeOwnerType);
        Like like = likeDao.findByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(ownerType, likeOwnerId, likeDidUserId);
        if (like == null) {
            like = new Like(ownerType, likeOwnerId, userDao.findById(likeDidUserId).orElseThrow(() -> new EntityNotFoundException("无法查询该用户")));
            likeDao.save(like);
            return ResponseMessage.success("点赞成功", null);
        }
        likeDao.delete(like);
        return ResponseMessage.success("取消点赞成功", null);
    }

    @Override
    public ResponseMessage<String> updateDislike(String dislikeOwnerType, Integer dislikeOwnerId, Integer dislikeDidUserId) {
        if(dislikeOwnerType == null || dislikeOwnerId == null || dislikeDidUserId == null){
            throw new IllegalArgumentException("参数错误");
        }
        Dislike.OwnerType ownerType = Dislike.OwnerType.valueOf(dislikeOwnerType);
        Dislike dislike = dislikeDao.findByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(ownerType, dislikeOwnerId, dislikeDidUserId);
        if (dislike == null) {
            dislike = new Dislike(ownerType, dislikeOwnerId, userDao.findById(dislikeDidUserId).orElseThrow(() -> new EntityNotFoundException("无法查询该用户")));
            dislikeDao.save(dislike);
            return ResponseMessage.success("点踩成功", null);
        }
        dislikeDao.delete(dislike);
        return ResponseMessage.success("取消点踩成功", null);
    }

    @Override
    public ResponseMessage<String> updateCollect(String collectOwnerType, Integer collectOwnerId, Integer collectDidUserId, Integer collectionId) {
        if(collectOwnerType == null || collectOwnerId == null || collectDidUserId == null){
            throw new IllegalArgumentException("参数错误");
        }
        CollectStats.OwnerType ownerType = CollectStats.OwnerType.valueOf(collectOwnerType);
        if(ownerType == CollectStats.OwnerType.MUSIC && collectionId == null){
            throw new IllegalArgumentException("参数错误，缺少目标歌单");
        }
        switch (ownerType) {
            case MUSIC:
                Music music = musicDao.findById(collectOwnerId).orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
                User user = userDao.findById(collectDidUserId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
                MusicCollection collection = musicCollectionDao.findById(collectionId).orElseThrow(() -> new EntityNotFoundException("无法查询歌单"));
                if(!collection.getUser().getUserId().equals(collectDidUserId)){
                    throw new IllegalArgumentException("操作违规，歌单不属于该用户"); // 歌单不属于该用户
                }
                CollectStats collectStats = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectOwnerId, collectDidUserId, collectionId);
                boolean isCollected = false;
                if(collectStats == null){
                    collection.getMusics().add(music);
                    CollectStats newCollectStats = new CollectStats(ownerType, collectOwnerId, user, collection);
                    collectStatsDao.save(newCollectStats);
                    isCollected = true;
                }else{
                    if(!collection.getCollectionName().equals("默认歌单") && !collection.getCollectionName().equals("历史记录")){
                        return ResponseMessage.success("相同音乐已经存在于歌单中哦！", null);
                    }
                    collection.getMusics().remove(music);
                    collectStatsDao.delete(collectStats);
                }
                musicCollectionDao.save(collection);
                return isCollected ? ResponseMessage.success("音乐收藏成功", null) : ResponseMessage.success("音乐取消收藏成功", null);
            case COLLECTION:
                MusicCollection collectionToMark = musicCollectionDao.findById(collectOwnerId).orElseThrow(() -> new EntityNotFoundException("无法查询歌单"));
                User userWantMark = userDao.findById(collectDidUserId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
                if(userWantMark.getCollections().contains(collectionToMark)){
                    throw new IllegalArgumentException("不能收藏自己的歌单");
                }
                CollectStats collectStatsMark = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserId(CollectStats.OwnerType.COLLECTION, collectOwnerId, collectDidUserId);
                boolean isMarked = false;
                if(collectStatsMark == null){
                    userWantMark.getMarkedCollections().add(collectionToMark);
                    CollectStats newCollectStats = new CollectStats(ownerType, collectOwnerId, userWantMark, null);
                    collectStatsDao.save(newCollectStats);
                    isMarked = true;
                } else {
                    userWantMark.getMarkedCollections().remove(collectionToMark);
                    collectStatsDao.delete(collectStatsMark);
                }
                userDao.save(userWantMark);
                return isMarked ?  ResponseMessage.success("用户收藏歌单成功", null) : ResponseMessage.success("用户取消收藏歌单成功", null);
            default:
                throw new IllegalArgumentException("参数错误");
        }
    }

    @Override
    public ResponseMessage<String> updateHistory(Integer musicId, Integer userId) {
        if(musicId == null || userId == null){
            throw new IllegalArgumentException("参数错误");
        }
        CollectStats.OwnerType ownerType = CollectStats.OwnerType.MUSIC;
        Music music = musicDao.findById(musicId).orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
        User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(user, "历史记录");
        if(!collection.getUser().getUserId().equals(userId)){
            throw new IllegalArgumentException("发生错误，无法匹配用户历史记录");
        }
        CollectStats collectStats = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(ownerType, musicId, userId, collection.getCollectionId());
        boolean isCollected = false;
        if(collectStats == null){
            collection.getMusics().add(music);
            CollectStats newCollectStats = new CollectStats(ownerType, musicId, user, collection);
            collectStatsDao.save(newCollectStats);
            // 添加播放记录
            Play exPlay = playDao.findByPlayOwnerTypeAndPlayOwnerIdAndPlayedByUser_UserId(Play.OwnerType.MUSIC, musicId, user.getUserId());
            if(exPlay != null){
                Instant newTimestamp = Instant.now();
                exPlay.setPlayTimestamp(newTimestamp);
                playDao.save(exPlay);
                System.out.println("更新播放记录");
            }else{
                Play play = new Play(Play.OwnerType.MUSIC, musicId, user);
                playDao.save(play);
                System.out.println("添加播放记录");
            }
            isCollected = true;
        }else{
            // bug : 超时移出逻辑不该在这，这里应该重新添加历史记录
            // 可能的解决方法：前端定期发送一个请求，后端进行时间对比，清理所有时间过长的历史记录
            collectStats.setCollectStatsTimestamp(Instant.now());
            collectStatsDao.save(collectStats);
            // 添加播放记录
            Play exPlay = playDao.findByPlayOwnerTypeAndPlayOwnerIdAndPlayedByUser_UserId(Play.OwnerType.MUSIC, musicId, user.getUserId());
            if(exPlay != null){
                Instant newTimestamp = Instant.now();
                exPlay.setPlayTimestamp(newTimestamp);
                playDao.save(exPlay);
                System.out.println("更新播放记录");
            }else{
                Play play = new Play(Play.OwnerType.MUSIC, musicId, user);
                playDao.save(play);
                System.out.println("添加播放记录");
            }
            return ResponseMessage.success("音乐已存在历史记录，更新时间", null);
        }
        musicCollectionDao.save(collection);

        return ResponseMessage.success("音乐加入历史记录", null);
    }

    @Override
    public ResponseMessage<String> deleteHistory(Integer musicId, Integer userId) {
        if(musicId == null || userId == null){
            throw new IllegalArgumentException("参数错误");
        }
        CollectStats.OwnerType ownerType = CollectStats.OwnerType.MUSIC;
        Music music = musicDao.findById(musicId).orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
        User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(user, "历史记录");
        if(!collection.getUser().getUserId().equals(userId)){
            throw new IllegalArgumentException("发生错误，无法匹配用户历史记录");
        }
        CollectStats collectStats = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(ownerType, musicId, userId, collection.getCollectionId());
        if(collectStats == null){
            throw new EntityNotFoundException("无法查询历史记录中音乐数据");
        }else{
            collection.getMusics().remove(music);
            collectStatsDao.delete(collectStats);
        }
        musicCollectionDao.save(collection);

        return ResponseMessage.success("音乐移出历史记录", null);
    }

    @Override
    public ResponseMessage<String> updateDefault(Integer musicId, Integer userId) {
        if(musicId == null || userId == null){
            throw new IllegalArgumentException("参数错误");
        }
        CollectStats.OwnerType ownerType = CollectStats.OwnerType.MUSIC;
        Music music = musicDao.findById(musicId).orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
        User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(user, "默认歌单");
        if(!collection.getUser().getUserId().equals(userId)){
            throw new IllegalArgumentException("发生错误，无法匹配用户默认歌单");
        }
        CollectStats collectStats = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(ownerType, musicId, userId, collection.getCollectionId());
        boolean isCollected = false;
        if(collectStats == null){
            collection.getMusics().add(music);
            CollectStats newCollectStats = new CollectStats(ownerType, musicId, user, collection);
            collectStatsDao.save(newCollectStats);
            isCollected = true;
        }else{
            collection.getMusics().remove(music);
            collectStatsDao.delete(collectStats);
        }
        musicCollectionDao.save(collection);
        return isCollected ? ResponseMessage.success("音乐加入默认歌单成功", null) : ResponseMessage.success("音乐取消加入默认歌单成功", null);
    }

    @Override
    public ResponseMessage<String> deleteCollectFromMC(String collectOwnerType, Integer collectOwnerId, Integer collectDidUserId, Integer collectionId) {
        if(collectOwnerType == null || collectOwnerId == null || collectDidUserId == null || collectionId == null){
            throw new IllegalArgumentException("参数错误");
        }
        CollectStats.OwnerType ownerType = CollectStats.OwnerType.valueOf(collectOwnerType);
        if(ownerType != CollectStats.OwnerType.MUSIC || !userDao.existsById(collectDidUserId)){
            throw new IllegalArgumentException("参数错误，非音乐类型");
        }
        Music music = musicDao.findById(collectOwnerId).orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
        MusicCollection collection = musicCollectionDao.findById(collectionId).orElseThrow(() -> new EntityNotFoundException("无法查询歌单"));
        if(!collection.getUser().getUserId().equals(collectDidUserId)){
            throw new IllegalArgumentException("操作违规，歌单不属于该用户"); // 歌单不属于该用户
        }
        CollectStats collectStats = collectStatsDao.findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectOwnerId, collectDidUserId, collectionId);
        if(collectStats == null){
            throw new EntityNotFoundException("无法查询收藏记录");
        }else{
            collection.getMusics().remove(music);
            collectStatsDao.delete(collectStats);
        }
        musicCollectionDao.save(collection);
        return ResponseMessage.success("音乐取消收藏成功", null);
    }

    @Override
    public ResponseMessage<String> addCollectsIntoMC(List<SimpleCollectStatsOwner> collectStatsOwners, Integer collectDidUserId, Integer collectionId) {
        if (collectStatsOwners == null || collectStatsOwners.isEmpty() || collectDidUserId == null || collectionId == null) {
            throw new IllegalArgumentException("参数错误");
        }
        User user = userDao.findById(collectDidUserId).orElse(null);
        if(user == null ||
                !collectStatsOwners
                        .stream()
                        .allMatch(owner -> owner.getCollectStatsOwnerType() == CollectStats.OwnerType.MUSIC)){
            throw new IllegalArgumentException("参数错误，非音乐类型/用户不存在");
        }
        MusicCollection collection = musicCollectionDao.findById(collectionId).orElseThrow(() -> new EntityNotFoundException("无法查询歌单"));
        if(!collection.getUser().getUserId().equals(collectDidUserId)){
            throw new IllegalArgumentException("操作违规，歌单不属于该用户"); // 歌单不属于该用户
        }
        List<Integer> collectStatsOwnerIds = collectStatsOwners.stream().map(SimpleCollectStatsOwner::getCollectStatsOwnerId).toList();
        List<CollectStats> collectStatsList = collectStatsDao.findAllByCollectStatsOwnerTypeAndCollectStatsOwnerIdInAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectStatsOwnerIds, collectDidUserId, collectionId);
        List<Music> musicList = musicDao.findAllById(collectStatsOwnerIds);

        if(musicList.isEmpty()){
            throw new EntityNotFoundException("无法查询音乐");
        }else if(!collectStatsOwnerIds.isEmpty()){
            Set<Integer> existingMusicIds = collectStatsList.stream()
                    .map(CollectStats::getCollectStatsOwnerId)
                    .collect(Collectors.toSet());
            // 过滤掉已收藏的音乐
            musicList = musicList.stream()
                    .filter(music -> !existingMusicIds.contains(music.getMusicId()))
                    .toList();
//            collectStatsList.forEach(cs -> {
//                musicList.removeAll(musicList.stream().filter(music -> Objects.equals(music.getMusicId(), cs.getCollectStatsOwnerId())).toList());
//            });
            collectStatsList.clear();
        }
        collection.getMusics().addAll(musicList);
        musicList.forEach(music -> collectStatsList.add(new CollectStats(CollectStats.OwnerType.MUSIC, music.getMusicId(), user, collection)));

        collectStatsDao.saveAll(collectStatsList);
        musicCollectionDao.save(collection);
        return ResponseMessage.success("音乐收藏成功", null);
    }

    @Override
    public ResponseMessage<String> deleteCollectsFromMC(List<SimpleCollectStatsOwner> collectStatsOwners, Integer collectDidUserId, Integer collectionId) {
        if (collectStatsOwners == null || collectStatsOwners.isEmpty() || collectDidUserId == null || collectionId == null) {
            throw new IllegalArgumentException("参数错误");
        }
        if(!userDao.existsById(collectDidUserId) ||
                !collectStatsOwners
                        .stream()
                        .allMatch(owner -> owner.getCollectStatsOwnerType() == CollectStats.OwnerType.MUSIC)){
            throw new IllegalArgumentException("参数错误，非音乐类型");
        }
        MusicCollection collection = musicCollectionDao.findById(collectionId).orElseThrow(() -> new EntityNotFoundException("无法查询歌单"));
        if(!collection.getUser().getUserId().equals(collectDidUserId)){
            throw new IllegalArgumentException("操作违规，歌单不属于该用户"); // 歌单不属于该用户
        }
        List<Integer> collectStatsOwnerIds = collectStatsOwners.stream().map(SimpleCollectStatsOwner::getCollectStatsOwnerId).toList();
        if (collectStatsOwnerIds.size() != collectStatsOwners.size()) {
            throw new RuntimeException("运行时错误，请重试");
        }
        List<Music> musicList = musicDao.findAllById(collectStatsOwnerIds);
        List<CollectStats> collectStatsList = collectStatsDao.findAllByCollectStatsOwnerTypeAndCollectStatsOwnerIdInAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectStatsOwnerIds, collectDidUserId, collectionId);

        if(musicList.isEmpty()){
            throw new EntityNotFoundException("无法查询音乐");
        }else if(collectStatsList == null || collectStatsList.isEmpty()){
            return ResponseMessage.success("音乐已取消收藏或不存在收藏记录", null);
        }else{
            collection.getMusics().removeAll(musicList);
            collectStatsDao.deleteAll(collectStatsList);
        }
        musicCollectionDao.save(collection);
        return ResponseMessage.success("音乐取消收藏成功", null);
    }
}
