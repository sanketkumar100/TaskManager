package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignee(User assignee);

    List<Task> findByAssigneeAndStatus(User assignee, Task.TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasksForUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.project p JOIN p.members m WHERE m.user = :user OR p.owner = :user")
    long countAllAccessibleTasks(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.status = :status")
    long countByAssigneeAndStatus(@Param("user") User user, @Param("status") Task.TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.dueDate < :today AND t.status != 'DONE'")
    long countOverdueByAssignee(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId ORDER BY t.createdAt DESC")
    List<Task> findByProjectIdOrderByCreatedAtDesc(@Param("projectId") Long projectId);
}