package com.taskmanager.controller;

import com.taskmanager.dto.request.ProjectRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.User;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse.ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest.CreateProjectRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(req, user));
    }

    @GetMapping
    public ResponseEntity<List<ApiResponse.ProjectResponse>> getMyProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(projectService.getMyProjects(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse.ProjectResponse> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(projectService.getProject(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse.ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest.UpdateProjectRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(projectService.updateProject(id, req, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse.MessageResponse> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        projectService.deleteProject(id, user);
        return ResponseEntity.ok(ApiResponse.MessageResponse.builder().message("Project deleted").success(true).build());
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ApiResponse.MemberResponse>> getMembers(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(projectService.getMembers(id, user));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse.MemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest.AddMemberRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addMember(id, req, user));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse.MessageResponse> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        projectService.removeMember(id, userId, user);
        return ResponseEntity.ok(ApiResponse.MessageResponse.builder().message("Member removed").success(true).build());
    }
}