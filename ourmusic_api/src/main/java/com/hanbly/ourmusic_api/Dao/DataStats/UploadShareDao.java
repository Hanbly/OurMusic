package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.UploadShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadShareDao extends JpaRepository<UploadShare, Integer>, JpaSpecificationExecutor<UploadShare> {

    Integer countAllByUploadShareOwnerTypeAndUploadShareOwnerId(UploadShare.OwnerType uploadShareOwnerType, Integer uploadShareOwnerId);

    Integer countAllByUploadShareOwnerTypeAndUploadSharedByUser_UserId(UploadShare.OwnerType uploadShareOwnerType, Integer uploadSharedByUserId);

    UploadShare findByUploadShareOwnerTypeAndUploadShareOwnerId(UploadShare.OwnerType uploadShareOwnerType, Integer uploadShareOwnerId);

}
