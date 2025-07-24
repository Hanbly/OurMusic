package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.SearchService;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.SearchMsgDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PreAuthorize("hasRole('admin') or hasRole('user')")
    @GetMapping("/by-a-root/{root}")        // URL: localhost:8080/api/search/by-a-root/{root} method:GET
    public ResponseMessage<List<String>> getSearchMsgByaRoot(@PathVariable String root) {
        List<String> result = searchService.getSearchMsgByaRoot(root);
        return ResponseMessage.success(result);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #userId")
    @GetMapping("/{userId}/s-history")        // URL: localhost:8080/api/search/{userId}/s-history method:GET
    public ResponseMessage<List<String>> getSearchMsgHistoryByUserId(@PathVariable Integer userId) {
        List<String> result = searchService.getSearchMsgHistoryByUserId(userId);
        return ResponseMessage.success(result);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #userId")
    @PutMapping("/{userId}/d-history")        // URL: localhost:8080/api/search/{userId}/d-history method:PUT
    public ResponseMessage<String> negativeSearchMsgHistoryByUserId(@PathVariable Integer userId) {
        String result = searchService.negativeSearchMsgHistoryByUserId(userId);
        return ResponseMessage.success(result, null);
    }
}
