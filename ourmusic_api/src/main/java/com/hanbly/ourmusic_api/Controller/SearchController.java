package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.SearchService;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.SearchMsgDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #searchMsgDto.userId")
    @PostMapping        // URL: localhost:8080/api/search method:POST
    public ResponseMessage<String> addSearchMsg(@RequestBody SearchMsgDto searchMsgDto) {
        String result = searchService.addSearchMsg(searchMsgDto);
        return ResponseMessage.success(result, null);
    }

}
