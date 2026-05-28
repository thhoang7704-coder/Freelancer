package com.example.freelancer.module.company.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.company.dto.CompanyResponse;
import com.example.freelancer.module.company.entity.Company;

@Repository
public interface CompanyRepository
        extends JpaRepository<Company, UUID> {

    boolean existsByUserId(UUID userId);

    boolean existsByTaxCode(String taxCode);

    Optional<Company> findByUserId(UUID userId);

    Page<Company> findByStatus(
            ApprovalStatus status,
            Pageable pageable);

    // đêm số lượng dự án đã được duyệt của mỗi công ty để sắp xếp

    @Query("""
                                    SELECT new com.example.freelancer.module.company.dto.CompanyResponse(
                                        c.id,
                                        c.companyName,
                                        c.status,
                                        c.taxCode,
                                        c.createdAt,
                                        c.expertise,
                                        COUNT(p.id)
                                    )
                                     FROM Company c
            LEFT JOIN Project p
                ON p.company.id = c.id
                AND p.status = com.example.freelancer.enums.ApprovalStatus.APPROVED
            GROUP BY
                c.id,
                c.companyName,
                c.status,
                c.taxCode,
                c.createdAt,
                c.expertise
                                """)
    List<CompanyResponse> getAllCompaniesWithProjectCount();
}