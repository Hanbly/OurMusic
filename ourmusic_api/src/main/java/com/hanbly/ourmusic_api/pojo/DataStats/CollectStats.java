package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_collectStats", indexes = {
        @Index(name = "idx_owner", columnList = "collectStats_owner_type, collectStats_owner_id"),
        @Index(name = "idx_user", columnList = "collectStats_did_user_id")
})
public class CollectStats {
    public enum OwnerType { MUSIC, COLLECTION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collectStats_id")
    private Integer collectStatsId;

    @Enumerated(EnumType.STRING)
    @Column(name = "collectStats_owner_type")
    private OwnerType collectStatsOwnerType;

    @Column(name = "collectStats_owner_id")
    private Integer collectStatsOwnerId;

    @ManyToOne // 关联用户
    @JoinColumn(name = "collectStats_did_user_id")
    private User collectStatsdByUser;

    @ManyToOne // 关联歌单
    @JoinColumn(name = "collectStats_to_collection_id")
    private MusicCollection collectStatsToCollection;

    @Column(name = "collectStats_timestamp")
    private Instant collectStatsTimestamp;

    public CollectStats() {
    }

    public CollectStats(OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, User collectStatsdByUser, MusicCollection collectStatsToCollection) {
        this.collectStatsOwnerType = collectStatsOwnerType;
        this.collectStatsOwnerId = collectStatsOwnerId;
        this.collectStatsdByUser = collectStatsdByUser;
        this.collectStatsToCollection = collectStatsToCollection;
        this.collectStatsTimestamp = Instant.now();
    }

    public Integer getCollectStatsId() {
        return collectStatsId;
    }

    public void setCollectStatsId(Integer collectStatsId) {
        this.collectStatsId = collectStatsId;
    }

    public OwnerType getCollectStatsOwnerType() {
        return collectStatsOwnerType;
    }

    public void setCollectStatsOwnerType(OwnerType collectStatsOwnerType) {
        this.collectStatsOwnerType = collectStatsOwnerType;
    }

    public Integer getCollectStatsOwnerId() {
        return collectStatsOwnerId;
    }

    public void setCollectStatsOwnerId(Integer collectStatsOwnerId) {
        this.collectStatsOwnerId = collectStatsOwnerId;
    }

    public User getCollectStatsdByUser() {
        return collectStatsdByUser;
    }

    public void setCollectStatsdByUser(User collectStatsdByUser) {
        this.collectStatsdByUser = collectStatsdByUser;
    }

    public MusicCollection getCollectStatsToCollection() {
        return collectStatsToCollection;
    }

    public void setCollectStatsToCollection(MusicCollection collectStatsToCollection) {
        this.collectStatsToCollection = collectStatsToCollection;
    }

    public Instant getCollectStatsTimestamp() {
        return collectStatsTimestamp;
    }

    public void setCollectStatsTimestamp(Instant collectStatsTimestamp) {
        this.collectStatsTimestamp = collectStatsTimestamp;
    }
}