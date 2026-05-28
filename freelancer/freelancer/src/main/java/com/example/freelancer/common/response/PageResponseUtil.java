package com.example.freelancer.common.response;

import org.springframework.data.domain.Page;

public class PageResponseUtil {

    public static <T> PageResponse<T> from(
            Page<T> pageData) {

        return PageResponse.<T>builder()
                .items(pageData.getContent())
                .pagination(
                        PageResponse.PaginationMeta.builder()
                                .page(pageData.getNumber() + 1)
                                .limit(pageData.getSize())
                                .total(pageData.getTotalElements())
                                .totalPages(pageData.getTotalPages())
                                .build())
                .build();
    }
}
