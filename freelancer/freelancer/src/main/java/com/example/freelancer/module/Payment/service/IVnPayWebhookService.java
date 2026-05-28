package com.example.freelancer.module.Payment.service;

import java.util.Map;

public interface IVnPayWebhookService {
    String processIpn(Map<String, String> params);

    void processReturn(Map<String, String> params);
}
