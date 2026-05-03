package com.taskmanager.dto.request;

import com.taskmanager.entity.ProjectMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class ProjectRequest {

    @Data
    public static class CreateProjectRequest {
        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 200)
        private String name;

        @Size(max = 1000)
        private String description;
    }

    @Data
    public static class UpdateProjectRequest {
        @Size(min = 2, max = 200)
        private String name;

        @Size(max = 1000)
        private String description;

        private String status;
    }

    @Data
    public static class AddMemberRequest {
        @NotNull(message = "User ID is required")
        private Long userId;

        private ProjectMember.ProjectRole role = ProjectMember.ProjectRole.MEMBER;
    }
}