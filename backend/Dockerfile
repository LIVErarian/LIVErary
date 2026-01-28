FROM eclipse-temurin:17-jre

WORKDIR /backend
COPY build/libs/*.jar app.jar

ENV TZ=Asia/Seoul
EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]