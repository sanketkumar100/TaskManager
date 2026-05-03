package com.taskmanager.controller;

import com.taskmanager.dto.request.AuthRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse.AuthResponse> signup(@Valid @RequestBody AuthRequest.SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse.AuthResponse> login(@Valid @RequestBody AuthRequest.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}