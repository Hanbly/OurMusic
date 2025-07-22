package com.hanbly.ourmusic_api.pojo;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_costum_file")
public class CustomFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "custom_file_id")
    private Integer customFileId;

    @Column(name = "custom_file_ori_name")
    private String customFileOriName;

    @Column(name = "custom_file_stored_name")
    private String customFileStoredName;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_relative_path")
    private String fileRelativePath;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @ManyToOne
    private User uploader;           // 上传者

    @Column(name = "file_upload_time")
    private Instant uploadTimestamp; // 上退时间


    @Enumerated(EnumType.STRING)
    private FileStatus fileStatus;

    public enum FileStatus {
        LOADING, // 待处理，刚上传但未被任何业务对象关联
        ACTIVE,   // 已激活，已被业务对象（如Song）关联
        INACTIVE  // 已停用
    }

    public CustomFile() {
    }

    public Integer getCustomFileId() {
        return customFileId;
    }

    public void setCustomFileId(Integer customFileId) {
        this.customFileId = customFileId;
    }

    public String getCustomFileOriName() {
        return customFileOriName;
    }

    public void setCustomFileOriName(String customFileOriName) {
        this.customFileOriName = customFileOriName;
    }

    public String getCustomFileStoredName() {
        return customFileStoredName;
    }

    public void setCustomFileStoredName(String customFileStoredName) {
        this.customFileStoredName = customFileStoredName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileRelativePath() {
        return fileRelativePath;
    }

    public void setFileRelativePath(String fileRelativePath) {
        this.fileRelativePath = fileRelativePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public User getUploader() {
        return uploader;
    }

    public void setUploader(User uploader) {
        this.uploader = uploader;
    }

    public Instant getUploadTimestamp() {
        return uploadTimestamp;
    }

    public void setUploadTimestamp(Instant uploadTimestamp) {
        this.uploadTimestamp = uploadTimestamp;
    }

    public FileStatus getFileStatus() {
        return fileStatus;
    }

    public void setFileStatus(FileStatus fileStatus) {
        this.fileStatus = fileStatus;
    }
}
