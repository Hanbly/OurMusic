package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_play", indexes = {
        @Index(name = "idx_owner", columnList = "play_owner_type, play_owner_id"),
        @Index(name = "idx_user", columnList = "play_did_user_id")
})
public class Play {
    public enum OwnerType { MUSIC, COLLECTION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "play_id")
    private Integer playId;

    @Enumerated(EnumType.STRING)
    @Column(name = "play_owner_type")
    private OwnerType playOwnerType;

    @Column(name = "play_owner_id")
    private Integer playOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "play_did_user_id")
    private User playedByUser;

    @Column(name = "play_timestamp")
    private Instant playTimestamp;

    public Play() {
    }

    public Play(OwnerType playOwnerType, Integer playOwnerId, User playedByUser) {
        this.playOwnerType = playOwnerType;
        this.playOwnerId = playOwnerId;
        this.playedByUser = playedByUser;
        this.playTimestamp = Instant.now();
    }

    public Integer getPlayId() {
        return playId;
    }

    public void setPlayId(Integer playId) {
        this.playId = playId;
    }

    public OwnerType getPlayOwnerType() {
        return playOwnerType;
    }

    public void setPlayOwnerType(OwnerType playOwnerType) {
        this.playOwnerType = playOwnerType;
    }

    public Integer getPlayOwnerId() {
        return playOwnerId;
    }

    public void setPlayOwnerId(Integer playOwnerId) {
        this.playOwnerId = playOwnerId;
    }

    public User getPlayedByUser() {
        return playedByUser;
    }

    public void setPlayedByUser(User playdByUser) {
        this.playedByUser = playdByUser;
    }

    public Instant getPlayTimestamp() {
        return playTimestamp;
    }

    public void setPlayTimestamp(Instant playTimestamp) {
        this.playTimestamp = playTimestamp;
    }
}