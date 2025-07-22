package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.Search;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class SearchMsgDto {

    private Integer searchId;

    private String searchContent;

    @NotBlank
    private Search.SearchType searchType;

    private Instant searchTimestamp;

    @NotNull
    private Integer userId;

    public SearchMsgDto() {
    }

    public Integer getSearchId() {
        return searchId;
    }

    public void setSearchId(Integer searchId) {
        this.searchId = searchId;
    }

    public String getSearchContent() {
        return searchContent;
    }

    public void setSearchContent(String searchContent) {
        this.searchContent = searchContent;
    }

    public @NotBlank Search.SearchType getSearchType() {
        return searchType;
    }

    public void setSearchType(@NotBlank Search.SearchType searchType) {
        this.searchType = searchType;
    }

    public Instant getSearchTimestamp() {
        return searchTimestamp;
    }

    public void setSearchTimestamp(Instant searchTimestamp) {
        this.searchTimestamp = searchTimestamp;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
