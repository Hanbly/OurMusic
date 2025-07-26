package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.DataStats.*;
import com.hanbly.ourmusic_api.Dao.FileDao;
import com.hanbly.ourmusic_api.Dao.MusicCollectionDao;
import com.hanbly.ourmusic_api.Dao.MusicDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Service.MusicCollectionService;
import com.hanbly.ourmusic_api.Utils.DealWithBatchDataStats;
import com.hanbly.ourmusic_api.pojo.*;
import com.hanbly.ourmusic_api.pojo.DataStats.*;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.MusicTimestampDto;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.*;

@Service
@Transactional
public class MusicCollectionServiceImpl implements MusicCollectionService {

    @Autowired
    private MusicDao musicDao;
    @Autowired
    private MusicCollectionDao musicCollectionDao;
    @Autowired
    private UserDao userDao;
    @Autowired
    private FileDao fileDao;
    @Autowired
    private LikeDao likeDao;
    @Autowired
    private DislikeDao dislikeDao;
    @Autowired
    private CollectStatsDao collectStatsDao;
    @Autowired
    private ShareDao shareDao;
    @Autowired
    private CommentStatsDao commentStatsDao;
    @Autowired
    private DownloadDao downloadDao;
    @Autowired
    private DealWithBatchDataStats dealWithBatchDataStats;

    @Override
    public MusicCollection addCollection(MusicCollectionDto collectionDto) {
        MusicCollection collectionPojo = new MusicCollection();
        // 忽略collectionId表示这是一个新增的方法，不需要复制collectionId
        // 忽略"userId", "musicIds"是由于两者在pojo和dto有对应关系但种类不相同，需要手动转换
        BeanUtils.copyProperties(collectionDto, collectionPojo, "collectionId", "userId", "musicIds", "collectionImageFileId");

        if(collectionDto.getCollectionStatus() == null){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PRIVATE);
        }
        else if(collectionDto.getCollectionStatus().equals("PUBLIC")){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PUBLIC);
        }
        else if(collectionDto.getCollectionStatus().equals("PRIVATE")){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PRIVATE);
        }

        if(collectionDto.getUserId() != null) {
            User user = userDao.findById(collectionDto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            collectionPojo.setUser(user);
        }
        if(collectionDto.getMusics() != null && !collectionDto.getMusics().isEmpty()) {
            List<Music> musics = musicDao.findAllById(collectionDto.getMusics().stream().map(MusicDto::getMusicId).collect(Collectors.toList()));
            collectionPojo.setMusics(musics);
        }
        if(collectionDto.getCollectionImageFileId() != null) {
            CustomFile file = fileDao.findById(collectionDto.getCollectionImageFileId()).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
            collectionPojo.setCollectionImageFile(file);
        }

        return musicCollectionDao.save(collectionPojo);
    }

    @Override
    public MusicCollectionDtoDetail getCollectionByCollectionId(Integer collectionId) {
        // 获取歌单实体，如果不存在则抛出异常
        MusicCollection collectionPojo = musicCollectionDao.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("参数异常，歌单不存在"));

        List<CommentDto> finalCommentsDto = dealWithBatchDataStats.getCommentsForOwner(Comment.OwnerType.COLLECTION, collectionId);

        // 将歌单实体转换为基础的 DTO
        MusicCollectionDtoDetail resultDto = transformCollectionEntityToDetailDto(collectionPojo, finalCommentsDto);

        // 批量查询歌单本身的各项统计数据 (这部分逻辑保持不变)
        resultDto.setCollectionLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionSharedCount(shareDao.countAllByShareOwnerTypeAndShareOwnerId(Share.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionCollectedCount(collectStatsDao.countAllByCollectStatsOwnerTypeAndCollectStatsOwnerId(CollectStats.OwnerType.COLLECTION, collectionId));

        AtomicInteger commentCount = new AtomicInteger();
        List<CommentStats> topCommentsStats = commentStatsDao.findByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType.COLLECTION, collectionId);
        if (!topCommentsStats.isEmpty()) {
            topCommentsStats.forEach(topCommentStats -> {
                commentCount.addAndGet(1); // 顶层评论+1
                // 统计该顶层评论下的所有子评论数
                commentCount.addAndGet(commentStatsDao.countAllByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType.COMMENT, topCommentStats.getCommentStatsId()));
            });
        }
        resultDto.setCollectionCommentedCount(commentCount.get());

        resultDto.setCollectionMusicsNumber(collectStatsDao.countAllByCollectStatsOwnerTypeAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectionId));

        resultDto.setMusics(dealWithBatchDataStats.dealWithMusicListToResultDto(collectionPojo.getMusics()));

        return resultDto;
    }

    @Override
    public MusicCollectionDtoHistory getHistoryCollectionByUserId(Integer userId) {
        User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户歌单"));
        MusicCollection collectionPojo = musicCollectionDao.findByUserAndCollectionName(user, "历史记录");

        collectionPojo.setMusics(
                musicDao.findMusicByCollectionIdAndOwnerTypeSortedByTimestamp(collectionPojo.getCollectionId(), CollectStats.OwnerType.MUSIC)
        );

        MusicCollectionDto musicCollectionDto = transformCollectionEntityToDto(collectionPojo);
        MusicCollectionDtoHistory resultDto = new MusicCollectionDtoHistory();
        List<MusicDtoHistory> musicDtoHistory = new ArrayList<>();

        BeanUtils.copyProperties(musicCollectionDto, resultDto);
        musicDtoHistory = musicCollectionDto.getMusics().stream()
                .map(musicDto -> {
                    MusicDtoHistory historyDto = new MusicDtoHistory();
                    // 是在两个对象间拷贝
                    BeanUtils.copyProperties(musicDto, historyDto);
                    return historyDto;
                })
                .collect(Collectors.toList());

        Set<Integer> musicListIds = musicDtoHistory.stream().map(MusicDtoHistory::getMusicId).collect(Collectors.toSet());
        Map<Integer, Instant> musicTimestamps =
                collectStatsDao.findCollectStatsTimestampsForIdsAndDidUserIdAndCollectionIdGroupedById(
                        CollectStats.OwnerType.MUSIC,
                        userId,
                        collectionPojo.getCollectionId(),
                        musicListIds)
                                .stream()
                                        .collect(Collectors.toMap(MusicTimestampDto::getMusicId, MusicTimestampDto::getTimestamp));

        musicDtoHistory.forEach(dto -> {
            Integer musicId = dto.getMusicId();
            if(musicTimestamps.containsKey(musicId)) {
                dto.setMusicTimestamp(musicTimestamps.get(musicId));
            }
        });

        resultDto.setMusics(musicDtoHistory);

        Integer collectionId = collectionPojo.getCollectionId();
        resultDto.setCollectionLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionSharedCount(shareDao.countAllByShareOwnerTypeAndShareOwnerId(Share.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionCollectedCount(collectStatsDao.countAllByCollectStatsOwnerTypeAndCollectStatsOwnerId(CollectStats.OwnerType.COLLECTION, collectionId));
        resultDto.setCollectionCommentedCount(commentStatsDao.countAllByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType.COLLECTION, collectionId));
        // 统计歌单内音乐数量
        resultDto.setCollectionMusicsNumber(collectStatsDao.countAllByCollectStatsOwnerTypeAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType.MUSIC, collectionId));

        return resultDto;
    }

    @Override
    public Page<MusicCollectionDto> getCollectionByUserId(Integer userId, String searchState, Pageable pageable) {
        if(searchState == null || searchState.isEmpty() || userId == null){
            throw new IllegalArgumentException("请求参数错误，请检查！");
        }
        User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户歌单"));
        Page<MusicCollection> musicCollectionsPage = switch (searchState) {
            case "private" ->
                    musicCollectionDao.findByUser_UserIdAndCollectionNameIsNotOrderByCollectionIdAsc(userId, "历史记录", pageable);
            case "public" ->
                    musicCollectionDao.findByUser_UserIdAndCollectionStatusNot(userId, MusicCollection.CollectionStatus.PRIVATE, pageable);
            default -> throw new IllegalArgumentException("不支持的查询状态: " + searchState);
        };

        List<MusicCollection> collectionsOnThisPage = musicCollectionsPage.getContent();
        List<MusicCollectionDto> collectionsDtoOnThisPage = dealWithBatchDataStats.dealWithCollectionListToResultDto(collectionsOnThisPage);
        return new PageImpl<>(collectionsDtoOnThisPage, pageable, musicCollectionsPage.getTotalElements());
    }

    @Override
    public Page<MusicCollectionDto> getMarkedCollectionByUserId(Integer userId, Pageable pageable) {
        if(userId == null){
            throw new IllegalArgumentException("请求参数错误，请检查！");
        }
        Page<MusicCollection> collectionsPage = musicCollectionDao.findMarkedCollectionsByUserId(userId, pageable);
        List<MusicCollection> collectionsOnThisPage = collectionsPage.getContent();
        List<MusicCollectionDto> collectionsDtoOnThisPage = dealWithBatchDataStats.dealWithCollectionListToResultDto(collectionsOnThisPage);
        return new PageImpl<>(collectionsDtoOnThisPage, pageable, collectionsPage.getTotalElements());
    }

    private final Integer SIMPLE_SEARCH_COUNT = 4;
    private final Integer RECOMMEND_SEARCH_COUNT = 30;
    private final Double LIKE_COUNT_WEIGHT = 0.1;
    private final Double DISLIKE_COUNT_WEIGHT = 0.2;
    private final Double COLLECT_COUNT_WEIGHT = 0.4;
    private final Double SHARE_COUNT_WEIGHT = 0.2;
    private final Double COMMENT_COUNT_WEIGHT = 0.2;
    @Override
    public Page<MusicCollectionDto> getCollectionBySomething(Integer userId, String collectionName, String collectionGenre, String mode, Pageable pageable) {
        Specification<MusicCollection> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (userId != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("userId"), userId));
            }
            if (collectionName != null && !collectionName.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("collectionName")), "%" + collectionName.toLowerCase() + "%"));
            }
            if (collectionGenre != null && !collectionGenre.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("collectionGenre")), "%" + collectionGenre.toLowerCase() + "%"));
            }
            // Hibernate/JPA在处理多对多连接时可能会产生重复的结果
            // 例如，如果一首音乐属于两个歌单，而你只通过其他条件查询，它可能会出现两次
            // 使用 query.distinct(true) 可以确保返回的 Music 实例是唯一的
            query.distinct(true);
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
        List<MusicCollection> musicCollections = musicCollectionDao.findAll(specification);
        if(musicCollections.isEmpty()){
            return null;
        }
        musicCollections.removeIf(collection -> collection.getCollectionName().equals("历史记录")|| collection.getCollectionGenre().equals("默认歌单"));
        List<MusicCollectionDto> resultDto = dealWithBatchDataStats.dealWithCollectionListToResultDto(musicCollections);

        resultDto.sort((r1, r2) -> {
            double score1 = r1.getCollectionLikedCount() * LIKE_COUNT_WEIGHT -
                    r1.getCollectionDislikedCount() * DISLIKE_COUNT_WEIGHT +
                    r1.getCollectionCollectedCount() * COLLECT_COUNT_WEIGHT +
                    r1.getCollectionSharedCount() * SHARE_COUNT_WEIGHT +
                    r1.getCollectionCommentedCount() * COMMENT_COUNT_WEIGHT;
            double score2 = r2.getCollectionLikedCount() * LIKE_COUNT_WEIGHT -
                    r2.getCollectionDislikedCount() * DISLIKE_COUNT_WEIGHT +
                    r2.getCollectionCollectedCount() * COLLECT_COUNT_WEIGHT +
                    r2.getCollectionSharedCount() * SHARE_COUNT_WEIGHT +
                    r2.getCollectionCommentedCount() * COMMENT_COUNT_WEIGHT;
            return Double.compare(score2, score1);
        });

        if(mode != null && mode.equals("simple")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), SIMPLE_SEARCH_COUNT));
        }else if(mode != null && mode.equals("recommend")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), RECOMMEND_SEARCH_COUNT));
        }

        int totalElements = resultDto.size();

        int pageSize = pageable.getPageSize();
        int currentPage = pageable.getPageNumber();

        int startItem = currentPage * pageSize;
        if (startItem > totalElements) {
            // 如果请求的页码超出了实际范围，返回一个空的 Page 对象，但保留正确的总数信息
            return new PageImpl<>(Collections.emptyList(), pageable, totalElements);
        }

        int endItem = Math.min(startItem + pageSize, totalElements);

        List<MusicCollectionDto> pageContent = resultDto.subList(startItem, endItem);

        return new PageImpl<>(pageContent, pageable, totalElements);
    }

    @Override
    public MusicCollection updateCollection(MusicCollectionDto collectionDto) {
        MusicCollection collectionPojo = new MusicCollection();
        BeanUtils.copyProperties(collectionDto, collectionPojo,"userId", "musicIds", "collectionImageFileId");

        if(collectionDto.getUserId() != null) {
            User user = userDao.findById(collectionDto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            collectionPojo.setUser(user);
        }
        if(collectionDto.getMusics() != null && !collectionDto.getMusics().isEmpty()) {
            List<Music> musics = musicDao.findAllById(collectionDto.getMusics().stream().map(MusicDto::getMusicId).collect(Collectors.toList()));
            collectionPojo.setMusics(musics);
        }
        if(collectionDto.getCollectionImageFileId() != null) {
            CustomFile file = fileDao.findById(collectionDto.getCollectionImageFileId()).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
            collectionPojo.setCollectionImageFile(file);
        }

        if(collectionDto.getCollectionStatus() == null){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PRIVATE);
        }
        else if(collectionDto.getCollectionStatus().equals("PUBLIC")){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PUBLIC);
        }
        else if(collectionDto.getCollectionStatus().equals("PRIVATE")){
            collectionPojo.setCollectionStatus(MusicCollection.CollectionStatus.PRIVATE);
        }

        return musicCollectionDao.save(collectionPojo);
    }

//    /**
//     * 将一首歌曲添加到一个歌单中
//     * @param collectionId 歌单的ID
//     * @param musicId 歌曲的ID
//     * @return 更新后的歌单对象
//     */
//    @Override
//    public MusicCollection updateMusicToCollection(Integer collectionId, Integer musicId) {
//        Music music = musicDao.findById(musicId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        MusicCollection collection = musicCollectionDao.findById(collectionId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该歌单"));
//        User user = userDao.findByMusics_MusicId(musicId);
//
//        collection.getMusics().add(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() + 1);
//        music.setMusicCollectedCount(music.getMusicCollectedCount() + 1);
//        user.setUserCollectedCount(user.getUserCollectedCount() + 1);
//
//        musicDao.save(music);
//        userDao.save(user);
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicToUserHistory(Integer userId, Integer musicId) {
//        Music music = musicDao.findById(musicId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        User user = userDao.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该用户"));
//
//        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(user, "历史记录");
//
//        if(collection == null){
//            throw new EntityNotFoundException("无法查询历史记录");
//        }
//
//        collection.getMusics().add(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() + 1);
//
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicToUserDefault(Integer userId, Integer musicId) {
//        Music music = musicDao.findById(musicId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        User userWhoAddMusic = userDao.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该用户"));
//        User userWhoOwnMusic = userDao.findByMusics_MusicId(musicId);
//
//        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(userWhoAddMusic, "默认歌单");
//
//        if(collection == null){
//            throw new EntityNotFoundException("无法查询默认歌单");
//        }
//
//        collection.getMusics().add(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() + 1);
//        music.setMusicCollectedCount(music.getMusicCollectedCount() + 1);
//        userWhoOwnMusic.setUserCollectedCount(userWhoOwnMusic.getUserCollectedCount() + 1);
//
//        musicDao.save(music);
//        userDao.save(userWhoOwnMusic);
//        return musicCollectionDao.save(collection);
//    }
//
//    /**
//     * 将多首歌曲添加到一个歌单中
//     * @param collectionId 歌单的ID
//     * @param musicIds 歌曲的ID列表
//     * @return 更新后的歌单对象
//     */
//    @Override
//    public MusicCollection updateMusicToCollectionBatch(Integer collectionId, List<Integer> musicIds) {
//        MusicCollection collection = musicCollectionDao.findById(collectionId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该歌单"));
//
//        List<Music> musicsToAdd = musicDao.findAllById(musicIds);
//        List<User> users = userDao.findAllByMusics_MusicIdIn(musicIds);
//        musicsToAdd.forEach(music -> {
//            music.setMusicCollectedCount(music.getMusicCollectedCount() + 1);
//        });
//
//        if (musicsToAdd.size() != musicIds.size()) {
//            throw new EntityNotFoundException("部分音乐ID无效，无法在曲库中查询到");
//        }
//        else{
//            collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() + musicIds.size());
//            musicsToAdd.forEach(music -> {
//                music.setMusicCollectedCount(music.getMusicCollectedCount() + 1);
//            });
//            users.forEach(user -> {
//                user.setUserCollectedCount(user.getUserCollectedCount() + 1);
//            });
//        }
//
//        collection.getMusics().addAll(musicsToAdd);
//
//        musicDao.saveAll(musicsToAdd);
//        userDao.saveAll(users);
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicOutCollection(Integer collectionId, Integer musicId) {
//        MusicCollection collection = musicCollectionDao.findById(collectionId).orElseThrow(() -> new EntityNotFoundException("无法查询该歌单"));
//        Music music = collection.getMusics().stream()
//                .filter(m -> m.getMusicId().equals(musicId))
//                .findFirst()
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        User user = userDao.findByMusics_MusicId(musicId);
//
//        collection.getMusics().remove(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() - 1);
//        music.setMusicCollectedCount(music.getMusicCollectedCount() - 1);
//        user.setUserCollectedCount(user.getUserCollectedCount() - 1);
//
//        musicDao.save(music);
//        userDao.save(user);
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicOutUserHistory(Integer userId, Integer musicId) {
//        Music music = musicDao.findById(musicId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        User user = userDao.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该用户"));
//
//        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(user, "历史记录");
//
//        if(collection == null){
//            throw new EntityNotFoundException("无法查询历史记录");
//        }
//
//        collection.getMusics().remove(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() - 1);
//
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicOutUserDefault(Integer userId, Integer musicId) {
//        Music music = musicDao.findById(musicId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
//        User userWhoRemoveMusic = userDao.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该用户"));
//        User userWhoOwnMusic = userDao.findByMusics_MusicId(musicId);
//
//        MusicCollection collection = musicCollectionDao.findByUserAndCollectionName(userWhoRemoveMusic, "默认歌单");
//
//        if(collection == null){
//            throw new EntityNotFoundException("无法查询默认歌单");
//        }
//
//        collection.getMusics().remove(music);
//
//        collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() - 1);
//        music.setMusicCollectedCount(music.getMusicCollectedCount() - 1);
//        userWhoOwnMusic.setUserCollectedCount(userWhoOwnMusic.getUserCollectedCount() - 1);
//
//        musicDao.save(music);
//        userDao.save(userWhoOwnMusic);
//        return musicCollectionDao.save(collection);
//    }
//
//    @Override
//    public MusicCollection updateMusicOutCollectionBatch(Integer collectionId, List<Integer> musicIds) {
//        MusicCollection collection = musicCollectionDao.findById(collectionId)
//                .orElseThrow(() -> new EntityNotFoundException("无法查询该歌单"));
//
//        List<Music> musics = collection.getMusics();
//        List<User> users = userDao.findAllByMusics_MusicIdIn(musicIds);
//
//        for (Integer musicIdToRemove : musicIds) {
//            Music musicToRemove = musics.stream()
//                    .filter(m -> m.getMusicId().equals(musicIdToRemove))
//                    .findFirst()
//                    .orElseThrow(() -> new EntityNotFoundException("无法查询音乐"));
//            // 如果找到了该音乐，从列表中移除
//            if (musicToRemove != null) {
//                musics.remove(musicToRemove);
//                collection.setCollectionMusicsNumber(collection.getCollectionMusicsNumber() - 1);
//                musicToRemove.setMusicCollectedCount(musicToRemove.getMusicCollectedCount() - 1);
//            }
//        }
//        users.forEach(user -> user.setUserCollectedCount(user.getUserCollectedCount() - 1));
//
//        musicDao.saveAll(musics);
//        userDao.saveAll(users);
//        return musicCollectionDao.save(collection);
//    }

    @Override
    public void deleteCollectionByCollectionId(Integer collectionId) {
        musicCollectionDao.deleteById(collectionId);
        ResponseMessage.success();
    }

    @Override
    public void deleteCollectionByCollectionIds(List<Integer> collectionIds) {
        musicCollectionDao.deleteAllByIdInBatch(collectionIds);
        ResponseMessage.success();
    }
}
