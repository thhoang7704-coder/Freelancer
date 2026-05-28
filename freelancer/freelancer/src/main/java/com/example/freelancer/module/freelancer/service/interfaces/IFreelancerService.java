package com.example.freelancer.module.freelancer.service.interfaces;

import java.util.UUID;

import com.example.freelancer.module.Project.dto.UpdateProjectProgressRequest;
import com.example.freelancer.module.freelancer.dto.CreateFreelancerRequest;
import com.example.freelancer.module.freelancer.dto.FreelancerResponse;
import com.example.freelancer.module.freelancer.dto.UpdateFreelancerRequest;

public interface IFreelancerService {
        FreelancerResponse createFreelancer(CreateFreelancerRequest request);

        FreelancerResponse getFreelancerProfile(
                        UUID freelancerId);

        FreelancerResponse getMyFreelancerProfile();

        FreelancerResponse updateFreelancer(
                        UpdateFreelancerRequest request);

        void updateProjectProgress(
                        UUID projectId,
                        UpdateProjectProgressRequest request);

}
