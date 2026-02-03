package com.blog.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blog.exception.JsonWriteException;

@Service
public class MediaStorageService {

    private static final String UPLOAD_DIR = "uploads";

    public List<String> store(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<String> paths = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path destination = Paths.get(UPLOAD_DIR).resolve(filename);

            try {
                Files.createDirectories(destination.getParent());
                Files.copy(
                        file.getInputStream(),
                        destination,
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new JsonWriteException("Failed to store media", e);
            }

            paths.add("/api/uploads/" + filename);
        }

        return paths;
    }

    public void delete(List<String> mediaPaths) {
        if (mediaPaths == null || mediaPaths.isEmpty())
            return;

        for (String path : mediaPaths) {
            try {
                // "/api/uploads/abc.jpg" → "uploads/abc.jpg"
                String filename = path.replace("/api/uploads/", "");

                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);

                Files.deleteIfExists(filePath);

            } catch (IOException e) {
                // Log only, don't crash update
                System.err.println("Failed to delete file: " + path);
            }
        }
    }

}
