package erp_project.erp_project.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {
    
    @Value("${app.file.upload-dir:uploads/notice-attachments}")
    private String uploadDir;
    
    @Value("${app.file.max-size:10485760}") // 10MB
    private long maxFileSize;
    
    @Value("${app.file.allowed-extensions:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,mp4,mp3,zip}")
    private String allowedExtensions;
    
    /**
     * 파일 저장
     */
    public String storeFile(MultipartFile file) throws IOException {
        // 파일 유효성 검사
        validateFile(file);
        
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 날짜별 하위 디렉토리 생성
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path datePath = uploadPath.resolve(dateDir);
        if (!Files.exists(datePath)) {
            Files.createDirectories(datePath);
        }
        
        // 고유한 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String storedFilename = generateUniqueFilename(fileExtension);
        
        // 파일 저장
        Path targetLocation = datePath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // 상대 경로 반환 (날짜 디렉토리 포함)
        String relativePath = dateDir + "/" + storedFilename;
        
        log.info("파일 저장 완료: 원본={}, 저장={}, 경로={}", originalFilename, storedFilename, relativePath);
        return relativePath;
    }
    
    /**
     * 파일 삭제
     */
    public boolean deleteFile(String filePath) {
        try {
            Path fullPath = Paths.get(uploadDir, filePath);
            if (Files.exists(fullPath)) {
                Files.delete(fullPath);
                log.info("파일 삭제 완료: {}", filePath);
                return true;
            } else {
                log.warn("삭제할 파일이 존재하지 않음: {}", filePath);
                return false;
            }
        } catch (IOException e) {
            log.error("파일 삭제 실패: {}", filePath, e);
            return false;
        }
    }
    
    /**
     * 파일 존재 여부 확인
     */
    public boolean fileExists(String filePath) {
        Path fullPath = Paths.get(uploadDir, filePath);
        return Files.exists(fullPath);
    }
    
    /**
     * 파일 크기 조회
     */
    public long getFileSize(String filePath) throws IOException {
        Path fullPath = Paths.get(uploadDir, filePath);
        if (Files.exists(fullPath)) {
            return Files.size(fullPath);
        }
        return 0;
    }
    
    /**
     * 파일 MIME 타입 조회
     */
    public String getMimeType(String filePath) throws IOException {
        Path fullPath = Paths.get(uploadDir, filePath);
        if (Files.exists(fullPath)) {
            return Files.probeContentType(fullPath);
        }
        return "application/octet-stream";
    }
    
    /**
     * 파일 유효성 검사
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("파일 크기가 너무 큽니다. 최대 " + (maxFileSize / 1024 / 1024) + "MB까지 허용됩니다.");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 유효하지 않습니다.");
        }
        
        String fileExtension = getFileExtension(originalFilename);
        if (!isAllowedExtension(fileExtension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. 허용된 형식: " + allowedExtensions);
        }
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
    
    /**
     * 허용된 확장자인지 확인
     */
    private boolean isAllowedExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            return false;
        }
        String[] allowed = allowedExtensions.split(",");
        for (String allowedExt : allowed) {
            if (allowedExt.trim().equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 고유한 파일명 생성
     */
    private String generateUniqueFilename(String fileExtension) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return uuid + "_" + timestamp + "." + fileExtension;
    }
    
    /**
     * 파일 경로로부터 파일명 추출
     */
    public String getFilenameFromPath(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }
        return Paths.get(filePath).getFileName().toString();
    }
    
    /**
     * 파일 경로로부터 원본 파일명 추출 (UUID 제거)
     */
    public String getOriginalFilenameFromStored(String storedFilename) {
        if (storedFilename == null || storedFilename.isEmpty()) {
            return "";
        }
        
        // UUID_timestamp.extension 형식에서 extension 부분만 추출
        int lastDotIndex = storedFilename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return storedFilename;
        }
        
        String extension = storedFilename.substring(lastDotIndex);
        return "file" + extension;
    }
    
    /**
     * 업로드 디렉토리 경로 반환
     */
    public String getUploadDir() {
        return uploadDir;
    }
}
