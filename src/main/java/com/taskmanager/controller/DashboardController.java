package com.taskmanager.controller;

import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.User;
import com.taskmanager.service.DashboardService;
import com.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse.DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(dashboardService.getDashboard(user));
    }

    @GetMapping("/users")
    public ResponseEntity<List<ApiResponse.UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse.UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.UserResponse.from(user));
    }
}