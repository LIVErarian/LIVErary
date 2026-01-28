package com.liverary.backend.auth.util;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Collections;
import java.util.List;

@Component
public class GmailUtil {

    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private static final List<String> SCOPES = Collections.singletonList(GmailScopes.GMAIL_SEND);
    @Value("${spring.gmail.client-id}")
    private String clientId;
    @Value("${spring.gmail.secret-key}")
    private String clientSecret;
    private Gmail gmailService;

    public synchronized Gmail getGmailService() throws Exception {
        // 이미 생성된 객체가 있다면 즉시 반환
        if (gmailService != null) {
            return gmailService;
        }

        final var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        final var jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets secrets = new GoogleClientSecrets();
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        secrets.setInstalled(details);

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, jsonFactory, secrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8000).build();
        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");

        // 생성된 객체를 필드에 할당
        gmailService = new Gmail.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName("LIVErary")
                .build();

        return gmailService;
    }
}