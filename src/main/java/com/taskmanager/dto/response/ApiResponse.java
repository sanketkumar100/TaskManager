package com.taskmanager.dto.response;

import com.taskmanager.entity.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ApiResponse {

    @Data @Builder
    public static class AuthResponse {
        private String token;
        private String type;
        private Long userId;
        private String fullName;
        private String email;
        private String globalRole;
    }

    @Data @Builder
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String globalRole;
        private LocalDateTime createdAt;

        public static UserResponse from(User u) {
            return UserResponse.builder()
                    .id(u.getId()).fullName(u.getFullName())
                    .email(u.getEmail()).globalRole(u.getGlobalRole().name())
                    .createdAt(u.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class ProjectResponse {
        private Long id;
        private String name;
        private String description;
        private String status;
        private UserResponse owner;
        private int memberCount;
        private int taskCount;
        private LocalDateTime createdAt;

        public static ProjectResponse from(Project p) {
            return ProjectResponse.builder()
                    .id(p.getId()).name(p.getName())
                    .description(p.getDescription())
                    .status(p.getStatus().name())
                    .owner(UserResponse.from(p.getOwner()))
                    .memberCount(p.getMembers().size())
                    .taskCount(p.getTasks().size())
                    .createdAt(p.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class TaskResponse {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String priority;
        private LocalDate dueDate;
        private boolean overdue;
        private Long projectId;
        private String projectName;
        private UserResponse assignee;
        private UserResponse createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static TaskResponse from(Task t) {
            return TaskResponse.builder()
                    .id(t.getId()).title(t.getTitle())
                    .description(t.getDescription())
                    .status(t.getStatus().name())
                    .priority(t.getPriority().name())
                    .dueDate(t.getDueDate())
                    .overdue(t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != Task.TaskStatus.DONE)
                    .projectId(t.getProject().getId())
                    .projectName(t.getProject().getName())
                    .assignee(t.getAssignee() != null ? UserResponse.from(t.getAssignee()) : null)
                    .createdBy(UserResponse.from(t.getCreatedBy()))
                    .createdAt(t.getCreatedAt())
                    .updatedAt(t.getUpdatedAt()).build();
        }
    }

    @Data @Builder
    public static class MemberResponse {
        private Long id;
        private UserResponse user;
        private String role;
        private LocalDateTime joinedAt;

        public static MemberResponse from(ProjectMember m) {
            return MemberResponse.builder()
                    .id(m.getId())
                    .user(UserResponse.from(m.getUser()))
                    .role(m.getRole().name())
                    .joinedAt(m.getJoinedAt()).build();
        }
    }

    @Data @Builder
    public static class DashboardResponse {
        private long totalTasks;
        private long completedTasks;
        private long inProgressTasks;
        private long todoTasks;
        private long overdueTasks;
        private int totalProjects;
        private List<TaskResponse> myRecentTasks;
        private List<TaskResponse> overdueTaskList;
    }

    @Data @Builder
    public static class MessageResponse {
        private String message;
        private boolean success;
    }
}