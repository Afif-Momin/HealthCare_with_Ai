# -------- STAGE 1: Build the application --------
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first (better cache)
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# -------- STAGE 2: Runtime image --------
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

ENV JAVA_OPTS=""

# Copy built jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
