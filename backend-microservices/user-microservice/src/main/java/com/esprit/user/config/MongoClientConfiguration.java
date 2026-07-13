package com.esprit.user.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class MongoClientConfiguration {

    @Bean
    public MongoClient mongoClient(Environment environment) {
        String mongoUri = environment.getRequiredProperty("spring.data.mongodb.uri");
        return MongoClients.create(mongoUri);
    }
}
