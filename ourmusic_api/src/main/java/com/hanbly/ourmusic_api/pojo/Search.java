package com.hanbly.ourmusic_api.pojo;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Table(name = "tb_search")
@Entity
public class Search {
    public enum SearchType {
        POSITIVE, NEGATIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "search_id")
    private Integer searchId;

    @Column(name = "search_content")
    private String searchContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "search_type")
    private SearchType searchType;

    @Column(name = "search_timestamp")
    private Instant searchTimestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    public Search() {
        this.searchTimestamp = Instant.now();
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

    public SearchType getSearchType() {
        return searchType;
    }

    public void setSearchType(SearchType searchType) {
        this.searchType = searchType;
    }

    public Instant getSearchTimestamp() {
        return searchTimestamp;
    }

    public void setSearchTimestamp(Instant searchTimestamp) {
        this.searchTimestamp = searchTimestamp;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
