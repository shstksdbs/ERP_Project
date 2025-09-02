package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice_attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeAttachment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "notice_id", nullable = false)
    private Long noticeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", insertable = false, updatable = false)
    private Notice notice;
    
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;
    
    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;
    
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", columnDefinition = "ENUM('image', 'document', 'video', 'audio', 'archive', 'other') DEFAULT 'other'")
    private FileType fileType;
    
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @Column(name = "file_extension", length = 10)
    private String fileExtension;
    
    @Column(name = "download_count", nullable = false)
    private Integer downloadCount;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (downloadCount == null) {
            downloadCount = 0;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void incrementDownloadCount() {
        this.downloadCount++;
    }
    
    public enum FileType {
        image,      // 이미지 (jpg, png, gif, webp 등)
        document,   // 문서 (pdf, doc, docx, xls, xlsx, ppt, pptx 등)
        video,      // 비디오 (mp4, avi, mov 등)
        audio,      // 오디오 (mp3, wav, aac 등)
        archive,    // 압축파일 (zip, rar, 7z 등)
        other       // 기타
    }
    
    /**
     * 파일 확장자로부터 파일 타입 결정
     */
    public static FileType getFileTypeFromExtension(String extension) {
        if (extension == null) return FileType.other;
        
        String ext = extension.toLowerCase();
        
        if (ext.matches("(jpg|jpeg|png|gif|bmp|webp|svg|ico)")) {
            return FileType.image;
        } else if (ext.matches("(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)")) {
            return FileType.document;
        } else if (ext.matches("(mp4|avi|mov|wmv|flv|webm|mkv)")) {
            return FileType.video;
        } else if (ext.matches("(mp3|wav|aac|flac|ogg|wma)")) {
            return FileType.audio;
        } else if (ext.matches("(zip|rar|7z|tar|gz)")) {
            return FileType.archive;
        } else {
            return FileType.other;
        }
    }
    
    /**
     * 파일 확장자로부터 MIME 타입 결정
     */
    public static String getMimeTypeFromExtension(String extension) {
        if (extension == null) return "application/octet-stream";
        
        String ext = extension.toLowerCase();
        
        switch (ext) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "svg":
                return "image/svg+xml";
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls":
                return "application/vnd.ms-excel";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt":
                return "application/vnd.ms-powerpoint";
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt":
                return "text/plain";
            case "mp4":
                return "video/mp4";
            case "mp3":
                return "audio/mpeg";
            case "zip":
                return "application/zip";
            default:
                return "application/octet-stream";
        }
    }
}
