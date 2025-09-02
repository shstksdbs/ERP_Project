package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Notice;
import erp_project.erp_project.entity.NoticeTargetMapping;
import erp_project.erp_project.entity.NoticeAttachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {
    private Long id;
    private String title;
    private String content;
    private Notice.NoticeCategory category;
    private Notice.NoticePriority priority;
    private Notice.NoticeStatus status;
    private Boolean isImportant;
    private Boolean isPublic;
    private Long authorId;
    private String authorRealName;
    private String authorEmail;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<NoticeTargetMapping> targetGroups;
    private List<NoticeAttachment> attachments;
    private Integer attachmentCount;
}
