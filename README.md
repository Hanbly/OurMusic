- # OurMusic - 音乐分享试听系统

  OurMusic 是一个功能丰富的全栈音乐分享与试听Web应用。它允许用户注册、登录、上传自己的音乐、创建和管理歌单、评论互动，以及发现和收听他人分享的音乐。

  ##  核心功能

  - **用户与认证模块**:
    - 支持用户注册、登录和登出功能。
    - 基于 JWT (JSON Web Token) 的无状态认证机制，支持Token刷新。
    - 支持通过邮箱验证码进行密码重置。
    - 用户可以编辑个人资料，包括昵称、简介和头像。
  - **音乐管理模块**:
    - 用户可以上传音乐文件（如MP3, FLAC, WAV）。
    - 系统自动解析音乐文件的元数据（歌手、专辑、年份等）。
    - 支持单曲和批量上传音乐。
    - 提供音乐的增、删、改、查功能。
    - 设有“本周热门”榜单，动态展示热门音乐。
  - **歌单（音乐收藏）模块**:
    - 用户可以创建公开或私有的歌单。
    - 支持将音乐添加或移出歌单。
    - 每个用户拥有一个默认的“我喜欢的音乐”歌单和一个“历史记录”歌单。
    - 用户可以收藏（标记）他人的歌单。
  - **互动与社交模块**:
    - 支持对音乐、歌单进行评论。
    - 支持点赞/点踩功能。
    - 记录用户的听歌历史。
  - **文件存储模块**:
    - 集成 MinIO 对象存储服务，用于存放音乐文件和图片（如头像、歌单封面）。
    - 实现了文件的上传、下载和预览功能。
  - **搜索与发现**:
    - 支持根据音乐名、歌手、专辑等多种维度进行模糊搜索。
    - 支持按音乐流派发现音乐和歌单。

  ##  技术栈

  本项目采用前后端分离的架构。

  ### **后端 (ourmusic_api)**

  

  

  

  

  

  

  

  

  

  

  | 技术         | 描述                                   |
  | ------------ | -------------------------------------- |
  | **核心框架** | Spring Boot                            |
  | **认证授权** | Spring Security + JWT (JSON Web Token) |
  | **数据库**   | MySQL                                  |
  | **ORM**      | Spring Data JPA / Hibernate            |
  | **缓存**     | Redis                                  |
  | **对象存储** | MinIO                                  |
  | **构建工具** | Maven                                  |
  | **其他**     | Lombok, Java Mail (邮件服务)           |

  ### **前端 (ourmusic_front)**

  

  

  

  

  

  

  

  

  | 技术           | 描述                             |
  | -------------- | -------------------------------- |
  | **核心框架**   | React                            |
  | **路由**       | React Router                     |
  | **HTTP客户端** | Axios                            |
  | **状态管理**   | React Context API                |
  | **UI & 样式**  | 原生 CSS, React Icons            |
  | **构建/打包**  | Create React App (react-scripts) |

  ##  项目结构

  Generated code

  ```
        ourmusic_project/
  ├── ourmusic_api/         # 后端 Spring Boot 项目
  │   ├── src/main/java/    # Java 源代码
  │   │   ├── Controller    # 控制器层
  │   │   ├── Dao           # 数据访问层
  │   │   ├── Service       # 业务逻辑层
  │   │   ├── pojo          # 数据实体与DTO
  │   │   ├── config        # 配置类
  │   │   ├── Security      # Spring Security 相关配置
  │   │   └── Utils         # 工具类
  │   ├── src/main/resources/
  │   │   └── application.yml # 核心配置文件
  │   └── pom.xml           # Maven 配置文件
  ├── ourmusic_front/       # 前端 React 项目
  │   ├── public/           # 公共资源 (index.html, manifest.json)
  │   ├── src/              # React 源代码
  │   │   ├── api-config.js # Axios 配置文件
  │   │   ├── context/      # React Context
  │   │   ├── components/   # 可复用组件
  │   │   ├── pages/        # 页面级组件
  │   │   └── App.js        # 应用主入口与路由配置
  │   └── package.json      # npm 配置文件
  └── README.md             # 项目说明文件
      
  ```

  

  ##  环境准备与部署指南

  ### **环境要求**

  - Java 17+
  - Maven 3.6+
  - Node.js 16+ & npm
  - MySQL 8.0+
  - Redis
  - MinIO

  ### **后端部署 (ourmusic_api)**

  1. **克隆项目**:

     Generated bash

     ```
           git clone https://github.com/Hanbly/OurMusic.git
         
     ```

  2. **配置数据库**:

     - 在您的MySQL中创建一个名为 our_music_db 的数据库。
     - Spring Boot 会根据实体类自动创建数据表 (ddl-auto: update)。

  3. **配置 application.yml**:

     - 导航到 ourmusic_api/src/main/resources/。
     - 打开 application.yml 文件，根据您的本地环境修改以下配置：
       - **MySQL**: spring.datasource.username 和 spring.datasource.password。
       - **Redis**: spring.data.redis.host 和 spring.data.redis.port。
       - **MinIO**: minio.endpoint, minio.access-key, minio.secret-key, minio.bucket-name。
       - **邮箱服务**: spring.mail.username 和 spring.mail.password (用于注册验证和密码重置)。

  4. **启动后端服务**:

     - 在 ourmusic_api 目录下，运行以下命令：

     Generated bash

     ```
           mvn spring-boot:run
         
     ```
     - 服务默认将在 http://localhost:8080 启动。

  ### **前端部署 (ourmusic_front)**

  1. **进入前端目录**:

     Generated bash

     ```
           cd ourmusic_front
         
     ```

  2. **安装依赖**:

     Generated bash

     ```
           npm install
         
     ```

  3. **配置API代理**:

     - package.json 文件中已配置 "proxy": "http://localhost:8080"，它会将前端的API请求代理到后端服务，以解决跨域问题。请确保后端服务地址与此匹配。
     - 同时，src/api-config.js 和 src/api-config-download.js 中也定义了API基础URL，如有需要也可以在此修改。

  4. **启动前端开发服务器**:

     Generated bash

     ```
           npm start
         
     ```

     - 应用默认将在 http://localhost:3000 打开。