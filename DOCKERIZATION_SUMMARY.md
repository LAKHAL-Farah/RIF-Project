# Dockerization Summary for DakarCitoyen

## 1. Overview

This project was dockerized to run the full microservices stack in a consistent environment using Docker Compose. The stack includes:

- Config Server
- Eureka Server
- MongoDB
- User Service
- Demande Service
- API Gateway
- Frontend

All services communicate over the Docker network using service names such as `config-server`, `eureka-server`, and `mongodb` instead of `localhost`.

---

## 2. Problem that was fixed

The main runtime issue was that the user service was still trying to connect to MongoDB at `localhost:27017` inside the container, which does not work in Docker because `localhost` points to the container itself rather than the MongoDB service.

### Symptoms
- The user service failed during startup or initialization.
- MongoDB logs showed the service was not reachable from the app container.
- The application attempted to connect to `localhost:27017` although the MongoDB container was running.

### Root cause
The issue came from a combination of:
- configuration values not being consistently resolved at runtime,
- a hardcoded runtime startup override in the Docker image entrypoint,
- and the need for container-to-container communication to use Docker service names instead of `localhost`.

---

## 3. What was changed

### A. Docker Compose configuration
The main orchestration file was updated so each service receives the right environment variables:

- [docker-compose.yml](docker-compose.yml)

Relevant changes include:
- Added environment variables for:
  - `CONFIG_HOST`
  - `EUREKA_HOST`
  - `MONGO_HOST`
  - `SPRING_DATA_MONGODB_URI`
  - `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE`
  - `SPRING_APPLICATION_JSON`
- Ensured services depend on the correct containers (`config-server`, `eureka-server`, `mongodb`).
- Kept all services on the same Docker network so they can resolve each other by name.

### B. Config Server shared configuration
The shared config files for the services were updated so the application properties reference the Docker-friendly values:

- [backend-microservices/config-server/src/main/resources/configurations/user-service.yml](backend-microservices/config-server/src/main/resources/configurations/user-service.yml)
- [backend-microservices/config-server/src/main/resources/configurations/demande-service.yml](backend-microservices/config-server/src/main/resources/configurations/demande-service.yml)

These files now use values such as:
- `mongodb://${MONGO_HOST:mongodb}:27017/...`
- `http://${EUREKA_HOST:eureka-server}:8761/eureka/`

### C. Service fallback configuration
To make each service robust even if the config server is temporarily unavailable, local application config was also aligned:

- [backend-microservices/user-microservice/src/main/resources/application.yml](backend-microservices/user-microservice/src/main/resources/application.yml)
- [backend-microservices/demande-microservice/src/main/resources/application.yml](backend-microservices/demande-microservice/src/main/resources/application.yml)

These files now include the same Docker-friendly MongoDB and Eureka settings.

### D. Dockerfiles
The service images were adjusted to avoid forcing stale runtime arguments:

- [backend-microservices/user-microservice/Dockerfile](backend-microservices/user-microservice/Dockerfile)
- [backend-microservices/demande-microservice/Dockerfile](backend-microservices/demande-microservice/Dockerfile)

The key change was removing hardcoded startup arguments that could override the intended environment configuration.

### E. Explicit Mongo client configuration
To ensure Spring Boot uses the resolved property directly, an explicit Mongo client configuration was added:

- [backend-microservices/user-microservice/src/main/java/com/esprit/user/config/MongoClientConfiguration.java](backend-microservices/user-microservice/src/main/java/com/esprit/user/config/MongoClientConfiguration.java)

This bean creates the Mongo client from `spring.data.mongodb.uri`, ensuring the final connection string is controlled by the application configuration and environment variables.

---

## 4. How the problem was solved

The fix followed this approach:

1. Use Docker service names instead of `localhost` for internal communication.
2. Pass the right values through environment variables in Docker Compose.
3. Ensure the Config Server serves the correct values.
4. Remove hardcoded JVM entrypoint overrides that were forcing the old Mongo connection behavior.
5. Explicitly build the Mongo connection from the Spring property so the right URI is always used.

This allowed the app container to connect successfully to the MongoDB container at:

- `mongodb:27017`

instead of:

- `localhost:27017`

---

## 5. How to run the stack

From the project root, run:

```bash
docker compose down -v
docker compose up -d --build
```

To rebuild only the backend services:

```bash
docker compose up -d --build config-server user-service demande-service api-gateway frontend
```

---

## 6. Verification performed

The following checks were used to validate the fix:

- Verified the config server returned the expected values.
- Verified the running container environment contained the correct MongoDB and Eureka variables.
- Verified the user service startup logs showed the Mongo driver connecting to `mongodb:27017`.
- Confirmed the user service started successfully and registered with Eureka.

Example successful evidence from the logs:
- `MongoClientSettings{hosts=[mongodb:27017]}`
- `Monitor thread successfully connected to server with description ...`

---

## 7. Important note for Docker networking

Inside Docker Compose, services must communicate using container names or service names. The following pattern is the correct one:

- MongoDB: `mongodb`
- Eureka: `eureka-server`
- Config Server: `config-server`

Using `localhost` inside a container refers to the container itself, not the other service.

---

## 8. Final result

The Dockerized microservices stack now starts and the user service connects to MongoDB correctly through the Docker network. The application is no longer using the incorrect localhost-based Mongo connection path.
