FROM eclipse-temurin:17-jre

WORKDIR /backend
COPY build/libs/*.jar app.jar

ENV TZ=Asia/Seoul
EXPOSE 8080

RUN mkdir -p /backend/tokens && chmod 700 /backend/tokens

ENTRYPOINT ["java","-jar","app.jar"]