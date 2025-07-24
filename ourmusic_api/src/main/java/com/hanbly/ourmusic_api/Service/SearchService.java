package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.dto.SearchMsgDto;

import java.util.List;

public interface SearchService {


    String addSearchMsg(SearchMsgDto searchMsgDto);

    List<String> getSearchMsgByaRoot(String root);
}
