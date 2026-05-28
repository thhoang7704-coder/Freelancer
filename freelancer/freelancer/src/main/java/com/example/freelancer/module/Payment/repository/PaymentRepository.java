package com.example.freelancer.module.Payment.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.module.Payment.entity.Payment;

import jakarta.persistence.LockModeType;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
        // @Query("""
        // SELECT COALESCE(SUM(p.totalAmount), 0)
        // FROM Payment p
        // """)
        // BigDecimal sumAllPayments();

        // @Query("""
        // SELECT COALESCE(SUM(p.platformFee), 0)
        // FROM Payment p
        // """)
        // BigDecimal sumPlatformRevenue();

        // List<Payment> findTop5ByOrderByCreatedAtDesc();
        boolean existsByProjectIdAndPaymentStatus(
                        UUID projectId,
                        PaymentStatus paymentStatus);

        Optional<Payment> findByIdAndCompanyId(
                        UUID paymentId,
                        UUID companyId);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        Optional<Payment> findByPaymentCode(String paymentCode);

        Optional<Payment> findByTxnRef(String txnRef);

        List<Payment> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

        List<Payment> findAllByOrderByCreatedAtDesc();

}
