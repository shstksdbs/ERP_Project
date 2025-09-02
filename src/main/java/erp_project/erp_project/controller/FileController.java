package erp_project.erp_project.controller;

import erp_project.erp_project.entity.NoticeAttachment;
import erp_project.erp_project.service.FileStorageService;
import erp_project.erp_project.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileController {
    
    private final NoticeService noticeService;
    private final FileStorageService fileStorageService;
    
    /**
     * 공지사항에 파일 첨부
     */
    @PostMapping("/notice/{noticeId}/attach")
    public ResponseEntity<NoticeAttachment> attachFile(
            @PathVariable Long noticeId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            NoticeAttachment attachment = noticeService.attachFile(noticeId, file);
            return ResponseEntity.ok(attachment);
        } catch (IOException e) {
            log.error("파일 첨부 실패: noticeId={}, filename={}", noticeId, file.getOriginalFilename(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("파일 첨부 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항의 첨부파일 목록 조회
     */
    @GetMapping("/notice/{noticeId}/attachments")
    public ResponseEntity<List<NoticeAttachment>> getNoticeAttachments(@PathVariable Long noticeId) {
        try {
            List<NoticeAttachment> attachments = noticeService.getNoticeAttachments(noticeId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            log.error("첨부파일 목록 조회 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 첨부파일 다운로드
     */
    @GetMapping("/download/{attachmentId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long attachmentId) {
        try {
            NoticeAttachment attachment = noticeService.downloadAttachment(attachmentId);
            
            // 파일 경로 생성
            Path filePath = Paths.get(fileStorageService.getUploadDir(), attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                log.error("파일을 읽을 수 없습니다: {}", attachment.getFilePath());
                return ResponseEntity.notFound().build();
            }
            
            // Content-Type 설정
            String contentType = attachment.getMimeType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            log.error("파일 URL 오류: attachmentId={}", attachmentId, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("파일 다운로드 오류: attachmentId={}", attachmentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 첨부파일 미리보기 (이미지 등)
     */
    @GetMapping("/preview/{attachmentId}")
    public ResponseEntity<Resource> previewFile(@PathVariable Long attachmentId) {
        try {
            NoticeAttachment attachment = noticeService.getAttachmentById(attachmentId);
            
            if (!attachment.getIsActive()) {
                return ResponseEntity.notFound().build();
            }
            
            // 이미지 파일만 미리보기 허용
            if (attachment.getFileType() != NoticeAttachment.FileType.image) {
                return ResponseEntity.badRequest().build();
            }
            
            // 파일 경로 생성
            Path filePath = Paths.get(fileStorageService.getUploadDir(), attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                log.error("파일을 읽을 수 없습니다: {}", attachment.getFilePath());
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("파일 미리보기 오류: attachmentId={}", attachmentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 첨부파일 삭제
     */
    @DeleteMapping("/attachment/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        try {
            noticeService.deleteAttachment(attachmentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("첨부파일 삭제 오류: attachmentId={}", attachmentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공지사항의 모든 첨부파일 삭제
     */
    @DeleteMapping("/notice/{noticeId}/attachments")
    public ResponseEntity<Void> deleteAllAttachments(@PathVariable Long noticeId) {
        try {
            noticeService.deleteAllAttachments(noticeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("공지사항 첨부파일 전체 삭제 오류: noticeId={}", noticeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 파일 정보 조회
     */
    @GetMapping("/attachment/{attachmentId}/info")
    public ResponseEntity<NoticeAttachment> getAttachmentInfo(@PathVariable Long attachmentId) {
        try {
            NoticeAttachment attachment = noticeService.getAttachmentById(attachmentId);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            log.error("첨부파일 정보 조회 오류: attachmentId={}", attachmentId, e);
            return ResponseEntity.notFound().build();
        }
    }
}
