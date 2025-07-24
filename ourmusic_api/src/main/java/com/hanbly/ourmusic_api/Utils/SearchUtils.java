package com.hanbly.ourmusic_api.Utils;

import com.hanbly.ourmusic_api.pojo.dto.SearchMsgDto;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import me.xdrop.fuzzywuzzy.model.BoundExtractedResult;
import me.xdrop.fuzzywuzzy.model.ExtractedResult;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SearchUtils {

    public static List<String> handleSearchRoot(String root, List<SearchMsgDto> searchMsgDtoList){
        List<BoundExtractedResult<SearchMsgDto>> resultDtoList = FuzzySearch.extractSorted(root, searchMsgDtoList, SearchMsgDto::getSearchContent,70);
        List<SearchMsgDto> searchResultList = resultDtoList.stream().map(BoundExtractedResult::getReferent).toList();
        return searchResultList.stream().map(SearchMsgDto::getSearchContent).collect(Collectors.toList());
    }

    private String normalizeString(String s) {
        if (s == null) {
            return "";
        }
        // 转为小写
        s = s.toLowerCase();
        // 移除所有非字母数字的字符
        s = s.replaceAll("[^a-z0-9]", "");
        return s;
    }
}
