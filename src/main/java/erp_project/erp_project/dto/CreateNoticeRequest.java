package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Notice;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateNoticeRequest {
    private String title;
    private String content;
    private Notice.NoticeCategory category;
    private Notice.NoticePriority priority;
    private Notice.NoticeStatus status;
    private Boolean isImportant;
    private Boolean isPublic;
    // authorId는 백엔드에서 자동으로 설정됨
    private List<Long> targetGroupIds;
}
