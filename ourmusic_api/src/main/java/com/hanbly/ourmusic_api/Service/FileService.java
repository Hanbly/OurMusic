package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.dto.FileUploadResponseDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicFilePreviewDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileService {
    FileUploadResponseDto upload(MultipartFile file) throws IOException;

    MusicFilePreviewDto previewMusicFile(MultipartFile file) throws IOException;

    ResponseEntity<Resource> downloadFile(String filename, Integer musicId, Integer userId, HttpServletResponse response, HttpServletRequest request);
}
