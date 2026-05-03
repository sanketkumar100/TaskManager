package com.taskmanager.service;

import com.taskmanager.dto.request.ProjectRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.User;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse.ProjectResponse createProject(ProjectRequest.CreateProjectRequest req, User currentUser) {
        Project project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .owner(currentUser)
                .status(Project.ProjectStatus.ACTIVE)
                .build();

        Project saved = projectRepository.save(project);

        // Owner is automatically an ADMIN member
        ProjectMember ownerMember = ProjectMember.builder()
                .project(saved)
                .user(currentUser)
                .role(ProjectMember.ProjectRole.ADMIN)
                .build();
        memberRepository.save(ownerMember);

        return ApiResponse.ProjectResponse.from(saved);
    }

    public List<ApiResponse.ProjectResponse> getMyProjects(User currentUser) {
        return projectRepository.findAllAccessibleProjects(currentUser)
                .stream().map(ApiResponse.ProjectResponse::from).collect(Collectors.toList());
    }

    public ApiResponse.ProjectResponse getProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertAccess(project, currentUser);
        return ApiResponse.ProjectResponse.from(project);
    }

    @Transactional
    public ApiResponse.ProjectResponse updateProject(Long id, ProjectRequest.UpdateProjectRequest req, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertAdminAccess(id, currentUser);

        if (req.getName() != null) project.setName(req.getName());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getStatus() != null) project.setStatus(Project.ProjectStatus.valueOf(req.getStatus()));

        return ApiResponse.ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the project owner can delete this project");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public ApiResponse.MemberResponse addMember(Long projectId, ProjectRequest.AddMemberRequest req, User currentUser) {
        assertAdminAccess(projectId, currentUser);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User userToAdd = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (memberRepository.existsByProjectIdAndUserId(projectId, req.getUserId())) {
            throw new BadRequestException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project).user(userToAdd).role(req.getRole()).build();

        return ApiResponse.MemberResponse.from(memberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        assertAdminAccess(projectId, currentUser);
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("Member not found");
        }
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public List<ApiResponse.MemberResponse> getMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertAccess(project, currentUser);
        return memberRepository.findByProjectId(projectId)
                .stream().map(ApiResponse.MemberResponse::from).collect(Collectors.toList());
    }

    private void assertAccess(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectRepository.isUserMemberOfProject(project.getId(), user.getId());
        if (!isOwner && !isMember) {
            throw new ForbiddenException("Access denied to this project");
        }
    }

    private void assertAdminAccess(Long projectId, User user) {
        boolean isAdmin = projectRepository.isUserAdminOfProject(projectId, user.getId());
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Admin access required for this action");
        }
    }
}