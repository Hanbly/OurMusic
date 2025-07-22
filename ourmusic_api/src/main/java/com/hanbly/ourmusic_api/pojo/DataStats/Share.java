package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_share", indexes = {
        @Index(name = "idx_owner", columnList = "share_owner_type, share_owner_id"),
        @Index(name = "idx_user", columnList = "share_did_user_id")
})
public class Share {
    public enum OwnerType { MUSIC, COLLECTION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "share_id")
    private Integer shareId;

    @Enumerated(EnumType.STRING)
    @Column(name = "share_owner_type")
    private OwnerType shareOwnerType;

    @Column(name = "share_owner_id")
    private Integer shareOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "share_did_user_id")
    private User sharedByUser;

    @Column(name = "share_timestamp")
    private Instant shareTimestamp;

    public Share() {
    }

    public Share(OwnerType shareOwnerType, Integer shareOwnerId, User sharedByUser) {
        this.shareOwnerType = shareOwnerType;
        this.shareOwnerId = shareOwnerId;
        this.sharedByUser = sharedByUser;
        this.shareTimestamp = Instant.now();
    }

    public Integer getShareId() {
        return shareId;
    }

    public void setShareId(Integer shareId) {
        this.shareId = shareId;
    }

    public OwnerType getShareOwnerType() {
        return shareOwnerType;
    }

    public void setShareOwnerType(OwnerType shareOwnerType) {
        this.shareOwnerType = shareOwnerType;
    }

    public Integer getShareOwnerId() {
        return shareOwnerId;
    }

    public void setShareOwnerId(Integer shareOwnerId) {
        this.shareOwnerId = shareOwnerId;
    }

    public User getSharedByUser() {
        return sharedByUser;
    }

    public void setSharedByUser(User sharedByUser) {
        this.sharedByUser = sharedByUser;
    }

    public Instant getShareTimestamp() {
        return shareTimestamp;
    }

    public void setShareTimestamp(Instant shareTimestamp) {
        this.shareTimestamp = shareTimestamp;
    }
}