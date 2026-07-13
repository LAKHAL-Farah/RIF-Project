# ===== Stage 1: Build the jar with Maven =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== Stage 2: Run the jar on a small JRE-only image =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD nc -z localhost 8081 || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
