package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.FileService;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.FileUploadResponseDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicFilePreviewDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    private final FileService fileService;
//    private final Path fileStorageLocation; // 文件存储的根路径

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
//        this.fileStorageLocation = Paths.get("./uploads").toAbsolutePath().normalize();
    }

    @PreAuthorize(value = "hasRole('admin') or hasRole('user')")
    @PostMapping("/upload")      // URL: localhost:8080/api/files/upload  method:POST
    public ResponseMessage<FileUploadResponseDto> upload(@RequestParam("file") MultipartFile file) throws IOException {
        FileUploadResponseDto fileUploadResponseDto = fileService.upload(file);
        return ResponseMessage.success(fileUploadResponseDto);
    }

    @PreAuthorize(value = "hasRole('admin') or hasRole('user')")
    @PostMapping(value = "/preview")
    public ResponseMessage<MusicFilePreviewDto> previewMusicFile(@RequestParam("file") MultipartFile file) throws IOException {
        MusicFilePreviewDto filePreviewDto = fileService.previewMusicFile(file);
        return ResponseMessage.success(filePreviewDto);
    }

    /**
     * 文件下载接口
     * @return 文件流
     */
    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @GetMapping("/download/{filename:.+}")      // URL: localhost:8080/api/files/download/{filename.extension}  method:GET
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename,
                                                 @RequestParam Integer musicId,
                                                 @RequestParam Integer userId,
                                                 HttpServletResponse response, HttpServletRequest request) {
        return fileService.downloadFile(filename, musicId, userId, response, request);
    }

}
