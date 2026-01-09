package com.blog.mapper;

import com.blog.dto.ReportResponse;
import com.blog.entity.ReportEntity;

public class ReportMapper {
    public static ReportResponse toResponse(ReportEntity report) {
        return new ReportResponse(
                report.getId(),
                report.getReportedBy().getUsername(),
                report.getTargetId(),
                report.getType(),
                report.getReason(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}