package com.taskmanager.service;

import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public ApiResponse.DashboardResponse getDashboard(User currentUser) {
        LocalDate today = LocalDate.now();

        long completed = taskRepository.countByAssigneeAndStatus(currentUser, Task.TaskStatus.DONE);
        long inProgress = taskRepository.countByAssigneeAndStatus(currentUser, Task.TaskStatus.IN_PROGRESS);
        long todo = taskRepository.countByAssigneeAndStatus(currentUser, Task.TaskStatus.TODO);
        long overdue = taskRepository.countOverdueByAssignee(currentUser, today);

        List<ApiResponse.TaskResponse> myRecentTasks = taskRepository
                .findByAssignee(currentUser).stream()
                .limit(5)
                .map(ApiResponse.TaskResponse::from)
                .collect(Collectors.toList());

        List<ApiResponse.TaskResponse> overdueList = taskRepository
                .findOverdueTasksForUser(currentUser, today).stream()
                .map(ApiResponse.TaskResponse::from)
                .collect(Collectors.toList());

        int totalProjects = projectRepository.findAllAccessibleProjects(currentUser).size();

        return ApiResponse.DashboardResponse.builder()
                .totalTasks(completed + inProgress + todo)
                .completedTasks(completed)
                .inProgressTasks(inProgress)
                .todoTasks(todo)
                .overdueTasks(overdue)
                .totalProjects(totalProjects)
                .myRecentTasks(myRecentTasks)
                .overdueTaskList(overdueList)
                .build();
    }
}