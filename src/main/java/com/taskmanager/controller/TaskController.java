package com.taskmanager.controller;

import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.User;
import com.taskmanager.service.TaskService;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse.TaskResponse> createTask(
            @Valid @RequestBody TaskRequest.CreateTaskRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(req, user));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ApiResponse.TaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse.TaskResponse> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(taskService.getTask(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse.TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest.UpdateTaskRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(taskService.updateTask(id, req, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse.TaskResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest.UpdateStatusRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(taskService.updateStatus(id, req, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse.MessageResponse> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(ApiResponse.MessageResponse.builder().message("Task deleted").success(true).build());
    }
}