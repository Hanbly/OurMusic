package com.hanbly.ourmusic_api.pojo.RBAC;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.hanbly.ourmusic_api.pojo.CustomFile;
import com.hanbly.ourmusic_api.pojo.Music;
import com.hanbly.ourmusic_api.pojo.MusicCollection;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import org.hibernate.validator.constraints.Length;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set; // 引入 Set

@Table(name="tb_user")
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name", unique = true, nullable = false)
    private String userName;

    @Column(name = "user_nick_name")
    private String userNickName;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_avatar_file_id")
    private CustomFile userAvatarFile;

    @Column(name = "password")
    private String password;

    @Email(message = "邮箱格式错误")
    @Length(max = 255, message = "邮箱长度不能超过255个字符")
    @Column(name = "email", length = 255, unique = true, nullable = false)
    private String email;

    @Column(name = "user_description")
    private String userDescription;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Music> musics = new HashSet<>();

    // 表示用户拥有的歌单集合
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MusicCollection> collections = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "user_collection-mark_link", // 中间表的名字
            joinColumns = @JoinColumn(name = "user_id"), // 中间表中指向自己的外键
            inverseJoinColumns = @JoinColumn(name = "collection_id") // 中间表中指向对方的外键
    )
    @JsonManagedReference
    private List<MusicCollection> markedCollections;

    /**
     * User与Role的多对多关系。
     * 一个用户可以拥有多个角色。
     */
    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "tb_user_role", // 定义中间关联表的名称
            joinColumns = @JoinColumn(name = "user_id"), // 定义本类（User）在中间表的外键列
            inverseJoinColumns = @JoinColumn(name = "role_id") // 定义关联另一方（Role）在中间表的外键列
    )
    private Collection<Role> roles;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserNickName() {
        return userNickName;
    }

    public void setUserNickName(String userNickName) {
        this.userNickName = userNickName;
    }

    public CustomFile getUserAvatarFile() {
        return userAvatarFile;
    }

    public void setUserAvatarFile(CustomFile userAvatarFile) {
        this.userAvatarFile = userAvatarFile;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserDescription() {
        return userDescription;
    }

    public void setUserDescription(String userDescription) {
        this.userDescription = userDescription;
    }

//    public Integer getUserSharedCount() {
//        return userSharedCount;
//    }
//
//    public void setUserSharedCount(Integer userSharedCount) {
//        this.userSharedCount = userSharedCount;
//    }
//
//    public Integer getUserLikedCount() {
//        return userLikedCount;
//    }
//
//    public void setUserLikedCount(Integer userLikedCount) {
//        this.userLikedCount = userLikedCount;
//    }
//
//    public Integer getUserCollectedCount() {
//        return userCollectedCount;
//    }
//
//    public void setUserCollectedCount(Integer userCollectedCount) {
//        this.userCollectedCount = userCollectedCount;
//    }

    public Set<Music> getMusics() {
        return musics;
    }

    public void setMusics(Set<Music> musics) {
        this.musics = musics;
    }

    public Set<MusicCollection> getCollections() {
        return collections;
    }

    public void setCollections(Set<MusicCollection> collections) {
        this.collections = collections;
    }

    public List<MusicCollection> getMarkedCollections() {
        return markedCollections;
    }

    public void setMarkedCollections(List<MusicCollection> markedCollections) {
        this.markedCollections = markedCollections;
    }

    public Collection<Role> getRoles() {
        return roles;
    }

    public void setRoles(Collection<Role> roles) {
        this.roles = roles;
    }
}