package com.hanbly.ourmusic_api.Dao.CustomRepostoryImpl;

import com.hanbly.ourmusic_api.Dao.CustomRepositoryInterface.MusicRepositoryCustom;
import com.hanbly.ourmusic_api.pojo.Music;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class MusicDaoImpl implements MusicRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Music> findCandidatesByCriteria(
            String genre, String musicName, String musicArtist,
            String musicAlbum, String musicYear) {

        StringBuilder sql = new StringBuilder("SELECT * FROM tb_music m WHERE 1=1");
        List<Object> parameters = new ArrayList<>();

        // 为每个非空字段，动态添加一个独立的 MATCH ... AGAINST 条件
        addMatchClause(sql, parameters, "m.music_genre", genre);
        addMatchClause(sql, parameters, "m.music_name", musicName);
        addMatchClause(sql, parameters, "m.music_artist", musicArtist);
        addMatchClause(sql, parameters, "m.music_album", musicAlbum);

        // 添加年份精确匹配条件
        if (musicYear != null && !musicYear.trim().isEmpty()) {
            sql.append(" AND m.music_year = ?");
            parameters.add(musicYear.trim());
        }

        if (parameters.isEmpty()) {
            return new ArrayList<>();
        }

        jakarta.persistence.Query nativeQuery = entityManager.createNativeQuery(sql.toString(), Music.class);
        for (int i = 0; i < parameters.size(); i++) {
            nativeQuery.setParameter(i + 1, parameters.get(i));
        }

        return nativeQuery.getResultList();
    }

    // 辅助方法，用于添加单个 MATCH 条件
    private void addMatchClause(StringBuilder sql, List<Object> parameters, String columnName, String value) {
        if (value != null && !value.trim().isEmpty()) {
            // 注意：这里不再使用布尔模式，而是使用自然语言模式
            // 自然语言模式对于单字段匹配更直观，且没有布尔操作符的困扰
            sql.append(" AND MATCH(").append(columnName).append(") AGAINST(? IN NATURAL LANGUAGE MODE)");
            parameters.add(value.trim());
        }
    }
}