package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NoticeService {
    
    private final NoticeRepository noticeRepository;
    private final NoticeTargetGroupRepository targetGroupRepository;
    private final NoticeTargetMappingRepository mappingRepository;
    private final NoticeReadStatusRepository readStatusRepository;
    private final NoticeAttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    private final TargetGroupCalculationService calculationService;
    private final BranchesRepository branchesRepository;
    
    /**
     * 공지사항 생성
     */
    public Notice createNotice(Notice notice, List<Long> targetGroupIds) {
        // 공지사항 저장
        Notice savedNotice = noticeRepository.save(notice);
        
        // 대상 그룹 매핑 생성
        if (targetGroupIds != null && !targetGroupIds.isEmpty()) {
            for (Long targetGroupId : targetGroupIds) {
                NoticeTargetMapping mapping = NoticeTargetMapping.builder()
                    .noticeId(savedNotice.getId())
                    .targetGroupId(targetGroupId)
                    .build();
                mappingRepository.save(mapping);
            }
        }
        
        log.info("공지사항 생성 완료: ID={}, 제목={}", savedNotice.getId(), savedNotice.getTitle());
        return savedNotice;
    }
    
    /**
     * 공지사항 수정
     */
    public Notice updateNotice(Long noticeId, Notice notice, List<Long> targetGroupIds) {
        Notice existingNotice = noticeRepository.findById(noticeId)
            .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 공지사항 정보 업데이트
        existingNotice.setTitle(notice.getTitle());
        existingNotice.setContent(notice.getContent());
        existingNotice.setCategory(notice.getCategory());
        existingNotice.setPriority(notice.getPriority());
        existingNotice.setStatus(notice.getStatus());
        existingNotice.setIsImportant(notice.getIsImportant());
        existingNotice.setIsPublic(notice.getIsPublic());
        existingNotice.setStartDate(notice.getStartDate());
        existingNotice.setEndDate(notice.getEndDate());
        
        Notice updatedNotice = noticeRepository.save(existingNotice);
        
        // 기존 매핑 삭제 후 새로 생성
        mappingRepository.deleteByNoticeId(noticeId);
        if (targetGroupIds != null && !targetGroupIds.isEmpty()) {
            for (Long targetGroupId : targetGroupIds) {
                NoticeTargetMapping mapping = NoticeTargetMapping.builder()
                    .noticeId(noticeId)
                    .targetGroupId(targetGroupId)
                    .build();
                mappingRepository.save(mapping);
            }
        }
        
        log.info("공지사항 수정 완료: ID={}, 제목={}", updatedNotice.getId(), updatedNotice.getTitle());
        return updatedNotice;
    }
    
    /**
     * 공지사항 삭제
     */
    public void deleteNotice(Long noticeId) {
        // 첨부파일 삭제
        List<NoticeAttachment> attachments = attachmentRepository.findByNoticeId(noticeId);
        for (NoticeAttachment attachment : attachments) {
            fileStorageService.deleteFile(attachment.getFilePath());
        }
        
        // 관련 데이터 삭제
        attachmentRepository.deleteByNoticeId(noticeId);
        readStatusRepository.deleteByNoticeId(noticeId);
        mappingRepository.deleteByNoticeId(noticeId);
        noticeRepository.deleteById(noticeId);
        
        log.info("공지사항 삭제 완료: ID={}", noticeId);
    }
    
    /**
     * 공지사항 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long noticeId) {
        try {
            noticeRepository.incrementViewCount(noticeId);
            log.info("공지사항 조회수 증가 완료: noticeId={}", noticeId);
        } catch (Exception e) {
            log.error("공지사항 조회수 증가 실패: noticeId={}", noticeId, e);
            throw new RuntimeException("조회수 증가 실패", e);
        }
    }
    
    /**
     * 공지사항 조회 (조회수 증가)
     */
    @Transactional(readOnly = true)
    public Notice getNoticeById(Long noticeId, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
            .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 조회수 증가
        noticeRepository.incrementViewCount(noticeId);
        notice.setViewCount(notice.getViewCount() + 1);
        
        // 읽음 상태 업데이트
        if (userId != null) {
            markAsRead(noticeId, userId);
        }
        
        return notice;
    }
    
    /**
     * 공지사항 목록 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public Page<Notice> getNoticesWithFilters(
            Notice.NoticeCategory category,
            Notice.NoticeStatus status,
            Boolean isImportant,
            String searchTerm,
            Long branchId,
            Pageable pageable) {
        
        String branchName = null;
        if (branchId != null) {
            Optional<Branches> branch = branchesRepository.findById(branchId);
            if (branch.isPresent()) {
                branchName = branch.get().getBranchName();
            }
        }
        
        return noticeRepository.findNoticesWithFilters(category, status, isImportant, searchTerm, branchId, branchName, pageable);
    }
    
    /**
     * 사용자용 공지사항 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Notice> getNoticesForUser(Long userId) {
        return noticeRepository.findNoticesForUser(LocalDateTime.now());
    }
    
    /**
     * 공지사항 읽음 처리
     */
    public void markAsRead(Long noticeId, Long userId) {
        Optional<NoticeReadStatus> existingStatus = readStatusRepository.findByNoticeIdAndUserId(noticeId, userId);
        
        if (existingStatus.isPresent()) {
            NoticeReadStatus status = existingStatus.get();
            if (!status.getIsRead()) {
                status.markAsRead();
                readStatusRepository.save(status);
            }
        } else {
            NoticeReadStatus newStatus = NoticeReadStatus.builder()
                .noticeId(noticeId)
                .userId(userId)
                .isRead(true)
                .readAt(LocalDateTime.now())
                .build();
            readStatusRepository.save(newStatus);
        }
    }
    
    /**
     * 사용자의 읽지 않은 공지사항 수 조회
     */
    @Transactional(readOnly = true)
    public Long getUnreadNoticeCount(Long userId) {
        return readStatusRepository.countUnreadNoticesByUserId(userId);
    }
    
    /**
     * 대상 그룹 관리
     */
    public NoticeTargetGroup createTargetGroup(NoticeTargetGroup targetGroup) {
        // 기본값 설정
        if (targetGroup.getStatus() == null) {
            targetGroup.setStatus(NoticeTargetGroup.TargetGroupStatus.active);
        }
        
        // 인원수 계산
        int memberCount = calculationService.calculateMemberCount(targetGroup);
        targetGroup.setMemberCount(memberCount);
        
        return targetGroupRepository.save(targetGroup);
    }
    
    public NoticeTargetGroup updateTargetGroup(Long targetGroupId, NoticeTargetGroup targetGroup) {
        NoticeTargetGroup existingGroup = targetGroupRepository.findById(targetGroupId)
            .orElseThrow(() -> new RuntimeException("대상 그룹을 찾을 수 없습니다: " + targetGroupId));
        
        existingGroup.setName(targetGroup.getName());
        existingGroup.setDescription(targetGroup.getDescription());
        existingGroup.setTargetBranches(targetGroup.getTargetBranches());
        existingGroup.setTargetPositions(targetGroup.getTargetPositions());
        existingGroup.setStatus(targetGroup.getStatus());
        
        // 인원수 재계산
        int memberCount = calculationService.calculateMemberCount(existingGroup);
        existingGroup.setMemberCount(memberCount);
        
        return targetGroupRepository.save(existingGroup);
    }
    
    public void deleteTargetGroup(Long targetGroupId) {
        // 관련 매핑 삭제
        mappingRepository.deleteByTargetGroupId(targetGroupId);
        targetGroupRepository.deleteById(targetGroupId);
    }
    
    @Transactional(readOnly = true)
    public List<NoticeTargetGroup> getAllTargetGroups() {
        return targetGroupRepository.findActiveTargetGroups();
    }
    
    /**
     * 인원수 계산 서비스 노출
     */
    public TargetGroupCalculationService getCalculationService() {
        return calculationService;
    }
    
    /**
     * 예약 발행 처리 (스케줄러에서 호출)
     */
    public void processScheduledNotices() {
        List<Notice> scheduledNotices = noticeRepository.findScheduledNoticesToPublish(LocalDateTime.now());
        
        for (Notice notice : scheduledNotices) {
            notice.setStatus(Notice.NoticeStatus.published);
            noticeRepository.save(notice);
            log.info("예약 발행 완료: ID={}, 제목={}", notice.getId(), notice.getTitle());
        }
    }
    
    /**
     * 만료된 공지사항 처리 (스케줄러에서 호출)
     */
    public void processExpiredNotices() {
        List<Notice> expiredNotices = noticeRepository.findExpiredNotices(LocalDateTime.now());
        
        for (Notice notice : expiredNotices) {
            notice.setStatus(Notice.NoticeStatus.archived);
            noticeRepository.save(notice);
            log.info("만료 공지사항 보관 완료: ID={}, 제목={}", notice.getId(), notice.getTitle());
        }
    }
    
    // ========== 파일 첨부 관련 메서드 ==========
    
    /**
     * 공지사항에 파일 첨부
     */
    public NoticeAttachment attachFile(Long noticeId, MultipartFile file) throws IOException {
        // 공지사항 존재 확인
        noticeRepository.findById(noticeId)
            .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 파일 저장
        String filePath = fileStorageService.storeFile(file);
        
        // 파일 정보 추출
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        
        // 첨부파일 엔티티 생성
        NoticeAttachment attachment = NoticeAttachment.builder()
            .noticeId(noticeId)
            .originalFilename(originalFilename)
            .storedFilename(fileStorageService.getFilenameFromPath(filePath))
            .filePath(filePath)
            .fileSize(file.getSize())
            .fileType(NoticeAttachment.getFileTypeFromExtension(fileExtension))
            .mimeType(NoticeAttachment.getMimeTypeFromExtension(fileExtension))
            .fileExtension(fileExtension)
            .build();
        
        NoticeAttachment savedAttachment = attachmentRepository.save(attachment);
        
        log.info("파일 첨부 완료: 공지사항ID={}, 파일명={}", noticeId, originalFilename);
        return savedAttachment;
    }
    
    /**
     * 공지사항의 첨부파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<NoticeAttachment> getNoticeAttachments(Long noticeId) {
        return attachmentRepository.findByNoticeIdAndIsActiveTrue(noticeId);
    }
    
    /**
     * 첨부파일 ID로 조회
     */
    @Transactional(readOnly = true)
    public NoticeAttachment getAttachmentById(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다: " + attachmentId));
    }
    
    /**
     * 첨부파일 다운로드 (다운로드 수 증가)
     */
    public NoticeAttachment downloadAttachment(Long attachmentId) {
        NoticeAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다: " + attachmentId));
        
        if (!attachment.getIsActive()) {
            throw new RuntimeException("삭제된 첨부파일입니다: " + attachmentId);
        }
        
        // 다운로드 수 증가
        attachment.incrementDownloadCount();
        attachmentRepository.save(attachment);
        
        log.info("첨부파일 다운로드: ID={}, 파일명={}", attachmentId, attachment.getOriginalFilename());
        return attachment;
    }
    
    /**
     * 첨부파일 삭제
     */
    public void deleteAttachment(Long attachmentId) {
        NoticeAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다: " + attachmentId));
        
        // 파일 시스템에서 삭제
        fileStorageService.deleteFile(attachment.getFilePath());
        
        // 데이터베이스에서 삭제
        attachmentRepository.delete(attachment);
        
        log.info("첨부파일 삭제 완료: ID={}, 파일명={}", attachmentId, attachment.getOriginalFilename());
    }
    
    /**
     * 공지사항의 모든 첨부파일 삭제
     */
    public void deleteAllAttachments(Long noticeId) {
        List<NoticeAttachment> attachments = attachmentRepository.findByNoticeId(noticeId);
        
        for (NoticeAttachment attachment : attachments) {
            fileStorageService.deleteFile(attachment.getFilePath());
            attachmentRepository.delete(attachment);
        }
        
        log.info("공지사항의 모든 첨부파일 삭제 완료: 공지사항ID={}", noticeId);
    }
    
    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
