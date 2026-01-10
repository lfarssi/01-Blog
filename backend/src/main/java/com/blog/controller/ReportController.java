package com.blog.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ReportRequest;
import com.blog.dto.ReportResponse;
import com.blog.service.ReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        ReportResponse response = reportService.createReport(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReportResponse>> getReportsByStatus(@PathVariable String status) {
        List<ReportResponse> reports = reportService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ReportResponse>> getReportsByType(@PathVariable String type) {
        List<ReportResponse> reports = reportService.getReportsByType(type);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<String> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status) {

        reportService.updateReportStatus(reportId, status);
        return ResponseEntity.ok("Report status updated successfully");
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<String> deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok("Report deleted successfully");
    }
}