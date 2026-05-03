package com.taskmanager.service;

import com.taskmanager.dto.request.AuthRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public ApiResponse.AuthResponse signup(AuthRequest.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .globalRole(User.GlobalRole.MEMBER)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getFullName(), saved.getId());

        return ApiResponse.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .globalRole(saved.getGlobalRole().name())
                .build();
    }

    public ApiResponse.AuthResponse login(AuthRequest.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getFullName(), user.getId());

        return ApiResponse.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .globalRole(user.getGlobalRole().name())
                .build();
    }
}