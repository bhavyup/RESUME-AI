package com.resumebuilder.ai_resume_api.entity;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoEntity;
import com.resumebuilder.ai_resume_api.entity.resume.ResumeEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.resumebuilder.ai_resume_api.entity.base.AuditableEntity;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
    @UniqueConstraint(name = "uk_users_email", columnNames = "email")
}, indexes = {
    @Index(name = "idx_users_username", columnList = "username"),
    @Index(name = "idx_users_email", columnList = "email")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class UserEntity extends AuditableEntity implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, length = 50)
  private String username;

  @NotBlank
  @Size(min = 8, max = 128)
  @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
  @Column(nullable = false, length = 72) // bcrypt ~60, give some headroom
  private String password;

  @NotBlank
  @Email
  @Column(nullable = false, length = 255)
  private String email;

  @NotBlank
  @Column(nullable = false, length = 255)
  private String fullName;

  // Optional security state for future
  @Column(name = "enabled", nullable = false)
  private boolean enabled = true;
  @Column(name = "account_non_locked", nullable = false)
  private boolean accountNonLocked = true;
  @Column(name = "account_non_expired", nullable = false)
  private boolean accountNonExpired = true;
  @Column(name = "credentials_non_expired", nullable = false)
  private boolean credentialsNonExpired = true;

  @Column(name = "failed_login_attempts", nullable = false)
  private int failedLoginAttempts = 0;

  @Column
  private java.time.Instant lockedUntil; // nullable; if in the past or null, it's not locked

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private PersonalInfoEntity personalInfo;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ResumeEntity> resumes = new java.util.ArrayList<>();

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private UserSubscriptionEntity subscription;

  // UserDetails
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return java.util.List.of();
  }

  @Override
  public boolean isAccountNonExpired() {
    return accountNonExpired;
  }

  @Override
  public boolean isAccountNonLocked() {
    // Consider lockedUntil if set
    if (lockedUntil != null && lockedUntil.isAfter(java.time.Instant.now())) {
      return false;
    }
    return accountNonLocked;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return credentialsNonExpired;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }

  @Override
  public String toString() {
    return "UserEntity{id=" + id + ", username=" + username + "}";
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || org.hibernate.Hibernate.getClass(this) != org.hibernate.Hibernate.getClass(o))
      return false;
    UserEntity u = (UserEntity) o;
    return id != null && id.equals(u.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}