package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.ReportRequest;
import com.blog.dto.ReportResponse;

import java.util.List;

@Service
public interface ReportService {
    ReportResponse createReport(ReportRequest request, String username);

    List<ReportResponse> getAllReports();

    List<ReportResponse> getReportsByStatus(String status);

    List<ReportResponse> getReportsByType(String type);

    public boolean hasReportedUser(Long reportedUserId, String reporterUsername);

    void updateReportStatus(Long reportId, String status);

    void deleteReport(Long reportId);
}