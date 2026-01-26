package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blog.entity.ReportEntity;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity, Long> {
    List<ReportEntity> findByReportedBy_Id(Long reportedById);
    List<ReportEntity> findByStatus(String status);
    List<ReportEntity> findByType(String type);
    List<ReportEntity> findByTargetId(Long targetId);
    boolean existsByReportedBy_IdAndTargetIdAndType(Long reportedById, Long targetId, String type);
    boolean existsByReportedByIdAndTargetId(Long reporterId, Long targetUserId);
    void deleteAllByTargetIdAndType(Long blogId,String type);


}
