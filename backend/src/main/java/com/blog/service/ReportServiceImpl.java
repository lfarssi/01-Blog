package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.ReportRequest;
import com.blog.dto.ReportResponse;
import com.blog.entity.ReportEntity;
import com.blog.entity.UserEntity;
// import com.blog.exception.ResourceAlreadyExistsException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.mapper.ReportMapper;
import com.blog.repository.BlogRepository;
import com.blog.repository.ReportRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

        private final ReportRepository reportRepository;
        private final UserRepository userRepository;
        private final BlogRepository blogRepository; // ✅ add

        // @Autowired
        private UserServiceImpl userService; // To get UserEntity by ID

        private void validateTargetExists(String type, Long targetId) {
                if (targetId == null) {
                        throw new ResourceNotFoundException("Target id is required");
                }

                switch (type == null ? "" : type.toUpperCase()) {
                        case "BLOG" -> {
                                // If you have soft delete like isDeleted/hidden, check it here too.
                                boolean exists = blogRepository.existsById(targetId);
                                if (!exists)
                                        throw new ResourceNotFoundException("Blog not found");
                        }
                        case "USER" -> {
                                boolean exists = userRepository.existsById(targetId);
                                if (!exists)
                                        throw new ResourceNotFoundException("User not found");
                        }
                        default -> throw new ResourceNotFoundException("Unknown report type: " + type);
                }
        }

        @Override
        @Transactional
        public ReportResponse createReport(ReportRequest request, String username) {
                UserEntity reporter = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // ✅ block reporting deleted targets
                validateTargetExists(request.type(), request.targetId());

                // (optional) prevent duplicate reports again
                // if (reportRepository.existsByReportedBy_IdAndTargetIdAndType(
                // reporter.getId(), request.targetId(), request.type())) {
                // throw new ResourceAlreadyExistsException("You have already reported this
                // content");
                // }

                ReportEntity report = ReportEntity.builder()
                                .reportedBy(reporter)
                                .targetId(request.targetId())
                                .type(request.type())
                                .reason(request.reason())
                                .status("PENDING")
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .build();

                return ReportMapper.toResponse(reportRepository.save(report));
        }

        @Override
        public boolean hasReportedUser(Long targetUserId, String reporterUsername) {
                UserEntity reporter = userService.findByUsername(reporterUsername)
                                .orElseThrow(() -> new UsernameNotFoundException("Reporter not found"));

                return reportRepository.existsByReportedByIdAndTargetId(
                                reporter.getId(), targetUserId);
        }

        @Override
        public List<ReportResponse> getAllReports() {
                return reportRepository.findAll().stream()
                                .map(ReportMapper::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<ReportResponse> getReportsByStatus(String status) {
                return reportRepository.findByStatus(status).stream()
                                .map(ReportMapper::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<ReportResponse> getReportsByType(String type) {
                return reportRepository.findByType(type).stream()
                                .map(ReportMapper::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void updateReportStatus(Long reportId, String status) {
                ReportEntity report = reportRepository.findById(reportId)
                                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

                report.setStatus(status);
                report.setUpdatedAt(Instant.now());
                reportRepository.save(report);
        }

        @Override
        @Transactional
        public void deleteReport(Long reportId) {
                ReportEntity report = reportRepository.findById(reportId)
                                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

                reportRepository.delete(report);
        }
}
