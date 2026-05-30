package com.example.freelancer.module.Payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/ipn")
    public ResponseEntity<String> handleIpn(
            @RequestParam Map<String, String> params) {

        log.info("VNPAY IPN");
        log.info("Params: {}", params);

        String response = vnPayWebhookService.processIpn(params);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/return")
    public ResponseEntity<Void> handleReturn(
            @RequestParam Map<String, String> params) {

        log.info("VNPAY RETURN");
        log.info("Params: {}", params);

        String status = "failed";
        try {
            vnPayWebhookService.processReturn(params);
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                status = "success";
            }
        } catch (Exception e) {
            log.error("Error processing VNPAY return", e);
        }

        String redirectUrl = frontendUrl + "/company/payments?vnpay_status=" + status;
        log.info("Redirecting to: {}", redirectUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", redirectUrl);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
