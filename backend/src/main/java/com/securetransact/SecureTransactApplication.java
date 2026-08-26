package com.securetransact;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SecureTransactApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureTransactApplication.class, args);
    }
}
