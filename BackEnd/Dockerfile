# -------- STAGE 1: Build the application --------
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# -------- STAGE 2: Runtime image (JRE-only Alpine, ~100 MB vs JDK ~400 MB) --------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# JVM flags tuned for Render free tier (512 MB hard limit):
#   -Xmx256m        — hard heap cap, leaves ~256 MB for OS + non-heap
#   -Xms64m         — start small, grow as needed
#   -XX:+UseSerialGC — lower GC footprint on single-CPU free tier
#   -XX:TieredStopAtLevel=1 — faster startup, less JIT RAM at startup
#   -XX:+UseStringDeduplication — reduce duplicate string RAM usage
ENV JAVA_OPTS="-Xmx256m -Xms64m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom"

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
