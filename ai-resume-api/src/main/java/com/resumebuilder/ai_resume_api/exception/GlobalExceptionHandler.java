package com.resumebuilder.ai_resume_api.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.hibernate.StaleObjectStateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;
import java.time.Instant;
import java.util.*;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @Value("${app.errors.include-debug:false}")
    private boolean includeDebug;

    // --------- Domain ---------
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, ex.getMessage(), req, ex, null);
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ApiError> handleDuplicateUser(DuplicateUserException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ErrorCode.USER_EXISTS, ex.getMessage(), req, ex, null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, ex.getMessage(), req, ex, null);
    }

    @ExceptionHandler(OptimisticLockingException.class)
    public ResponseEntity<ApiError> handleOptimisticLocking(OptimisticLockingException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ErrorCode.OPTIMISTIC_LOCK, ex.getMessage(), req, ex, null);
    }

    // --------- Validation / Binding ---------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("field", fe.getField());
            item.put("message", fe.getDefaultMessage());
            Object rejected = fe.getRejectedValue();
            if (rejected != null)
                item.put("rejectedValue", rejected);
            errors.add(item);
        }
        details.put("errors", errors);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Validation failed", req, ex, details);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBind(BindException ex, HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("field", fe.getField());
            item.put("message", fe.getDefaultMessage());
            Object rejected = fe.getRejectedValue();
            if (rejected != null)
                item.put("rejectedValue", rejected);
            errors.add(item);
        }
        details.put("errors", errors);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Binding failed", req, ex, details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        ex.getConstraintViolations().forEach(cv -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("property", cv.getPropertyPath().toString());
            item.put("message", cv.getMessage());
            Object invalid = cv.getInvalidValue();
            if (invalid != null)
                item.put("invalidValue", invalid);
            errors.add(item);
        });
        details.put("errors", errors);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Constraint violation", req, ex, details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        String msg = "Malformed JSON request";
        Map<String, Object> details = new LinkedHashMap<>();
        Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
        if (root instanceof MismatchedInputException mie) {
            msg = "JSON binding error";
            details.put("targetType", mie.getTargetType() != null ? mie.getTargetType().toString() : null);
            details.put("path", extractJsonPath(mie));
        } else if (root != null) {
            details.put("root", root.getMessage());
        }
        return build(HttpStatus.BAD_REQUEST, ErrorCode.JSON_PARSE_ERROR, msg, req, ex, details);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("parameter", ex.getName());
        details.put("value", ex.getValue());
        details.put("requiredType", ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : null);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.TYPE_MISMATCH, "Parameter type mismatch", req, ex, details);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex,
            HttpServletRequest req) {
        Map<String, Object> details = Map.of("parameter", ex.getParameterName(), "expectedType", ex.getParameterType());
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Missing request parameter", req, ex, details);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex,
            HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("method", ex.getMethod());
        details.put("supported", ex.getSupportedHttpMethods());
        return build(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed", req, ex,
                details);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex,
            HttpServletRequest req) {
        Map<String, Object> details = Map.of("contentType", ex.getContentType(), "supported",
                ex.getSupportedMediaTypes());
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, ErrorCode.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type", req,
                ex, details);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<ApiError> handleNotAcceptable(HttpMediaTypeNotAcceptableException ex,
            HttpServletRequest req) {
        Map<String, Object> details = Map.of("supported", ex.getSupportedMediaTypes());
        return build(HttpStatus.NOT_ACCEPTABLE, ErrorCode.NOT_ACCEPTABLE, "Not acceptable", req, ex, details);
    }

    // --------- Data / DB ---------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        String sqlState = null;
        String constraint = null;
        SQLException sqlEx = findCause(ex, SQLException.class);
        if (sqlEx != null)
            sqlState = sqlEx.getSQLState();

        org.hibernate.exception.ConstraintViolationException hce = findCause(ex,
                org.hibernate.exception.ConstraintViolationException.class);
        if (hce != null && hce.getConstraintName() != null) {
            constraint = hce.getConstraintName();
        }

        HttpStatus status = HttpStatus.CONFLICT;
        ErrorCode code = ErrorCode.DUPLICATE_KEY;
        String message = "Data integrity violation";

        if ("23505".equals(sqlState)) {
            message = "Duplicate key violates unique constraint";
        } else if ("23502".equals(sqlState)) {
            status = HttpStatus.BAD_REQUEST;
            code = ErrorCode.NOT_NULL_VIOLATION;
            message = "Required field is missing (NOT NULL violation)";
        } else if ("23503".equals(sqlState)) {
            status = HttpStatus.BAD_REQUEST;
            code = ErrorCode.FOREIGN_KEY_VIOLATION;
            message = "Invalid reference (foreign key violation)";
        } else if ("23514".equals(sqlState)) {
            status = HttpStatus.BAD_REQUEST;
            code = ErrorCode.CHECK_VIOLATION;
            message = "Data violates a check constraint";
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("sqlState", sqlState);
        details.put("constraint", constraint);
        Throwable root = ex != null ?  NestedExceptionUtils.getMostSpecificCause(ex) : null;
        details.put("cause", Optional.ofNullable(root)
                .map(Throwable::getMessage).orElse(null));

        return build(status, code, message, req, ex, details);
    }

    @ExceptionHandler({ jakarta.persistence.OptimisticLockException.class, StaleObjectStateException.class })
    public ResponseEntity<ApiError> handleOptimisticLock(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ErrorCode.OPTIMISTIC_LOCK, "Concurrent update detected. Please retry.", req,
                ex, null);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ApiError> handleTxSystem(TransactionSystemException ex, HttpServletRequest req) {
        Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
        if (root instanceof ConstraintViolationException cve) {
            return handleConstraintViolation(cve, req);
        }
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                root != null ? root.getMessage() : ex.getMessage(), req, ex, null);
    }

    // --------- Auth / Security ---------
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, "Invalid username or password", req, ex, null);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiError> handleDisabled(DisabledException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_DISABLED, "Account is disabled. Please verify your email.",
                req, ex, null);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiError> handleLocked(LockedException ex, HttpServletRequest req) {
        return build(HttpStatus.valueOf(423), ErrorCode.ACCOUNT_LOCKED,
                "Account is locked due to multiple failed attempts. Try later.", req, ex, null);
    }

    @ExceptionHandler(AccountExpiredException.class)
    public ResponseEntity<ApiError> handleAccountExpired(AccountExpiredException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_EXPIRED, "Account expired", req, ex, null);
    }

    @ExceptionHandler(CredentialsExpiredException.class)
    public ResponseEntity<ApiError> handleCredentialsExpired(CredentialsExpiredException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.CREDENTIALS_EXPIRED,
                "Credentials expired. Please reset your password.", req, ex, null);
    }

    // If code throws this (e.g. @PreAuthorize), map it too
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Insufficient permissions", req, ex, null);
    }

    // --------- Uploads (optional) ---------
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUpload(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        Map<String, Object> details = Map.of("message", ex.getMessage());
        return build(HttpStatus.PAYLOAD_TOO_LARGE, ErrorCode.VALIDATION_ERROR, "Upload too large", req, ex, details);
    }

    // --------- 404 for unknown routes (enable props below) ---------
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNoHandler(NoHandlerFoundException ex, HttpServletRequest req) {
        Map<String, Object> details = Map.of("method", ex.getHttpMethod(), "url", ex.getRequestURL());
        return build(HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR, "No handler found", req, ex, details);
    }

    // --------- Fallback ---------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, ex.getMessage(), req, ex, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR,
                ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred", req, ex, null);
    }

    // --------- Helpers ---------
    private ResponseEntity<ApiError> build(HttpStatus status, ErrorCode code, String message,
            HttpServletRequest req, Throwable ex, Map<String, Object> extraDetails) {
        Map<String, Object> details = new LinkedHashMap<>();
        // Always include method + query string for quick debugging
        details.put("method", req.getMethod());
        String qs = req.getQueryString();
        if (qs != null && !qs.isBlank())
            details.put("query", qs);
        if (extraDetails != null)
            details.putAll(extraDetails);

        String exceptionClass = null;
        String rootMsg = null;
        if (includeDebug && ex != null) {
            exceptionClass = ex.getClass().getName();
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            rootMsg = root != null ? root.getClass().getName() + ": " + root.getMessage() : null;
        }

        String traceId = Optional.ofNullable(req.getHeader("X-Correlation-Id"))
                .filter(s -> !s.isBlank())
                .orElseGet(() -> MDC.get("X-Correlation-Id"));

        var body = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code.name(),
                message,
                req.getRequestURI(),
                traceId,
                exceptionClass,
                rootMsg,
                details.isEmpty() ? null : details);
        return new ResponseEntity<>(body, status);
    }

    private static String extractJsonPath(MismatchedInputException mie) {
        if (mie.getPath() == null || mie.getPath().isEmpty())
            return null;
        StringBuilder sb = new StringBuilder();
        for (JsonMappingException.Reference ref : mie.getPath()) {
            if (ref.getFieldName() != null) {
                sb.append('.').append(ref.getFieldName());
            } else if (ref.getIndex() >= 0) {
                sb.append('[').append(ref.getIndex()).append(']');
            }
        }
        String path = sb.toString();
        return path.startsWith(".") ? path.substring(1) : path;
    }

    private static <T extends Throwable> T findCause(Throwable ex, Class<T> type) {
        Throwable cur = ex;
        while (cur != null) {
            if (type.isInstance(cur))
                return type.cast(cur);
            cur = cur.getCause();
        }
        return null;
    }
}