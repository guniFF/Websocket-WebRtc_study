package com.test.test.controller;

import io.openvidu.java.client.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OpenViduController {

    private final OpenVidu openVidu;

    @Autowired
    public OpenViduController(OpenVidu openVidu) {
        this.openVidu = openVidu;
    }

    @PostMapping("/sessions")
    public Map<String, String> initializeSession() throws OpenViduJavaClientException, OpenViduHttpException {
        SessionProperties properties = new SessionProperties.Builder().build();
        Session session = openVidu.createSession(properties);

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        return response;
    }

    @PostMapping("/sessions/{sessionId}/connections")
    public Map<String, String> createConnection(@PathVariable String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openVidu.getActiveSessions().stream()
                .filter(s -> s.getSessionId().equals(sessionId))
                .findFirst()
                .orElse(null);

        if (session == null) {
            throw new RuntimeException("Session not found: " + sessionId);
        }

        ConnectionProperties properties = new ConnectionProperties.Builder().type(ConnectionType.WEBRTC).build();
        Connection connection = session.createConnection(properties);

        Map<String, String> response = new HashMap<>();
        response.put("token", connection.getToken());
        return response;
    }
}
