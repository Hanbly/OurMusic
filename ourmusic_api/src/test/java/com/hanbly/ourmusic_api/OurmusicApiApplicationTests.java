package com.hanbly.ourmusic_api;

import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class OurmusicApiApplicationTests {

    @Resource
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
        String passwordEncode = passwordEncoder.encode("123123");
        System.out.println("passwordEncode: " + passwordEncode);
    }

}
