package com.blog.service;


import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.ReportRequest;
import com.blog.dto.ReportResponse;
import com.blog.entity.ReportEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.ResourceAlreadyExistsException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.mapper.ReportMapper;
import com.blog.repository.ReportRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReportResponse createReport(ReportRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (reportRepository.existsByReportedBy_IdAndTargetIdAndType(
                user.getId(), request.targetId(), request.type())) {
            throw new ResourceAlreadyExistsException("You have already reported this content");
        }

        ReportEntity report = ReportEntity.builder()
                .reportedBy(user)
                .targetId(request.targetId())
                .type(request.type())
                .reason(request.reason())
                .status("PENDING")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        report = reportRepository.save(report);
        return ReportMapper.toResponse(report);
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
