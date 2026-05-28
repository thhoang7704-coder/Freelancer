package com.example.freelancer.common.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageResponse<T> {
    private List<T> items;
    private PaginationMeta pagination;

    @Getter
    @Builder
    public static class PaginationMeta {
        private int page;
        private int limit;
        private long total;
        private int totalPages;
    }
}