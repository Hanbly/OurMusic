package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.CustomFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FileDao extends JpaRepository<CustomFile, Integer>, JpaSpecificationExecutor<CustomFile> {
}
