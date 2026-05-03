package com.taskmanager.dto.request;

import com.taskmanager.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

public class TaskRequest {

    @Data
    public static class CreateTaskRequest {
        @NotBlank(message = "Task title is required")
        @Size(min = 2, max = 300)
        private String title;

        @Size(max = 2000)
        private String description;

        private Task.Priority priority = Task.Priority.MEDIUM;

        private LocalDate dueDate;

        @NotNull(message = "Project ID is required")
        private Long projectId;

        private Long assigneeId;
    }

    @Data
    public static class UpdateTaskRequest {
        @Size(min = 2, max = 300)
        private String title;

        @Size(max = 2000)
        private String description;

        private Task.TaskStatus status;

        private Task.Priority priority;

        private LocalDate dueDate;

        private Long assigneeId;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private Task.TaskStatus status;
    }
}