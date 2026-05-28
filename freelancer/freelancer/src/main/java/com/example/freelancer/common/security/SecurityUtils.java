package com.example.freelancer.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserDetailsImpl getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                authentication.getPrincipal() == null) {
            return null;
        }

        return (UserDetailsImpl) authentication.getPrincipal();
    }

}