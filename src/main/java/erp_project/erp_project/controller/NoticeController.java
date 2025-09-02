package erp_project.erp_project.controller;

import erp_project.erp_project.dto.NoticeResponse;
import erp_project.erp_project.entity.Notice;
import erp_project.erp_project.entity.NoticeTargetGroup;
import erp_project.erp_project.entity.NoticeAttachment;
import erp_project.erp_project.entity.Branches;
import erp_project.erp_project.service.NoticeService;
import erp_project.erp_project.service.UserService;
import erp_project.erp_project.repository.BranchesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NoticeController {
    
    private final NoticeService noticeService;
    private final BranchesRepository branchesRepository;
    private final UserService userService;
    
    /**
     * 공지사항 목록 조회 (관리자용)
     */
    @GetMapping
    public ResponseEntity<Page<NoticeResponse>> getNotices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isImportant,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Notice.NoticeCategory noticeCategory = category != null ? 
                Notice.NoticeCategory.valueOf(category.toUpperCase()) : null;
            Notice.NoticeStatus noticeStatus = status != null ? 
                Notice.NoticeStatus.valueOf(status.toUpperCase()) : null;
            
            Page<Notice> notices = noticeService.getNoticesWithFilters(
                noticeCategory, noticeStatus, isImportant, searchTerm, branchId, pageable);
            
            // Notice 엔티티를 NoticeResponse DTO로 변환
            Page<NoticeResponse> noticeResponses = notices.map(notice -> {
                NoticeResponse response = NoticeResponse.builder()
                    .id(notice.getId())
                    .title(notice.getTitle())
                    .content(notice.getContent())
                    .category(notice.getCategory())
                    .priority(notice.getPriority())
                    .status(notice.getStatus())
                    .isImportant(notice.getIsImportant())
                    .isPublic(notice.getIsPublic())
                    .authorId(notice.getAuthorId())
                    .viewCount(notice.getViewCount())
                    .createdAt(notice.getCreatedAt())
                    .updatedAt(notice.getUpdatedAt())
                    .build();
                
                // 작성자 정보 추가
                if (notice.getAuthor() != null) {
                    response.setAuthorRealName(notice.getAuthor().getRealName());
                    response.setAuthorEmail(notice.getAuthor().getEmail());
                }
                
                // 대상 그룹 정보 추가
                response.setTargetGroups(notice.getTargetMappings());
                
                // 첨부파일 정보 추가
                List<NoticeAttachment> attachments = noticeService.getNoticeAttachments(notice.getId());
                response.setAttachments(attachments);
                response.setAttachmentCount(attachments.size());
                
                return response;
            });
            
            return ResponseEntity.ok(noticeResponses);
        } catch (Exception e) {
            log.error("공지사항 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeResponse> getNoticeById(
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long userId) {
        
        try {
            Notice notice = noticeService.getNoticeById(noticeId, userId);
            
            // Notice 엔티티를 NoticeResponse DTO로 변환
            NoticeResponse response = NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .category(notice.getCategory())
                .priority(notice.getPriority())
                .status(notice.getStatus())
                .isImportant(notice.getIsImportant())
                .isPublic(notice.getIsPublic())
                .authorId(notice.getAuthorId())
                .viewCount(notice.getViewCount())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
            
            // 작성자 정보 추가
            if (notice.getAuthor() != null) {
                response.setAuthorRealName(notice.getAuthor().getRealName());
                response.setAuthorEmail(notice.getAuthor().getEmail());
            }
            
            // 대상 그룹 정보 추가
            response.setTargetGroups(notice.getTargetMappings());
            
            // 첨부파일 정보 추가
            List<NoticeAttachment> attachments = noticeService.getNoticeAttachments(notice.getId());
            response.setAttachments(attachments);
            response.setAttachmentCount(attachments.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("공지사항 상세 조회 오류: noticeId={}", noticeId, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 공지사항 생성
     */
    @PostMapping
    public ResponseEntity<Notice> createNotice(
            @RequestBody CreateNoticeRequest request) {
        
        try {
            // 현재 사용자 정보 가져오기 (임시로 1번 사용자)
            var currentUser = userService.getCurrentUser();
            
            Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus())
                .isImportant(request.getIsImportant())
                .isPublic(request.getIsPublic())
                .authorId(currentUser.getId()) // 현재 사용자 ID로 설정
                .build();
            
            Notice createdNotice = noticeService.createNotice(notice, request.getTargetGroupIds());
            return ResponseEntity.ok(createdNotice);
        } catch (Exception e) {
            log.error("공지사항 생성 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항 수정
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<Notice> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody UpdateNoticeRequest request) {
        
        try {
            Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus())
                .isImportant(request.getIsImportant())
                .isPublic(request.getIsPublic())
                .build();
            
            Notice updatedNotice = noticeService.updateNotice(noticeId, notice, request.getTargetGroupIds());
            return ResponseEntity.ok(updatedNotice);
        } catch (Exception e) {
            log.error("공지사항 수정 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long noticeId) {
        try {
            noticeService.deleteNotice(noticeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("공지사항 삭제 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사용자용 공지사항 목록 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notice>> getNoticesForUser(@PathVariable Long userId) {
        try {
            List<Notice> notices = noticeService.getNoticesForUser(userId);
            return ResponseEntity.ok(notices);
        } catch (Exception e) {
            log.error("사용자 공지사항 목록 조회 오류: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항 조회수 증가
     */
    @PostMapping("/{noticeId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long noticeId) {
        try {
            noticeService.incrementViewCount(noticeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("공지사항 조회수 증가 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항 읽음 처리
     */
    @PostMapping("/{noticeId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long noticeId,
            @RequestParam Long userId) {
        
        try {
            noticeService.markAsRead(noticeId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("공지사항 읽음 처리 오류: noticeId={}, userId={}", noticeId, userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 읽지 않은 공지사항 수 조회
     */
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadNoticeCount(@PathVariable Long userId) {
        try {
            Long count = noticeService.getUnreadNoticeCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("읽지 않은 공지사항 수 조회 오류: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 대상 그룹 목록 조회
     */
    @GetMapping("/target-groups")
    public ResponseEntity<List<NoticeTargetGroup>> getTargetGroups() {
        try {
            List<NoticeTargetGroup> targetGroups = noticeService.getAllTargetGroups();
            return ResponseEntity.ok(targetGroups);
        } catch (Exception e) {
            log.error("대상 그룹 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 대상 그룹 생성
     */
    @PostMapping("/target-groups")
    public ResponseEntity<NoticeTargetGroup> createTargetGroup(
            @RequestBody NoticeTargetGroup targetGroup) {
        try {
            NoticeTargetGroup createdGroup = noticeService.createTargetGroup(targetGroup);
            return ResponseEntity.ok(createdGroup);
        } catch (Exception e) {
            log.error("대상 그룹 생성 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 대상 그룹 수정
     */
    @PutMapping("/target-groups/{targetGroupId}")
    public ResponseEntity<NoticeTargetGroup> updateTargetGroup(
            @PathVariable Long targetGroupId,
            @RequestBody NoticeTargetGroup targetGroup) {
        try {
            NoticeTargetGroup updatedGroup = noticeService.updateTargetGroup(targetGroupId, targetGroup);
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            log.error("대상 그룹 수정 오류: targetGroupId={}", targetGroupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 대상 그룹 삭제
     */
    @DeleteMapping("/target-groups/{targetGroupId}")
    public ResponseEntity<Void> deleteTargetGroup(@PathVariable Long targetGroupId) {
        try {
            noticeService.deleteTargetGroup(targetGroupId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("대상 그룹 삭제 오류: targetGroupId={}", targetGroupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 테스트용 샘플 대상 그룹 생성
     */
    @PostMapping("/target-groups/sample")
    public ResponseEntity<String> createSampleTargetGroups() {
        try {
            // 전체 직원 그룹
            NoticeTargetGroup allGroup = NoticeTargetGroup.builder()
                .name("전체 직원")
                .description("모든 지점의 전체 직원을 대상으로 하는 공지")
                .targetBranches("[]")
                .targetPositions("[]")
                .memberCount(0)
                .status(NoticeTargetGroup.TargetGroupStatus.active)
                .build();
            noticeService.createTargetGroup(allGroup);
            
            // 지점장급 이상 그룹
            NoticeTargetGroup managerGroup = NoticeTargetGroup.builder()
                .name("지점장급 이상")
                .description("지점장급 이상 직원 대상")
                .targetBranches("[]")
                .targetPositions("[\"MANAGER\"]")
                .memberCount(0)
                .status(NoticeTargetGroup.TargetGroupStatus.active)
                .build();
            noticeService.createTargetGroup(managerGroup);
            
            // 서울 지점 그룹
            NoticeTargetGroup seoulGroup = NoticeTargetGroup.builder()
                .name("서울 지점 직원")
                .description("서울 지역 지점 직원만 대상")
                .targetBranches("[\"서울점\", \"강남점\", \"홍대점\"]")
                .targetPositions("[]")
                .memberCount(0)
                .status(NoticeTargetGroup.TargetGroupStatus.active)
                .build();
            noticeService.createTargetGroup(seoulGroup);
            
            return ResponseEntity.ok("샘플 대상 그룹이 생성되었습니다.");
        } catch (Exception e) {
            log.error("샘플 대상 그룹 생성 오류", e);
            return ResponseEntity.internalServerError().body("샘플 데이터 생성 실패: " + e.getMessage());
        }
    }
    
    /**
     * 지점 목록 조회 (대상 그룹 설정용) - 본사 제외
     */
    @GetMapping("/branches")
    public ResponseEntity<List<Branches>> getBranches() {
        try {
            // 본사를 제외한 활성 지점만 조회
            List<Branches> branches = branchesRepository.findByStatusAndBranchTypeNot(
                Branches.BranchStatus.active, 
                Branches.BranchType.headquarters
            );
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            log.error("지점 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // DTO 클래스들
    public static class CreateNoticeRequest {
        private String title;
        private String content;
        private Notice.NoticeCategory category;
        private Notice.NoticePriority priority;
        private Notice.NoticeStatus status;
        private Boolean isImportant;
        private Boolean isPublic;
        private Long authorId;
        private java.time.LocalDateTime startDate;
        private java.time.LocalDateTime endDate;
        private List<Long> targetGroupIds;
        
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public Notice.NoticeCategory getCategory() { return category; }
        public void setCategory(Notice.NoticeCategory category) { this.category = category; }
        
        public Notice.NoticePriority getPriority() { return priority; }
        public void setPriority(Notice.NoticePriority priority) { this.priority = priority; }
        
        public Notice.NoticeStatus getStatus() { return status; }
        public void setStatus(Notice.NoticeStatus status) { this.status = status; }
        
        public Boolean getIsImportant() { return isImportant; }
        public void setIsImportant(Boolean isImportant) { this.isImportant = isImportant; }
        
        public Boolean getIsPublic() { return isPublic; }
        public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
        
        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
        
        public java.time.LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(java.time.LocalDateTime startDate) { this.startDate = startDate; }
        
        public java.time.LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(java.time.LocalDateTime endDate) { this.endDate = endDate; }
        
        public List<Long> getTargetGroupIds() { return targetGroupIds; }
        public void setTargetGroupIds(List<Long> targetGroupIds) { this.targetGroupIds = targetGroupIds; }
    }
    
    public static class UpdateNoticeRequest {
        private String title;
        private String content;
        private Notice.NoticeCategory category;
        private Notice.NoticePriority priority;
        private Notice.NoticeStatus status;
        private Boolean isImportant;
        private Boolean isPublic;
        private java.time.LocalDateTime startDate;
        private java.time.LocalDateTime endDate;
        private List<Long> targetGroupIds;
        
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public Notice.NoticeCategory getCategory() { return category; }
        public void setCategory(Notice.NoticeCategory category) { this.category = category; }
        
        public Notice.NoticePriority getPriority() { return priority; }
        public void setPriority(Notice.NoticePriority priority) { this.priority = priority; }
        
        public Notice.NoticeStatus getStatus() { return status; }
        public void setStatus(Notice.NoticeStatus status) { this.status = status; }
        
        public Boolean getIsImportant() { return isImportant; }
        public void setIsImportant(Boolean isImportant) { this.isImportant = isImportant; }
        
        public Boolean getIsPublic() { return isPublic; }
        public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
        
        public java.time.LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(java.time.LocalDateTime startDate) { this.startDate = startDate; }
        
        public java.time.LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(java.time.LocalDateTime endDate) { this.endDate = endDate; }
        
        public List<Long> getTargetGroupIds() { return targetGroupIds; }
        public void setTargetGroupIds(List<Long> targetGroupIds) { this.targetGroupIds = targetGroupIds; }
    }
}
