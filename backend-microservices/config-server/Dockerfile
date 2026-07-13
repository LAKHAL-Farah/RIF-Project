# ===== Stage 1: Build the jar with Maven =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom first so Docker can cache the downloaded dependencies
# as their own layer -- they only get re-downloaded if pom.xml changes.
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Now copy the source and build the jar (skip tests to keep the image build fast;
# tests should already run in CI before this stage).
COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== Stage 2: Run the jar on a small JRE-only image =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Config Server serves the "configurations/*.yml" files from the classpath
# (spring.cloud.config.server.native.search-locations), so as long as we
# copy the full jar (which bundles src/main/resources), that folder ships too.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8888

# Basic TCP-level healthcheck (no actuator dependency in this service yet).
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD nc -z localhost 8888 || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
