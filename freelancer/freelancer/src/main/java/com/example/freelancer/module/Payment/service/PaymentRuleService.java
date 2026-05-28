package com.example.freelancer.module.Payment.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.module.Payment.dto.CreatePaymentRuleRequest;
import com.example.freelancer.module.Payment.dto.PaymentRuleResponse;
import com.example.freelancer.module.Payment.entity.PaymentRule;
import com.example.freelancer.module.Payment.repository.PaymentRuleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentRuleService
                implements IPaymentRuleService {

        private final PaymentRuleRepository paymentRuleRepository;

        @Transactional
        @Override
        public PaymentRuleResponse createRule(
                        CreatePaymentRuleRequest request) {

                BigDecimal total = request.getAdminPercent()
                                .add(request.getLeaderPercent())
                                .add(request.getFreelancerPercent());

                if (total.compareTo(BigDecimal.valueOf(100)) != 0) {

                        throw new BadRequestException(
                                        "400",
                                        "Total percent must equal 100");
                }

                paymentRuleRepository
                                .findByActiveTrue()
                                .ifPresent(rule -> {

                                        rule.setActive(false);

                                        paymentRuleRepository.save(rule);
                                });

                PaymentRule rule = new PaymentRule();

                rule.setAdminPercent(
                                request.getAdminPercent());

                rule.setLeaderPercent(
                                request.getLeaderPercent());

                rule.setFreelancerPercent(
                                request.getFreelancerPercent());

                rule.setActive(true);

                paymentRuleRepository.save(rule);

                return PaymentRuleResponse.builder()
                                .id(rule.getId())
                                .adminPercent(rule.getAdminPercent())
                                .leaderPercent(rule.getLeaderPercent())
                                .freelancerPercent(rule.getFreelancerPercent())
                                .active(rule.isActive())
                                .build();
        }

        @Override
        public PaymentRuleResponse getActiveRule() {

                PaymentRule rule = paymentRuleRepository
                                .findByActiveTrue()
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Rule not found"));

                return PaymentRuleResponse.builder()
                                .id(rule.getId())
                                .adminPercent(rule.getAdminPercent())
                                .leaderPercent(rule.getLeaderPercent())
                                .freelancerPercent(rule.getFreelancerPercent())
                                .active(rule.isActive())
                                .build();
        }
}
