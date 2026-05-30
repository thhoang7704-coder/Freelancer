package com.example.freelancer.module.Payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.freelancer.module.Payment.service.VnPayWebhookService;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/webhook/vnpay")
public class VnPayWebhookController {

    private final VnPayWebhookService vnPayWebhookService;

    @GetMapping("/ipn")
    public ResponseEntity<String> handleIpn(
            @RequestParam Map<String, String> params) {

        log.info("========== VNPAY IPN ==========");
        log.info("Params: {}", params);

        String response = vnPayWebhookService.processIpn(params);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/return")
    public ResponseEntity<String> handleReturn(
            @RequestParam Map<String, String> params) {

        log.info("========== VNPAY RETURN ==========");
        log.info("Params: {}", params);
        
        try {
            String dbUrl = vnPayWebhookService.getDatabaseUrl();
            log.info("Connected to Database: {}", dbUrl);
        } catch (Exception e) {}

        vnPayWebhookService.processReturn(params);

        return ResponseEntity.ok("Thanh toán thành công");
    }
}
