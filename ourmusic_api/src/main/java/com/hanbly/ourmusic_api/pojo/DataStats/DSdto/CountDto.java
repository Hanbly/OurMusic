package com.hanbly.ourmusic_api.pojo.DataStats.DSdto;

public class CountDto {
    private Integer Id;
    private Long count;

    public CountDto(Integer Id, Long count) {
        this.Id = Id;
        this.count = count;
    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer id) {
        Id = id;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}