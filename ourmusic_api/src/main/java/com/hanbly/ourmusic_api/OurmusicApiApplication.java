package com.hanbly.ourmusic_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class OurmusicApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(OurmusicApiApplication.class, args);
    }

}
