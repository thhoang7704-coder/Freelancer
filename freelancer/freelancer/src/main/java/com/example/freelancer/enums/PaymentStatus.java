package com.example.freelancer.enums;

public enum PaymentStatus {
    UNPAID, // chưa thanh toán
    PENDING, // đang xử lý (đã gọi VNPay)
    PAID, // thanh toán thành công
    FAILED, // thanh toán thất bại
    CANCELLED, // user hủy
    REFUNDED // hoàn tiền (nếu có)
}