package com.incidentiq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IncidentiqApplication {

    public static void main(String[] args) {
        SpringApplication.run(IncidentiqApplication.class, args);
    }
}
