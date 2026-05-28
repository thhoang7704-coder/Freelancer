package com.example.freelancer.module.Payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
@RequiredArgsConstructor
public class VnPayUtil {

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    public boolean validateSignature(
            Map<String, String> params,
            String inputHash) {

        Map<String, String> fields = new HashMap<>(params);

        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(fields.keySet());

        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        for (String fieldName : fieldNames) {

            String value = fields.get(fieldName);

            if (value != null && !value.isEmpty()) {

                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(
                        URLEncoder.encode(
                                value,
                                StandardCharsets.US_ASCII));
                hashData.append('&');
            }
        }

        hashData.deleteCharAt(hashData.length() - 1);

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());

        return calculatedHash.equalsIgnoreCase(inputHash);
    }

    public String hmacSHA512(String key, String data) {

        try {

            Mac hmac512 = Mac.getInstance("HmacSHA512");

            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(),
                    "HmacSHA512");

            hmac512.init(secretKey);

            byte[] bytes = hmac512.doFinal(data.getBytes());

            StringBuilder hash = new StringBuilder();

            for (byte b : bytes) {

                hash.append(String.format("%02x", b));
            }

            return hash.toString();

        } catch (Exception e) {

            throw new RuntimeException(e);
        }
    }
}
