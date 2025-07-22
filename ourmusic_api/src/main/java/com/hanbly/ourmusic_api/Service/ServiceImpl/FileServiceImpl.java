package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.DataStats.DownloadDao;
import com.hanbly.ourmusic_api.Dao.FileDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Exception.FileStorageException;
import com.hanbly.ourmusic_api.Service.FileService;
import com.hanbly.ourmusic_api.pojo.CustomFile;
import com.hanbly.ourmusic_api.pojo.DataStats.Download;
import com.hanbly.ourmusic_api.pojo.Lyric;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.dto.FileUploadResponseDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicFilePreviewDto;
import io.minio.*;
import io.minio.errors.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.jaudiotagger.audio.AudioHeader;
import org.jaudiotagger.tag.FieldKey;
import org.jaudiotagger.tag.Tag;
import org.jaudiotagger.tag.flac.FlacTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class FileServiceImpl implements FileService {

//    Path storagePath = Paths.get("./uploads").toAbsolutePath().normalize();
//    String baseUrl = "http://localhost:8080";
//    @Autowired
//    FileDao fileDao;
//    @Autowired
//    UserDao userDao;

//    private final Path storagePath;
//    private final String baseUrl;
    private final FileDao fileDao;
    private final UserDao userDao;
    private final MinioClient minioClient;
    private final Path fileStorageLocation; // 文件存储的根路径
    private final DownloadDao downloadDao;

    @Autowired
    public FileServiceImpl(FileDao fileDao, UserDao userDao, MinioClient minioClient, DownloadDao downloadDao) {
        this.fileDao = fileDao;
        this.userDao = userDao;
        this.minioClient = minioClient;
        this.fileStorageLocation = Paths.get(String.join("/")).toAbsolutePath().normalize();
//        this.storagePath = Paths.get("./uploads").toAbsolutePath().normalize();
//        this.baseUrl = "http://localhost:8080";
//        try {
//            // 在服务初始化时，检查并创建上传目录
//            Files.createDirectories(this.storagePath);
//        } catch (Exception ex) {
////            // 如果创建目录失败，应用启动时就应该抛出异常，而不是等到上传时
////            throw new FileStorageException("无法创建文件上传目录！请检查权限或路径配置。", ex);
//            throw new RuntimeException(ex);
//        }
        this.downloadDao = downloadDao;
    }
     @Value("${minio.endpoint}")
     private String minioEndpoint;
    @Value("${minio.bucket-name}")
    private String bucketName;

    @Override
    public FileUploadResponseDto upload(MultipartFile file) throws IOException {

        // 检测是否为空
        if (file.isEmpty()) {
            throw new FileStorageException("上传的文件不能为空");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        // 生成唯一的文件名
        String fileExtension = getExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + "." + fileExtension;

        Lyric lyric = new Lyric();
        Long musicDuring = 0L;
        if(fileExtension.equals("mp3") || fileExtension.equals("wav") || fileExtension.equals("flac")) {
            File tempFile = convertMultiPartToFile(file);
            lyric.setLyricContent(extractLyrics(tempFile));
            musicDuring = extractMusicDuration(tempFile);
            if (tempFile.exists()) {
                boolean deleted = tempFile.delete();
                if (!deleted) {
                    System.err.println("警告：无法删除临时文件 " + tempFile.getAbsolutePath());
                }
            }
        }

//        // 存储文件
//        try{
//            Path targetPath = storagePath.resolve(storedFilename);
//            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
//        }catch(IOException e){
//            throw new FileStorageException("无法存储文件 " + originalFilename + "。请重试！", e);
//        }
        try {
            // 检查 bucket 是否存在，如果不存在则自动创建
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                System.out.println("Bucket '" + bucketName + "' created.");
            } else {
                System.out.println("Bucket '" + bucketName + "' already exists.");
            }
            // 使用 PutObjectArgs 上传文件
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName) // 目标 bucket
                            .object(storedFilename) // 在 bucket 中的对象名称
                            .stream(file.getInputStream(), file.getSize(), -1) // 文件流
                            .contentType(file.getContentType()) // 文件类型
                            .build());
        } catch (Exception e) { // MinIO 的异常范围更广
            throw new FileStorageException("使用 MinIO 存储文件时发生错误: " + e.getMessage(), e);
        }

        // 获取用户信息
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User uploadedUser = userDao.findByUserName(username).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));

        // 创建并填充 CustomFile 实体
        CustomFile filePojo = new CustomFile();
        filePojo.setCustomFileOriName(originalFilename);
        filePojo.setCustomFileStoredName(storedFilename);
        filePojo.setFileSize(file.getSize());
        filePojo.setFileType(file.getContentType());
        filePojo.setFileRelativePath(bucketName + "/" + storedFilename);
        filePojo.setUploadTimestamp(Instant.now());
        filePojo.setFileStatus(CustomFile.FileStatus.LOADING); // 初始状态为 LOADING
        filePojo.setUploader(uploadedUser);

//        // 构造可访问的URL
//        // 示例URL: http://localhost:8080/api/files/uuid-name.mp3
//        String fileUrl = baseUrl + "/api/files/download/" + storedFilename;
//        filePojo.setFileUrl(fileUrl);
        String fileUrl = String.join("/", minioEndpoint, bucketName, storedFilename);
        filePojo.setFileUrl(fileUrl);

        CustomFile savedFile = fileDao.save(filePojo);

        // 创建并返回响应DTO
        FileUploadResponseDto responseFile = new FileUploadResponseDto();
        responseFile.setCustomFileId(savedFile.getCustomFileId());
        responseFile.setFileUrl(savedFile.getFileUrl());
        responseFile.setLyric(lyric);
        responseFile.setMusicDuring(musicDuring);

        return responseFile;
    }

    @Override
    public MusicFilePreviewDto previewMusicFile(MultipartFile file) throws IOException {
        MusicFilePreviewDto musicFilePreviewDto;
        File audioFile = convertMultiPartToFile(file);
        musicFilePreviewDto = extractMusicInfo(audioFile);
        return musicFilePreviewDto;
    }

    @Override
    public ResponseEntity<Resource> downloadFile(String filename, Integer musicId, Integer userId, HttpServletResponse response, HttpServletRequest request) {
        try {
            // 参数校验：防止路径穿越攻击
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest().build();
            }

            // 构建 MinIO 对象名称
            String objectName = filename;

            // 检查对象是否存在
            StatObjectArgs statObjectArgs = StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build();
            minioClient.statObject(statObjectArgs);

            // 获取输入流
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build();
            InputStream inputStream = minioClient.getObject(getObjectArgs);

            // 设置响应头
            response.setContentType("application/octet-stream");
            String contentDisposition = "attachment; filename=\"" + filename + "\"";
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, contentDisposition);

            // 将文件流写入响应输出流
            try (OutputStream outputStream = response.getOutputStream();
                 BufferedInputStream bufferedInput = new BufferedInputStream(inputStream)) {

                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = bufferedInput.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }

            // 处理统计数据
            User user = userDao.findById(userId).orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
            Download download = new Download(Download.OwnerType.MUSIC, musicId, user);
            downloadDao.save(download);

            return ResponseEntity.ok().build();

        } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
            // 可加入日志记录
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

    }

    /**
     * 获取文件扩展名
     */
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    /**
     * 处理歌词
     */
    private String extractLyrics(File audioFile) {
        try {
            AudioFile f = AudioFileIO.read(audioFile);
            Tag tag = f.getTag();
            if (tag != null) {
                return tag.getFirst(FieldKey.LYRICS);
            }
        } catch (Exception e) {
            // 处理读取异常，例如文件格式不支持等
            System.err.println("Error reading audio file metadata: " + e.getMessage());
        }
        return null;
    }

    /**
     * 处理音乐时长
     */
    private Long extractMusicDuration(File audioFile) {
        try {
            AudioFile f = AudioFileIO.read(audioFile);
            AudioHeader header = f.getAudioHeader();
            if (header != null) {
//                int durationInMillis = header.getTrackLength() * 1000; // 毫秒
//                return new Time(durationInMillis);
                return (long) header.getTrackLength();
            }
        } catch (Exception e) {
            // 处理读取异常，例如文件格式不支持等
            System.err.println("Error reading audio file metadata: " + e.getMessage());
        }
        return null;
    }

    /**
     * 处理音乐基本信息
     */
    private MusicFilePreviewDto extractMusicInfo(File audioFile) {
        try {
            AudioFile f = AudioFileIO.read(audioFile);
            Tag tag = f.getTag();
            if (tag != null) {
                MusicFilePreviewDto musicPreviewDto = new MusicFilePreviewDto();
                musicPreviewDto.setMusicName(tag.getFirst(FieldKey.TITLE));
                musicPreviewDto.setMusicArtist(tag.getFirst(FieldKey.ARTIST));
                musicPreviewDto.setMusicAlbum(tag.getFirst(FieldKey.ALBUM));
                musicPreviewDto.setMusicGenre(tag.getFirst(FieldKey.GENRE));
                musicPreviewDto.setMusicYear(tag.getFirst(FieldKey.YEAR));
                return musicPreviewDto;
            }
        } catch (Exception e) {
            // 处理读取异常，例如文件格式不支持等
            System.err.println("Error reading audio file metadata: " + e.getMessage());
        }
        return null;
    }

    /**
     * 辅助方法：将 MultipartFile 转换为 File
     */
    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        // 创建一个带有唯一命名的临时文件
        File convFile = File.createTempFile("temp-", "-" + file.getOriginalFilename());
        try (OutputStream os = new FileOutputStream(convFile)) {
            os.write(file.getBytes());
        }
        return convFile;
    }
}
