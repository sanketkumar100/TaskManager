package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(User owner);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.members m WHERE m.user = :user")
    List<Project> findProjectsByMember(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner = :user OR m.user = :user")
    List<Project> findAllAccessibleProjects(@Param("user") User user);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM ProjectMember m WHERE m.project.id = :projectId AND m.user.id = :userId")
    boolean isUserMemberOfProject(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM ProjectMember m WHERE m.project.id = :projectId AND m.user.id = :userId AND m.role = 'ADMIN'")
    boolean isUserAdminOfProject(@Param("projectId") Long projectId, @Param("userId") Long userId);

    Optional<Project> findByIdAndOwner(Long id, User owner);
}