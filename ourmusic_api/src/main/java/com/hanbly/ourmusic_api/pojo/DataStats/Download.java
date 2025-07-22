package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_download", indexes = {
        @Index(name = "idx_owner", columnList = "download_owner_type, download_owner_id"),
        @Index(name = "idx_user", columnList = "download_did_user_id")
})
public class Download {
    public enum OwnerType { MUSIC, COLLECTION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "download_id")
    private Integer downloadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "download_owner_type")
    private OwnerType downloadOwnerType;

    @Column(name = "download_owner_id")
    private Integer downloadOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "download_did_user_id")
    private User downloaddByUser;

    @Column(name = "download_timestamp")
    private Instant downloadTimestamp;

    public Download() {
    }

    public Download(OwnerType downloadOwnerType, Integer downloadOwnerId, User downloaddByUser) {
        this.downloadOwnerType = downloadOwnerType;
        this.downloadOwnerId = downloadOwnerId;
        this.downloaddByUser = downloaddByUser;
        this.downloadTimestamp = Instant.now();
    }

    public Integer getDownloadId() {
        return downloadId;
    }

    public void setDownloadId(Integer downloadId) {
        this.downloadId = downloadId;
    }

    public OwnerType getDownloadOwnerType() {
        return downloadOwnerType;
    }

    public void setDownloadOwnerType(OwnerType downloadOwnerType) {
        this.downloadOwnerType = downloadOwnerType;
    }

    public Integer getDownloadOwnerId() {
        return downloadOwnerId;
    }

    public void setDownloadOwnerId(Integer downloadOwnerId) {
        this.downloadOwnerId = downloadOwnerId;
    }

    public User getDownloaddByUser() {
        return downloaddByUser;
    }

    public void setDownloaddByUser(User downloaddByUser) {
        this.downloaddByUser = downloaddByUser;
    }

    public Instant getDownloadTimestamp() {
        return downloadTimestamp;
    }

    public void setDownloadTimestamp(Instant downloadTimestamp) {
        this.downloadTimestamp = downloadTimestamp;
    }
}