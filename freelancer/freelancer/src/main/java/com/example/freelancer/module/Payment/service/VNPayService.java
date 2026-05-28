package com.example.freelancer.module.Payment.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.freelancer.module.Payment.entity.Payment;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VNPayService implements IVNPayService {

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${payment.vnpay.base-url}")
    private String baseUrl;

    @Value("${payment.vnpay.return-url}")
    private String returnUrl;

    @Override
    public String createPaymentUrl(Payment payment) {

        try {

            String txnRef = payment.getPaymentCode();

            String amount = payment.getTotalAmount()
                    .multiply(java.math.BigDecimal.valueOf(100))
                    .toBigInteger()
                    .toString();

            Map<String, String> vnpParams = new HashMap<>();

            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", amount);
            vnpParams.put("vnp_CurrCode", "VND");

            vnpParams.put("vnp_TxnRef", txnRef);

            vnpParams.put(
                    "vnp_OrderInfo",
                    "Thanh toan project " + payment.getProject().getName());

            vnpParams.put("vnp_OrderType", "other");

            vnpParams.put("vnp_Locale", "vn");

            vnpParams.put("vnp_ReturnUrl", returnUrl);

            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));

            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

            String createDate = formatter.format(calendar.getTime());

            vnpParams.put("vnp_CreateDate", createDate);

            calendar.add(Calendar.MINUTE, 15);

            String expireDate = formatter.format(calendar.getTime());

            vnpParams.put("vnp_ExpireDate", expireDate);

            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());

            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();

            StringBuilder query = new StringBuilder();

            for (int i = 0; i < fieldNames.size(); i++) {

                String fieldName = fieldNames.get(i);

                String fieldValue = vnpParams.get(fieldName);

                if (fieldValue != null && !fieldValue.isEmpty()) {

                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(
                            URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                    query.append(
                            URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));

                    query.append('=');

                    query.append(
                            URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                    if (i < fieldNames.size() - 1) {

                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            String secureHash = hmacSHA512(
                    hashSecret,
                    hashData.toString());

            query.append("&vnp_SecureHash=");
            query.append(secureHash);

            return baseUrl + "?" + query;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Cannot create VNPay URL",
                    e);
        }
    }

    @Override
    public boolean verify(Map<String, String> params) {

        try {

            String vnpSecureHash = params.get("vnp_SecureHash");

            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());

            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();

            for (int i = 0; i < fieldNames.size(); i++) {

                String fieldName = fieldNames.get(i);

                String fieldValue = params.get(fieldName);

                if (fieldValue != null && !fieldValue.isEmpty()) {

                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(
                            URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                    if (i < fieldNames.size() - 1) {

                        hashData.append('&');
                    }
                }
            }

            String calculatedHash = hmacSHA512(
                    hashSecret,
                    hashData.toString());

            return calculatedHash.equals(vnpSecureHash);

        } catch (Exception e) {

            return false;
        }
    }

    private String hmacSHA512(
            String key,
            String data) {

        try {

            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");

            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    key.getBytes(),
                    "HmacSHA512");

            hmac512.init(secretKey);

            byte[] bytes = hmac512.doFinal(data.getBytes());

            StringBuilder hash = new StringBuilder();

            for (byte b : bytes) {

                String hex = Integer.toHexString(0xff & b);

                if (hex.length() == 1) {
                    hash.append('0');
                }

                hash.append(hex);
            }

            return hash.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Cannot generate HMAC SHA512",
                    e);
        }
    }
}
