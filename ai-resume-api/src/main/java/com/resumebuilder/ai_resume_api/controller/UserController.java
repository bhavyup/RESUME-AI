package com.resumebuilder.ai_resume_api.controller; // Corrected package name

import org.springframework.web.bind.annotation.GetMapping;
import com.resumebuilder.ai_resume_api.dto.UserInfoResponseDto;
import com.resumebuilder.ai_resume_api.mapper.UserMapper;
import com.resumebuilder.ai_resume_api.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserController(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly=true)
    @Operation(summary = "Get current user info", description = "Fetches the profile information of the currently authenticated user.")
    @GetMapping("/me")
    public UserInfoResponseDto me(org.springframework.security.core.Authentication authentication) {
        var principal = (com.resumebuilder.ai_resume_api.security.UserPrincipal) authentication.getPrincipal();
        var user = userRepository.findWithPersonalInfoById(principal.getId())
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));
        return userMapper.toInfoDto(user);
    }
}