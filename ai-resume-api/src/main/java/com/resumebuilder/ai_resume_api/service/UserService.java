package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.dto.RegisterRequestDto;
import com.resumebuilder.ai_resume_api.dto.UserResponseDto;
import com.resumebuilder.ai_resume_api.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.*;
import org.springframework.transaction.annotation.Transactional;
import com.resumebuilder.ai_resume_api.exception.DuplicateUserException;
import com.resumebuilder.ai_resume_api.util.Normalization;

@Service
@Transactional
public class UserService {
     @org.springframework.beans.factory.annotation.Value("${security.registration.require-email-verification:true}")
    private boolean requireEmailVerification;
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    public UserResponseDto register(RegisterRequestDto req) {
        String username = Normalization.username(req.username());
        String email = Normalization.email(req.email());

        userRepository.findByUsername(username).ifPresent(u -> {
            log.info("Registration conflict on username={}", username);
            throw new DuplicateUserException("User already exists");
        });
        userRepository.findByEmail(email).ifPresent(u -> {
            log.info("Registration conflict on email={}", email);
            throw new DuplicateUserException("User already exists");
        });

        var user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(req.fullName().trim());
        user.setEnabled(!requireEmailVerification); // email verification flow (enabled after verify)
        user.setPassword(passwordEncoder.encode(req.password()));

        user = userRepository.save(user);
        return userMapper.toDto(user);
    }
}