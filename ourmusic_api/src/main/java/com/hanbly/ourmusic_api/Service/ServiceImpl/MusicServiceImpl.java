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
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
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
    public MusicDtoDetail getMusicByMusicId(Integer musicId) {
        Music musicPojo = musicDao.findById(musicId).orElseThrow(() -> new IllegalArgumentException("无法查询该音乐"));

        List<CommentDto> finalCommentsDto = dealWithBatchDataStats.getCommentsForOwner(Comment.OwnerType.MUSIC, musicId);

        MusicDtoDetail resultDto = transformMusicEntityToDetailDto(musicPojo, finalCommentsDto);

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
    public List<MusicDto> findMusicByUserId(Integer userId) {
        List<Music> musics = musicDao.findAllByUser_UserId(userId);

        return dealWithBatchDataStats.dealWithMusicListToResultDto(musics);
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
    public List<MusicDto> findMusicBySomething(String genre, String musicName, String musicArtist, String musicAlbum, String musicYear, String mode) {

        Specification<Music> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 对每个非空参数，添加一个 AND 条件
            if (genre != null && !genre.trim().isEmpty()) {
                // 使用 like 和 lower 实现不区分大小写的模糊匹配
                predicates.add(cb.like(cb.lower(root.get("musicGenre")), "%" + genre.toLowerCase() + "%"));
            }
            if (musicName != null && !musicName.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("musicName")), "%" + musicName.toLowerCase() + "%"));
            }
            if (musicArtist != null && !musicArtist.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("musicArtist")), "%" + musicArtist.toLowerCase() + "%"));
            }
            if (musicAlbum != null && !musicAlbum.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("musicAlbum")), "%" + musicAlbum.toLowerCase() + "%"));
            }
            if (musicYear != null && !musicYear.trim().isEmpty()) {
                // 年份精确匹配
                predicates.add(cb.equal(root.get("musicYear"), musicYear));
            }

            // 将所有条件用 AND 连接起来
            return cb.or(predicates.toArray(new Predicate[0]));
        };

        List<Music> musics = musicDao.findAll(spec);

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

        if(mode != null && mode.equals("simple")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), SIMPLE_SEARCH_COUNT));
        }else if(mode != null && mode.equals("recommend")){
            resultDto = resultDto.subList(0, Math.min(resultDto.size(), RECOMMEND_SEARCH_COUNT));
        }

        return resultDto;
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
