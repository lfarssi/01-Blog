package com.blog.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;
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
    public ResponseEntity<Object> createReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        ReportResponse response = reportService.createReport(request, username);
        return  ApiResponse.from(200, "Report Created successfully",response);
    }

    @GetMapping
    public ResponseEntity<Object> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return  ApiResponse.from(200, "All Reports Received successfully",reports);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Object> getReportsByStatus(@PathVariable String status) {
        List<ReportResponse> reports = reportService.getReportsByStatus(status);
        return  ApiResponse.from(200, "Report By Status Received successfully",reports);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Object> getReportsByType(@PathVariable String type) {
        List<ReportResponse> reports = reportService.getReportsByType(type);
        return  ApiResponse.from(200, "Report By Type Received successfully",reports);
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<Object> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status) {

        reportService.updateReportStatus(reportId, status);
        return  ApiResponse.from(200, "Report Status updated  successfully",null);
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Object> deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return  ApiResponse.from(200, "Report deleted successfully",null);
    }
}