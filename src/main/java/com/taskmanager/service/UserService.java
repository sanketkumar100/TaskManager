package com.taskmanager.service;

import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<ApiResponse.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(ApiResponse.UserResponse::from)
                .collect(Collectors.toList());
    }

    public ApiResponse.UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ApiResponse.UserResponse.from(user);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}