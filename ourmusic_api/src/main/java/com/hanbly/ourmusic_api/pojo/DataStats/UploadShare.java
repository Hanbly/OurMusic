package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_uploadShare", indexes = {
        @Index(name = "idx_owner", columnList = "uploadShare_owner_type, uploadShare_owner_id"),
        @Index(name = "idx_user", columnList = "uploadShare_did_user_id")
})
public class UploadShare {
    public enum OwnerType { MUSIC }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uploadShare_id")
    private Integer uploadShareId;

    @Enumerated(EnumType.STRING)
    @Column(name = "uploadShare_owner_type")
    private OwnerType uploadShareOwnerType;

    @Column(name = "uploadShare_owner_id")
    private Integer uploadShareOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "uploadShare_did_user_id")
    private User uploadSharedByUser;

    @Column(name = "uploadShare_timestamp")
    private Instant uploadShareTimestamp;

    public UploadShare() {
    }

    public UploadShare(OwnerType uploadShareOwnerType, Integer uploadShareOwnerId, User uploadSharedByUser) {
        this.uploadShareOwnerType = uploadShareOwnerType;
        this.uploadShareOwnerId = uploadShareOwnerId;
        this.uploadSharedByUser = uploadSharedByUser;
        this.uploadShareTimestamp = Instant.now();
    }

    public Integer getUploadShareId() {
        return uploadShareId;
    }

    public void setUploadShareId(Integer uploadShareId) {
        this.uploadShareId = uploadShareId;
    }

    public OwnerType getUploadShareOwnerType() {
        return uploadShareOwnerType;
    }

    public void setUploadShareOwnerType(OwnerType uploadShareOwnerType) {
        this.uploadShareOwnerType = uploadShareOwnerType;
    }

    public Integer getUploadShareOwnerId() {
        return uploadShareOwnerId;
    }

    public void setUploadShareOwnerId(Integer uploadShareOwnerId) {
        this.uploadShareOwnerId = uploadShareOwnerId;
    }

    public User getUploadSharedByUser() {
        return uploadSharedByUser;
    }

    public void setUploadSharedByUser(User uploadSharedByUser) {
        this.uploadSharedByUser = uploadSharedByUser;
    }

    public Instant getUploadShareTimestamp() {
        return uploadShareTimestamp;
    }

    public void setUploadShareTimestamp(Instant uploadShareTimestamp) {
        this.uploadShareTimestamp = uploadShareTimestamp;
    }
}