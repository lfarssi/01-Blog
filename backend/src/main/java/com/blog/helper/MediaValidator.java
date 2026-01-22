package com.blog.helper;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public final class MediaValidator {

    private static final int MAX_MEDIA_COUNT = 4;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    private static final List<String> ALLOWED_TYPES = List.of(
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm"
    );

    private MediaValidator() {}

    public static void validate(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return;

        if (files.size() > MAX_MEDIA_COUNT) {
            throw new IllegalArgumentException("Maximum 4 media files allowed");
        }

        for (MultipartFile file : files) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("File too large: " + file.getOriginalFilename());
            }

            if (!ALLOWED_TYPES.contains(file.getContentType())) {
                throw new IllegalArgumentException("Unsupported media type");
            }
        }
    }
}
