package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.hospital.DocumentResponse;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.HospitalDocument;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.DocumentType;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.HospitalDocumentRepository;
import com.bloodbridge.api.repository.HospitalRepository;
import com.bloodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final HospitalDocumentRepository documentRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    public List<DocumentResponse> getDocuments(String email) {
        Hospital hospital = resolveHospital(email);
        return documentRepository.findByHospitalOrderByUploadedAtDesc(hospital)
                .stream().map(this::toResponse).toList();
    }

    public DocumentResponse upload(String email, String type, MultipartFile file) {
        Hospital hospital = resolveHospital(email);

        DocumentType docType;
        try {
            docType = DocumentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid document type: " + type, HttpStatus.BAD_REQUEST);
        }

        String ext = getExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "." + ext;

        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(storedName));
        } catch (IOException e) {
            throw new ApiException("Failed to save file", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        HospitalDocument doc = HospitalDocument.builder()
                .hospital(hospital)
                .type(docType)
                .originalName(file.getOriginalFilename())
                .storedName(storedName)
                .fileSize(file.getSize())
                .build();

        return toResponse(documentRepository.save(doc));
    }

    public Resource loadFile(String email, Long docId) {
        Hospital hospital = resolveHospital(email);
        HospitalDocument doc = documentRepository.findByIdAndHospital(docId, hospital)
                .orElseThrow(() -> new ApiException("Document not found", HttpStatus.NOT_FOUND));
        try {
            Path path = Paths.get(uploadDir).resolve(doc.getStoredName());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) throw new ApiException("File not found on server", HttpStatus.NOT_FOUND);
            return resource;
        } catch (MalformedURLException e) {
            throw new ApiException("File not found", HttpStatus.NOT_FOUND);
        }
    }

    private Hospital resolveHospital(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return hospitalRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Hospital not found", HttpStatus.NOT_FOUND));
    }

    private DocumentResponse toResponse(HospitalDocument d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .type(d.getType().name())
                .originalName(d.getOriginalName())
                .fileSize(d.getFileSize())
                .status(d.getStatus().name())
                .uploadedAt(d.getUploadedAt())
                .build();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
