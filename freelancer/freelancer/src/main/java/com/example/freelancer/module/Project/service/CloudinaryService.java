package com.example.freelancer.module.Project.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {

        try {

            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "auto");

            Map uploadResult = cloudinary.uploader()
                    .upload(file.getBytes(), options);

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Upload file failed");
        }
    }
}
