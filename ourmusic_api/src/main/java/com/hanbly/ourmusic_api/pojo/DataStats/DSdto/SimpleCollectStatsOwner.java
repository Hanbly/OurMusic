package com.hanbly.ourmusic_api.pojo.DataStats.DSdto;

import com.hanbly.ourmusic_api.pojo.DataStats.CollectStats;

public class SimpleCollectStatsOwner {
    private CollectStats.OwnerType collectStatsOwnerType;
    private Integer collectStatsOwnerId;

    public SimpleCollectStatsOwner() {
    }

    public CollectStats.OwnerType getCollectStatsOwnerType() {
        return collectStatsOwnerType;
    }

    public void setCollectStatsOwnerType(CollectStats.OwnerType collectStatsOwnerType) {
        this.collectStatsOwnerType = collectStatsOwnerType;
    }

    public Integer getCollectStatsOwnerId() {
        return collectStatsOwnerId;
    }

    public void setCollectStatsOwnerId(Integer collectStatsOwnerId) {
        this.collectStatsOwnerId = collectStatsOwnerId;
    }
}
