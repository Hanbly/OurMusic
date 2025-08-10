package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.*;
import com.hanbly.ourmusic_api.Dao.DataStats.*;
import com.hanbly.ourmusic_api.Service.MusicService;
import com.hanbly.ourmusic_api.Utils.DealWithBatchDataStats;
import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.CustomFile;
import com.hanbly.ourmusic_api.pojo.DataStats.*;
import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import me.xdrop.fuzzywuzzy.model.BoundExtractedResult;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.*;

@Service
@Transactional
public class MusicServiceImpl implements MusicService {

    @Autowired
    private MusicDao musicDao;
    @Autowired
    private UserDao userDao;
    @Autowired
    private FileDao fileDao;
    @Autowired
    private LikeDao likeDao;
    @Autowired
    private CommentDao commentDao;
    @Autowired
    private DislikeDao dislikeDao;
    @Autowired
    private ShareDao shareDao;
    @Autowired
    private CollectStatsDao collectStatsDao;
    @Autowired
    private CommentStatsDao commentStatsDao;
    @Autowired
    private UploadShareDao uploadShareDao;
    @Autowired
    private DownloadDao downloadDao;
    @Autowired
    private PlayDao playDao;
    @Autowired
    private DealWithBatchDataStats dealWithBatchDataStats;

    @Override
    public Music addMusic(MusicDto musicDto) {
        Music musicPojo = new Music();
        BeanUtils.copyProperties(musicDto, musicPojo,
                "musicImageFile", "musicFile",
                "musicId", "userId");

        // 处理文件信息
        CustomFile imageFile;
        if(musicDto.getMusicImageFileId() != null){
            imageFile = fileDao.findById(musicDto.getMusicImageFileId()).orElse(null);
            assert imageFile != null;
            imageFile.setFileStatus(CustomFile.FileStatus.ACTIVE);
            musicPojo.setMusicImageFile(imageFile);
        }
        CustomFile musicFile = fileDao.findById(musicDto.getMusicFileId()).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
        musicFile.setFileStatus(CustomFile.FileStatus.ACTIVE);
        musicPojo.setMusicFile(musicFile);

        musicPojo.setMusicDuring(musicDto.getMusicDuring());

        User user = userDao.findById(musicDto.getUserId()).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
        musicPojo.setUser(user);

        // 处理统计数据
        UploadShare uploadShare = new UploadShare(UploadShare.OwnerType.MUSIC, musicPojo.getMusicId(), user);
        uploadShareDao.save(uploadShare);

        return musicDao.save(musicPojo);
    }

    @Override
    public List<Music> addManyMusic(List<MusicDto> musics) {

        // 把接收的数据转化成实体类列表

        return musics.stream().map(musicsDto -> {
            Music musicPojo = new Music();
            BeanUtils.copyProperties(musicsDto, musicPojo,
                    "musicImageFile", "musicFile",
                    "musicId", "userId");

            // 处理文件信息
            CustomFile imageFile;
            if(musicsDto.getMusicImageFileId() != null){
                imageFile = fileDao.findById(musicsDto.getMusicImageFileId()).orElse(null);
                assert imageFile != null;
                imageFile.setFileStatus(CustomFile.FileStatus.ACTIVE);
                musicPojo.setMusicImageFile(imageFile);
            }
            CustomFile musicFile = fileDao.findById(musicsDto.getMusicFileId()).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
            musicFile.setFileStatus(CustomFile.FileStatus.ACTIVE);
            musicPojo.setMusicFile(musicFile);

            musicPojo.setMusicDuring(musicsDto.getMusicDuring());

            Music musicSaved = musicDao.save(musicPojo);

            User user = userDao.findById(musicsDto.getUserId()).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
            musicPojo.setUser(user);

            // 处理统计数据
            UploadShare uploadShare = new UploadShare(UploadShare.OwnerType.MUSIC, musicSaved.getMusicId(), user);
            uploadShareDao.save(uploadShare);

            return musicPojo;
        }).collect(Collectors.toList());
    }

    @Override
    public MusicDtoDetail getMusicByMusicId(Integer musicId, Integer operateUserId) {
        Music musicPojo = musicDao.findById(musicId).orElseThrow(() -> new IllegalArgumentException("无法查询该音乐"));

        List<CommentDto> finalCommentsDto = dealWithBatchDataStats.getCommentsForOwner(Comment.OwnerType.MUSIC, musicId);

        MusicDtoDetail resultDto = transformMusicEntityToDetailDto(musicPojo, finalCommentsDto);

        // 额外添加，根据当前用户id进行统计数据的状态判断
        if(operateUserId == null){
            resultDto.setOperateUserLikedOrNot(false);
            resultDto.setOperateUserDislikedOrNot(false);
            resultDto.setOperateUserCollectedOrNot(false);
        }else{
            User user = userDao.findById(operateUserId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
            resultDto.setOperateUserLikedOrNot(likeDao.existsByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(Like.OwnerType.MUSIC, resultDto.getMusicId(), operateUserId));
            resultDto.setOperateUserDislikedOrNot(dislikeDao.existsByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(Dislike.OwnerType.MUSIC, resultDto.getMusicId(), operateUserId));
            resultDto.setOperateUserCollectedOrNot(collectStatsDao.existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType.MUSIC, resultDto.getMusicId(), operateUserId, "历史记录"));
        }

        resultDto.setMusicLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.MUSIC, musicId));
        resultDto.setMusicDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.MUSIC, musicId));
        resultDto.setMusicSharedCount(shareDao.countAllByShareOwnerTypeAndShareOwnerId(Share.OwnerType.MUSIC, musicId));
        resultDto.setMusicCollectedCount(collectStatsDao.countAllByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType.MUSIC, musicId, "历史记录"));
        resultDto.setMusicDownloadCount(downloadDao.countAllByDownloadOwnerTypeAndDownloadOwnerId(Download.OwnerType.MUSIC, musicId));

        AtomicInteger finalCount = new AtomicInteger();
        List<CommentStats> topCommentsStats = commentStatsDao.findByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType.MUSIC, musicId);
        if(topCommentsStats.isEmpty()) {
            resultDto.setMusicCommentedCount(0);
            return resultDto;
        }
        topCommentsStats.forEach(topCommentStats -> {
            finalCount.addAndGet(1);
            finalCount.addAndGet(commentStatsDao.countAllByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType.COMMENT, topCommentStats.getCommentStatsId()));
        });

        resultDto.setMusicCommentedCount(finalCount.get());

        return resultDto;
    }

    @Override
    public Page<MusicDto> findMusicByUserId(Integer userId, Integer operateUserId, Pageable pageable) {
        Page<Music> musicPage = musicDao.findAllByUser_UserIdOrderByMusicFile_UploadTimestampDesc(userId, pageable);

        List<Music> musicsOnThisPage = musicPage.getContent();
        List<MusicDto> musicDtosOnThisPage = dealWithBatchDataStats.dealWithMusicListToResultDto(musicsOnThisPage);
        // 额外添加，根据当前用户id进行统计数据的状态判断
        if(operateUserId == null){
            musicDtosOnThisPage.forEach(pc -> {
                pc.setOperateUserLikedOrNot(false);
                pc.setOperateUserDislikedOrNot(false);
                pc.setOperateUserCollectedOrNot(false);
            });
        }else{
            User user = userDao.findById(operateUserId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
            musicDtosOnThisPage.forEach(pc -> {
                pc.setOperateUserLikedOrNot(likeDao.existsByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(Like.OwnerType.MUSIC, pc.getMusicId(), operateUserId));
                pc.setOperateUserDislikedOrNot(dislikeDao.existsByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(Dislike.OwnerType.MUSIC, pc.getMusicId(), operateUserId));
                pc.setOperateUserCollectedOrNot(collectStatsDao.existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType.MUSIC, pc.getMusicId(), operateUserId, "历史记录"));
            });
        }
        return new PageImpl<>(musicDtosOnThisPage, pageable, musicPage.getTotalElements());
    }

    private final Integer SIMPLE_SEARCH_COUNT = 4;
    private final Integer RECOMMEND_SEARCH_COUNT = 30;
    private final Integer WEEK_HOT_MUSIC_COUNT = 10;
    private final Double LIKE_COUNT_WEIGHT = 0.1;
    private final Double DISLIKE_COUNT_WEIGHT = 0.2;
    private final Double COLLECT_COUNT_WEIGHT = 0.3;
    private final Double SHARE_COUNT_WEIGHT = 0.2;
    private final Double COMMENT_COUNT_WEIGHT = 0.2;
    private final Double DOWNLOAD_COUNT_WEIGHT = 0.1;

    @Override
    public Page<MusicDto> findMusicBySomething(String genre, String musicName, String musicArtist, String musicAlbum, String musicYear, String mode, Integer operateUserId, Pageable pageable) {

//        List<Music> musics = musicDao.findCandidatesByCriteria(genre, musicName, musicArtist, musicAlbum, musicYear);
        List<Music> musics = musicDao.findAll();

        if (musics.isEmpty()) {
            return Page.empty(pageable);
        }

        int FILTER_CONFIDENCE_THRESHOLD = 70;
        List<BoundExtractedResult<Music>> musicListFilterGenre;
        List<BoundExtractedResult<Music>> musicListFilterName;
        List<BoundExtractedResult<Music>> musicListFilterArtist;
        List<BoundExtractedResult<Music>> musicListFilterAlbum;
        List<BoundExtractedResult<Music>> musicListFilterYear;

        Map<Music, Integer> musicAndScores = new HashMap<>();
        if(genre != null && !genre.isEmpty()) {
            musicListFilterGenre = FuzzySearch.extractSorted(genre, musics, Music::getMusicGenre, FILTER_CONFIDENCE_THRESHOLD);
            musicListFilterGenre.forEach(mfg -> {
                musicAndScores.merge(mfg.getReferent(), mfg.getScore(), Integer::max);
            });
        }
        if(musicName != null && !musicName.isEmpty()) {
            musicListFilterName = FuzzySearch.extractSorted(musicName, musics, Music::getMusicName, FILTER_CONFIDENCE_THRESHOLD);
            musicListFilterName.forEach(mfn -> {
                musicAndScores.merge(mfn.getReferent(), mfn.getScore(), Integer::max);
            });
        }
        if(musicArtist != null && !musicArtist.isEmpty()) {
            musicListFilterArtist = FuzzySearch.extractSorted(musicArtist, musics, Music::getMusicArtist, FILTER_CONFIDENCE_THRESHOLD);
            musicListFilterArtist.forEach(mfart -> {
                musicAndScores.merge(mfart.getReferent(), mfart.getScore(), Integer::max);
            });
        }
        if(musicAlbum != null && !musicAlbum.isEmpty()) {
            musicListFilterAlbum = FuzzySearch.extractSorted(musicAlbum, musics, Music::getMusicAlbum, FILTER_CONFIDENCE_THRESHOLD);
            musicListFilterAlbum.forEach(mfal -> {
                musicAndScores.merge(mfal.getReferent(), mfal.getScore(), Integer::max);
            });
        }
        if(musicYear != null && !musicYear.isEmpty()) {
            musicListFilterYear = FuzzySearch.extractSorted(musicYear, musics, Music::getMusicYear, FILTER_CONFIDENCE_THRESHOLD);
            musicListFilterYear.forEach(mfy -> {
                musicAndScores.merge(mfy.getReferent(), mfy.getScore(), Integer::max);
            });
        }


        List<Music> musicList = musicAndScores
                .entrySet().stream()
                .sorted(Map.Entry.<Music, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

        // 将结果转换为DTO，根据id配对统计数据
        List<MusicDto> resultDto = dealWithBatchDataStats.dealWithMusicListToResultDto(
                musicList.stream().distinct().toList()
        );

        if(mode != null && mode.equals("simple")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), SIMPLE_SEARCH_COUNT));
        }else if(mode != null && mode.equals("recommend")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), RECOMMEND_SEARCH_COUNT));
        }

        // 1. 获取总记录数
        //    这里的总数是经过模糊匹配、排序和 mode 截断后的列表大小
        int totalElements = resultDto.size();

        // 2. 从 Pageable 对象中获取分页参数
        int pageSize = pageable.getPageSize();
        int currentPage = pageable.getPageNumber();

        // 3. 计算当前页在 resultDto 列表中的起始索引
        //    注意：startItem 不能超过列表总大小
        int startItem = currentPage * pageSize;
        if (startItem > totalElements) {
            // 如果请求的页码超出了实际范围，返回一个空的 Page 对象，但保留正确的总数信息
            return new PageImpl<>(Collections.emptyList(), pageable, totalElements);
        }

        // 4. 计算当前页的结束索引
        int endItem = Math.min(startItem + pageSize, totalElements);

        // 5. 从总列表(resultDto)中手动截取出当前页的数据
        List<MusicDto> pageContent = resultDto.subList(startItem, endItem);

        // 额外添加，根据当前用户id进行统计数据的状态判断
        if(operateUserId == null){
            pageContent.forEach(pc -> {
                pc.setOperateUserLikedOrNot(false);
                pc.setOperateUserDislikedOrNot(false);
                pc.setOperateUserCollectedOrNot(false);
            });
        }else{
            User user = userDao.findById(operateUserId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
            pageContent.forEach(pc -> {
                pc.setOperateUserLikedOrNot(likeDao.existsByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(Like.OwnerType.MUSIC, pc.getMusicId(), operateUserId));
                pc.setOperateUserDislikedOrNot(dislikeDao.existsByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(Dislike.OwnerType.MUSIC, pc.getMusicId(), operateUserId));
                pc.setOperateUserCollectedOrNot(collectStatsDao.existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType.MUSIC, pc.getMusicId(), operateUserId, "历史记录"));
            });
        }

        // 6. 使用 PageImpl 构建并返回 Page 对象
        //    构造函数需要：
        //    a. 当前页的数据列表 (pageContent)
        //    b. 分页请求信息 (pageable)
        //    c. 总记录数 (totalElements)
        return new PageImpl<>(pageContent, pageable, totalElements);
    }

    @Override
    public List<MusicDto> findWeekHotMusicList() {
        List<Play> playList = playDao.findAllByPlayTimestampGreaterThanEqual(Instant.now().minusSeconds(7 * 24 * 60 * 60));
        Set<Integer> musicListIds = playList.stream().map(Play::getPlayOwnerId).collect(Collectors.toSet());
        List<Music> musics = musicDao.findAllById(musicListIds);

        // 将结果转换为DTO，根据id配对统计数据
        List<MusicDto> resultDto = dealWithBatchDataStats.dealWithMusicListToResultDto(musics);

        resultDto.sort((r1, r2) -> {
            double score1 = r1.getMusicLikedCount() * LIKE_COUNT_WEIGHT -
                    r1.getMusicDislikedCount() * DISLIKE_COUNT_WEIGHT +
                    r1.getMusicCollectedCount() * COLLECT_COUNT_WEIGHT +
                    r1.getMusicSharedCount() * SHARE_COUNT_WEIGHT +
                    r1.getMusicCommentedCount() * COMMENT_COUNT_WEIGHT +
                    r1.getMusicDownloadCount() * DOWNLOAD_COUNT_WEIGHT;
            double score2 = r2.getMusicLikedCount() * LIKE_COUNT_WEIGHT -
                    r2.getMusicDislikedCount() * DISLIKE_COUNT_WEIGHT +
                    r2.getMusicCollectedCount() * COLLECT_COUNT_WEIGHT +
                    r2.getMusicSharedCount() * SHARE_COUNT_WEIGHT +
                    r2.getMusicCommentedCount() * COMMENT_COUNT_WEIGHT +
                    r2.getMusicDownloadCount() * DOWNLOAD_COUNT_WEIGHT;
            return Double.compare(score2, score1);
        });

        // 返回前十个，如果数量不足则返回所有
        return resultDto.subList(0, Math.min(resultDto.size(), WEEK_HOT_MUSIC_COUNT));
    }

    @Override
    public Music updateMusic(MusicEditDto musicEditDto) {
        if (musicEditDto.getMusicId() == null) {
            throw new IllegalArgumentException("更新操作必须提供音乐ID！");
        }

        Music musicToUpdate = musicDao.findById(musicEditDto.getMusicId())
                .orElseThrow(() -> new EntityNotFoundException("无法找到ID为 " + musicEditDto.getMusicId() + " 的音乐"));

        musicToUpdate.setMusicName(musicEditDto.getMusicName());
        musicToUpdate.setMusicArtist(musicEditDto.getMusicArtist());
        musicToUpdate.setMusicAlbum(musicEditDto.getMusicAlbum());
        musicToUpdate.setMusicGenre(musicEditDto.getMusicGenre());
        musicToUpdate.setMusicYear(musicEditDto.getMusicYear());

        Integer newImageFileId = musicEditDto.getMusicImageFileId();
        if (newImageFileId != null) {
            CustomFile oldImageFile = musicToUpdate.getMusicImageFile();
            if (oldImageFile == null || !newImageFileId.equals(oldImageFile.getCustomFileId())) {
                // 只有当新旧ID不同时，才处理旧文件和新文件
                if (oldImageFile != null) {
                    // 将旧文件标记为非活动状态
                    oldImageFile.setFileStatus(CustomFile.FileStatus.INACTIVE);
                    fileDao.save(oldImageFile);
                }

                // 加载并处理新文件
                CustomFile newImageFile = fileDao.findById(newImageFileId)
                        .orElseThrow(() -> new EntityNotFoundException("无法找到ID为 " + newImageFileId + " 的封面文件"));

                newImageFile.setFileStatus(CustomFile.FileStatus.ACTIVE);
                fileDao.save(newImageFile);

                // 将新文件关联到音乐上
                musicToUpdate.setMusicImageFile(newImageFile);
            }
        }

        return musicDao.save(musicToUpdate);
    }

    @Override
    public void deleteMusicByMusicId(Integer musicId) {
        Music musicPojo = musicDao.findById(musicId).orElseThrow(() -> new EntityNotFoundException("无法查询该音乐"));
        if(musicPojo.getMusicImageFile() != null){
            musicPojo.getMusicImageFile().setFileStatus(CustomFile.FileStatus.INACTIVE);
        }
        if(musicPojo.getMusicFile() != null){
            musicPojo.getMusicFile().setFileStatus(CustomFile.FileStatus.INACTIVE);
        }
        UploadShare uploadShare = uploadShareDao.findByUploadShareOwnerTypeAndUploadShareOwnerId(UploadShare.OwnerType.MUSIC, musicPojo.getMusicId());
        uploadShareDao.delete(uploadShare);
        musicDao.delete(musicPojo);
    }

    @Override
    public void deleteMusicsByMusicIds(List<Integer> musicIds) {
        List<Music> musics = musicDao.findAllById(musicIds);
        for (Music music : musics) {
            if(music.getMusicImageFile() != null){
                music.getMusicImageFile().setFileStatus(CustomFile.FileStatus.INACTIVE);
            }
            if(music.getMusicFile() != null){
                music.getMusicFile().setFileStatus(CustomFile.FileStatus.INACTIVE);
            }
        }
        musicDao.deleteAll(musics);
    }
}
