package com.example.freelancer.module.transaction.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.entity.PaymentDistribution;
import com.example.freelancer.module.Payment.entity.PaymentRule;
import com.example.freelancer.module.Payment.repository.PaymentRuleRepository;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.transaction.repository.PaymentDistributionRepository;
import com.example.freelancer.module.transaction.service.interfaces.IDistributionService;
import com.example.freelancer.module.wallet.service.interfaces.IWalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DistributionService implements IDistributionService {

        private final PaymentRuleRepository paymentRuleRepository;
        private final IWalletService walletService;
        private final PaymentDistributionRepository distributionRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final UserRepository userRepository;
        private final CompanyRepository companyRepository;
        private final NotificationService notificationService;

        @Transactional
        @Override
        public void distributePayment(Payment payment) {

                PaymentRule rule = paymentRuleRepository
                                .findByActiveTrue()
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Payment rule not found"));

                BigDecimal total = payment.getTotalAmount();

                BigDecimal adminAmount = total.multiply(rule.getAdminPercent())
                                .divide(BigDecimal.valueOf(100));

                BigDecimal leaderBonus = total.multiply(rule.getLeaderPercent())
                                .divide(BigDecimal.valueOf(100));

                BigDecimal freelancerPool = total.multiply(rule.getFreelancerPercent())
                                .divide(BigDecimal.valueOf(100));

                Project project = payment.getProject();

                List<ProjectMember> members = projectMemberRepository
                                .findByProjectId(
                                                project.getId());

                BigDecimal eachAmount = freelancerPool.divide(
                                BigDecimal.valueOf(members.size()),
                                RoundingMode.HALF_UP);

                // ADMIN
                UUID adminUserId = getAdminUserId();

                walletService.credit(
                                adminUserId,
                                adminAmount,
                                "Admin fee from project");

                // MEMBERS
                for (ProjectMember member : members) {

                        BigDecimal amount = eachAmount;

                        if (member.isLeader()) {
                                amount = amount.add(leaderBonus);
                        }

                        walletService.credit(
                                        member.getFreelancer()
                                                        .getUser()
                                                        .getId(),
                                        amount,
                                        "Payment from project");

                        PaymentDistribution distribution = new PaymentDistribution();

                        distribution.setPayment(payment);
                        distribution.setFreelancer(
                                        member.getFreelancer());

                        distribution.setAmount(amount);

                        distribution.setLeader(
                                        member.isLeader());

                        distributionRepository.save(distribution);
                }
                // NOTIFY ALL COMPANIES
                // List<Company> companies = companyRepository.findAll();

                // for (Company company : companies) {

                //         notificationService.createNotification(
                //                         company.getUser(),
                //                         "Admin đã cập nhật phân chia thanh toán",
                //                         "Admin vừa cập nhật quy tắc phân chia thanh toán cho hệ thống.",
                //                         NotificationType.PAYMENT_RULE_UPDATED,
                //                         payment.getId());
                // }
        }

        private UUID getAdminUserId() {

                User admin = userRepository.findFirstByRole(UserRole.ADMIN)
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                return admin.getId();
        }

}
