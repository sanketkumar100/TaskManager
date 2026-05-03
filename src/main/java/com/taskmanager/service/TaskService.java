package com.taskmanager.service;

import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse.TaskResponse createTask(TaskRequest.CreateTaskRequest req, User currentUser) {
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        assertProjectAccess(project, currentUser);

        // Only admins/owners can create tasks
        boolean isAdmin = projectRepository.isUserAdminOfProject(project.getId(), currentUser.getId());
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Only project admins can create tasks");
        }

        User assignee = null;
        if (req.getAssigneeId() != null) {
            assignee = userRepository.findById(req.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        }

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority() != null ? req.getPriority() : Task.Priority.MEDIUM)
                .dueDate(req.getDueDate())
                .status(Task.TaskStatus.TODO)
                .project(project)
                .assignee(assignee)
                .createdBy(currentUser)
                .build();

        return ApiResponse.TaskResponse.from(taskRepository.save(task));
    }

    public List<ApiResponse.TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, currentUser);
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(ApiResponse.TaskResponse::from).collect(Collectors.toList());
    }

    public ApiResponse.TaskResponse getTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        assertProjectAccess(task.getProject(), currentUser);
        return ApiResponse.TaskResponse.from(task);
    }

    @Transactional
    public ApiResponse.TaskResponse updateTask(Long id, TaskRequest.UpdateTaskRequest req, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        assertProjectAccess(task.getProject(), currentUser);

        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());

        if (req.getAssigneeId() != null) {
            User assignee = userRepository.findById(req.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return ApiResponse.TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public ApiResponse.TaskResponse updateStatus(Long id, TaskRequest.UpdateStatusRequest req, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        assertProjectAccess(task.getProject(), currentUser);
        task.setStatus(req.getStatus());
        return ApiResponse.TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        boolean isAdmin = projectRepository.isUserAdminOfProject(task.getProject().getId(), currentUser.getId());
        boolean isOwner = task.getProject().getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Only project admins can delete tasks");
        }
        taskRepository.delete(task);
    }

    private void assertProjectAccess(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectRepository.isUserMemberOfProject(project.getId(), user.getId());
        if (!isOwner && !isMember) {
            throw new ForbiddenException("Access denied to this project");
        }
    }
}