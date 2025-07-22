package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.SearchDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Service.SearchService;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.Search;
import com.hanbly.ourmusic_api.pojo.dto.SearchMsgDto;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class SearchServiceImpl implements SearchService {
    private final UserDao userDao;
    private final SearchDao searchDao;

    public SearchServiceImpl(UserDao userDao, SearchDao searchDao) {
        this.userDao = userDao;
        this.searchDao = searchDao;
    }

    @Override
    public String addSearchMsg(SearchMsgDto searchMsgDto) {
        if(searchMsgDto.getUserId() == null){
            throw new IllegalArgumentException("参数错误，请检查！");
        }
        User user = userDao.findById(searchMsgDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("无法查询用户"));
        try{
            Search search = new Search();
            BeanUtils.copyProperties(searchMsgDto, search, "searchId", "searchType", "searchTimestamp"); // 不能接收id，识别到id后save会进行修改
            if(searchMsgDto.getSearchType().equals(Search.SearchType.POSITIVE) || searchMsgDto.getSearchType().equals(Search.SearchType.NEGATIVE)){
                search.setSearchType(searchMsgDto.getSearchType());
            } else { throw new IllegalArgumentException("参数错误，请检查！"); }
            search.setUser(user);
            searchDao.save(search);
        }catch(IllegalArgumentException e){
            throw e;
        }catch(Exception e){
            throw new RuntimeException("无法添加搜索数据");
        }

        return "添加搜索数据成功";
    }
}
