package com.hanbly.ourmusic_api.Utils;

import com.hanbly.ourmusic_api.Dao.CommentDao;
import com.hanbly.ourmusic_api.Dao.DataStats.*;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.DataStats.*;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.CommentDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicDto;
import com.hanbly.ourmusic_api.pojo.dto.SubCommentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.*;

@Component
public class DealWithBatchDataStats {

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
    private CommentDao commentDao;
    @Autowired
    private UserDao userDao;

    public List<MusicDto> dealWithMusicListToResultDto(List<Music> musics) {
        if (musics.isEmpty()) {
            return new ArrayList<>();
        }
        Set<Integer> musicListIds = musics.stream().map(Music::getMusicId).collect(Collectors.toSet());

        Map<Integer, Long> likeCounts = likeDao.findLikeCountsForIdsGroupedById(Like.OwnerType.MUSIC, musicListIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));
        Map<Integer, Long> dislikeCounts = dislikeDao.findDislikeCountsForIdsGroupedById(Dislike.OwnerType.MUSIC, musicListIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));
        Map<Integer, Long> collectCounts = collectStatsDao.findCollectStatsCountsForIdsGroupedByIdButNotHistory(CollectStats.OwnerType.MUSIC, musicListIds, "历史记录")
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));
        Map<Integer, Long> shareCounts = shareDao.findShareCountsForIdsGroupedById(Share.OwnerType.MUSIC, musicListIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 结果Map
        Map<Integer, Long> finalCounts = new HashMap<>();
        // 顶层评论实体
        List<CommentStats> topCommentStats = commentStatsDao.findAllByCommentStatsOwnerTypeAndCommentStatsOwnerIdIn(CommentStats.OwnerType.MUSIC, musicListIds);
        // 顶层评论id列表
        Set<Integer> topCommentIds = new HashSet<>();
        topCommentStats.forEach(c -> {
            topCommentIds.add(c.getCommentStatsId());
        });
        // 所有子评论实体
        List<CommentStats> subCommentStats = commentStatsDao.findAllByCommentStatsOwnerTypeAndCommentStatsOwnerIdIn(CommentStats.OwnerType.COMMENT, topCommentIds);
        // 顶层评论数量，根据music分组
        Map<Integer, Long> topLevelCounts = topCommentStats.stream()
                .collect(Collectors.groupingBy(CommentStats::getCommentStatsOwnerId, Collectors.counting()));
        // 计入结果
        topLevelCounts.forEach((musicId, commentCount) -> finalCounts.merge(musicId, commentCount, Long::sum));
        if(!subCommentStats.isEmpty()){
            // 创建 顶层评论-music映射Map
            Map<Integer, Integer> topCommentIdToMusicIdMap = topCommentStats
                    .stream()
                    .collect(Collectors.toMap(CommentStats::getCommentStatsId, CommentStats::getCommentStatsOwnerId));
            // 子评论数量，根据顶层评论分组
            Map<Integer, Long> subLevelCounts = subCommentStats.stream()
                    .collect(Collectors.groupingBy(CommentStats::getCommentStatsOwnerId, Collectors.counting()));
            // 使用顶层评论-music映射，把子评论数量 合并到 对应的音乐id下
            subLevelCounts.forEach((topCommentId, subCommentCount) -> {
                Integer musicId = topCommentIdToMusicIdMap.get(topCommentId);
                if(musicId != null){
                    finalCounts.merge(musicId, subCommentCount, Long::sum);
                }
            });
        }

        Map<Integer, Long> downloadCounts = downloadDao.findDownloadCountsForIdsGroupedById(Download.OwnerType.MUSIC, musicListIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 将结果转换为DTO，根据id配对统计数据
        List<MusicDto> resultDto = new ArrayList<>();
        musics.forEach(music -> {
            MusicDto dto = transformMusicEntityToDto(music);
            dto.setMusicLikedCount(likeCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            dto.setMusicDislikedCount(dislikeCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            dto.setMusicCollectedCount(collectCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            dto.setMusicSharedCount(shareCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            dto.setMusicCommentedCount(finalCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            dto.setMusicDownloadCount(downloadCounts.getOrDefault(music.getMusicId(), 0L).intValue());
            resultDto.add(dto);
        });
        return resultDto;
    }

    public List<MusicCollectionDto> dealWithCollectionListToResultDto(List<MusicCollection> collections) {
        // 如果传入的列表为空，则直接返回一个空列表
        if (collections == null || collections.isEmpty()) {
            return new ArrayList<>();
        }

        // 从音乐收藏列表中提取所有ID，用于后续的批量查询
        Set<Integer> collectionIds = collections.stream()
                .map(MusicCollection::getCollectionId)
                .collect(Collectors.toSet());

        // 假设您的枚举类型中有对应 MUSIC_COLLECTION 的值
        // 批量查询点赞数
        Map<Integer, Long> likeCounts = likeDao.findLikeCountsForIdsGroupedById(Like.OwnerType.COLLECTION, collectionIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 批量查询不喜欢数
        Map<Integer, Long> dislikeCounts = dislikeDao.findDislikeCountsForIdsGroupedById(Dislike.OwnerType.COLLECTION, collectionIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 批量查询收藏数
        Map<Integer, Long> collectCounts = collectStatsDao.findCollectStatsCountsForIdsGroupedById(CollectStats.OwnerType.COLLECTION, collectionIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 批量查询分享数
        Map<Integer, Long> shareCounts = shareDao.findShareCountsForIdsGroupedById(Share.OwnerType.COLLECTION, collectionIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // --- 评论总数计算逻辑 ---
        // 结果Map，用于存放评论总数
        Map<Integer, Long> finalCommentCounts = new HashMap<>();
        // 查询所有与收藏相关的顶层评论实体
        List<CommentStats> topCommentStats = commentStatsDao.findAllByCommentStatsOwnerTypeAndCommentStatsOwnerIdIn(CommentStats.OwnerType.COLLECTION, collectionIds);
        if (!topCommentStats.isEmpty()) {
            // 提取顶层评论的ID列表
            Set<Integer> topCommentIds = topCommentStats.stream()
                    .map(CommentStats::getCommentStatsId)
                    .collect(Collectors.toSet());

            // 查询所有子评论实体
            List<CommentStats> subCommentStats = commentStatsDao.findAllByCommentStatsOwnerTypeAndCommentStatsOwnerIdIn(CommentStats.OwnerType.COMMENT, topCommentIds);

            // 按收藏ID分组，计算顶层评论数量
            Map<Integer, Long> topLevelCounts = topCommentStats.stream()
                    .collect(Collectors.groupingBy(CommentStats::getCommentStatsOwnerId, Collectors.counting()));

            // 将顶层评论数计入最终结果
            finalCommentCounts.putAll(topLevelCounts);

            if (!subCommentStats.isEmpty()) {
                // 创建一个从 顶层评论ID 到 收藏ID 的映射
                Map<Integer, Integer> topCommentIdToCollectionIdMap = topCommentStats.stream()
                        .collect(Collectors.toMap(CommentStats::getCommentStatsId, CommentStats::getCommentStatsOwnerId, (existing, replacement) -> existing)); // 防止key重复

                // 按其所属的顶层评论ID分组，计算子评论数量
                Map<Integer, Long> subLevelCounts = subCommentStats.stream()
                        .collect(Collectors.groupingBy(CommentStats::getCommentStatsOwnerId, Collectors.counting()));

                // 遍历子评论计数，通过映射找到对应的收藏ID，并累加到总数中
                subLevelCounts.forEach((topCommentId, subCommentCount) -> {
                    Integer collectionId = topCommentIdToCollectionIdMap.get(topCommentId);
                    if (collectionId != null) {
                        finalCommentCounts.merge(collectionId, subCommentCount, Long::sum);
                    }
                });
            }
        }
        // --- 评论总数计算结束 ---

        // 批量查询下载数 (假设收藏也可以被下载)
        Map<Integer, Long> downloadCounts = downloadDao.findDownloadCountsForIdsGroupedById(Download.OwnerType.COLLECTION, collectionIds)
                .stream()
                .collect(Collectors.toMap(CountDto::getId, CountDto::getCount));

        // 将结果转换为DTO，并为每个DTO匹配对应的统计数据
        List<MusicCollectionDto> resultDtoList = new ArrayList<>();
        collections.forEach(collection -> {
            // 假设存在一个转换方法将 MusicCollection 实体转为 DTO
            MusicCollectionDto dto = transformCollectionEntityToDto(collection);
            Integer id = collection.getCollectionId();

            // 假设MusicCollectionDto有以下setter方法
            dto.setCollectionLikedCount(likeCounts.getOrDefault(id, 0L).intValue());
            dto.setCollectionDislikedCount(dislikeCounts.getOrDefault(id, 0L).intValue());
            dto.setCollectionCollectedCount(collectCounts.getOrDefault(id, 0L).intValue());
            dto.setCollectionSharedCount(shareCounts.getOrDefault(id, 0L).intValue());
            dto.setCollectionCommentedCount(finalCommentCounts.getOrDefault(id, 0L).intValue());

            resultDtoList.add(dto);
        });

        return resultDtoList;
    }

    public List<CommentDto> getCommentsForOwner(Comment.OwnerType ownerType, Integer ownerId) {
        // 1. 获取所有顶层评论实体，并直接转换为 DTO
        List<CommentDto> topLevelCommentDtos = transformCommentEntityListToDtoList(
                commentDao.findAllByCommentOwnerTypeAndCommentOwnerId(ownerType, ownerId)
        );

        if (topLevelCommentDtos.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 收集所有需要的 ID 用于批量查询
        List<Integer> topLevelCommentIds = topLevelCommentDtos.stream()
                .map(CommentDto::getCommentId)
                .collect(Collectors.toList());

        List<Comment> subComments = commentDao.findAllByCommentOwnerTypeAndCommentOwnerIdIn(
                Comment.OwnerType.COMMENT, topLevelCommentIds
        );

        Set<Integer> allCommentIds = new HashSet<>(topLevelCommentIds);
        Set<Integer> allUserIds = new HashSet<>();

        topLevelCommentDtos.forEach(dto -> allUserIds.add(dto.getUserDto().getUserId()));
        subComments.forEach(sub -> {
            allCommentIds.add(sub.getCommentId());
            allUserIds.add(sub.getUser().getUserId());
            if (sub.getReplyToUserId() != null) {
                allUserIds.add(sub.getReplyToUserId());
            }
        });

        // 3. 批量获取所有需要的数据
        List<Object[]> rawLikeCounts = likeDao.findLikeCountsForCommentIdsGroupedByCommentId(allCommentIds);
        List<Object[]> rawDislikeCounts = dislikeDao.findDislikeCountsForCommentIdsGroupedByCommentId(allCommentIds);
        // 手动构建 Map 并进行类型检查
        Map<Integer, Long> likeCounts = new HashMap<>();
        for (Object[] row : rawLikeCounts) {
//            System.out.println("Like Count Key Type: " + row[0].getClass().getName() + ", Value: " + row[0]);
            // 假设 key 是 Integer 类型进行转换
            likeCounts.put((Integer) row[0], (Long) row[1]);
        }
        Map<Integer, Long> dislikeCounts = new HashMap<>();
        for (Object[] row : rawDislikeCounts) {
            dislikeCounts.put((Integer) row[0], (Long) row[1]);
        }
        Map<Integer, UserDto> userDtoMap = userDao.findUserByIds(allUserIds).stream()
                .map(TransformEntityToDto::transformUserEntityToDto)
                .collect(Collectors.toMap(UserDto::getUserId, dto -> dto));

        // 4. 组装子评论 DTO
        Map<Integer, List<SubCommentDto>> subCommentsByParentId = subComments.stream()
                .collect(Collectors.groupingBy(Comment::getCommentOwnerId))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream().map(subCommentEntity -> {
                            SubCommentDto subDto = TransformEntityToDto.transformSubCommentEntityToDto(subCommentEntity);
                            subDto.setSubCommentLikedCount(likeCounts.getOrDefault(subCommentEntity.getCommentId(), 0L).intValue());
                            subDto.setSubCommentDislikedCount(dislikeCounts.getOrDefault(subCommentEntity.getCommentId(), 0L).intValue());
                            subDto.setUserDto(userDtoMap.get(subCommentEntity.getUser().getUserId()));
                            if (subCommentEntity.getReplyToUserId() != null) {
                                subDto.setReplyToUserDto(userDtoMap.get(subCommentEntity.getReplyToUserId()));
                            }
                            return subDto;
                        }).collect(Collectors.toList())
                ));

        // 5. 将所有数据组装到顶层评论 DTO 中
        topLevelCommentDtos.forEach(dto -> {
            dto.setCommentLikedCount(likeCounts.getOrDefault(dto.getCommentId(), 0L).intValue());
            dto.setCommentDislikedCount(dislikeCounts.getOrDefault(dto.getCommentId(), 0L).intValue());
            dto.setSubCommentsDto(subCommentsByParentId.getOrDefault(dto.getCommentId(), Collections.emptyList()));
        });

        // 按时间戳降序排序
        topLevelCommentDtos.sort(Comparator.comparing(CommentDto::getCommentTimestamp).reversed());

        return topLevelCommentDtos;
    }

}
