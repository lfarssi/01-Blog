package com.blog.helper;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public final class MediaValidator {

    private static final int MAX_MEDIA_COUNT = 4;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    // Only allow these declared MIME types (still useful, but not enough alone)
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
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Empty file is not allowed");
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("File too large: " + safeName(file));
            }

            String ct = file.getContentType();
            if (ct == null || !ALLOWED_TYPES.contains(ct)) {
                throw new IllegalArgumentException("Unsupported media type: " + ct);
            }

            // ✅ REAL validation: check file signature (magic bytes)
            if (!matchesSignature(file, ct)) {
                throw new IllegalArgumentException(
                        "File content does not match declared type (" + ct + "): " + safeName(file)
                );
            }
        }
    }

    private static String safeName(MultipartFile f) {
        return f.getOriginalFilename() == null ? "unknown" : f.getOriginalFilename();
    }

    private static boolean matchesSignature(MultipartFile file, String contentType) {
        try (InputStream in = file.getInputStream()) {
            byte[] header = in.readNBytes(64); // enough for common formats
            if (header.length < 12) return false;

            return switch (contentType) {
                case "image/png" -> isPng(header);
                case "image/jpeg" -> isJpeg(header);
                case "image/gif" -> isGif(header);
                case "image/webp" -> isWebp(header);
                case "video/mp4" -> isMp4(header);
                case "video/webm" -> isWebm(header);
                default -> false;
            };
        } catch (IOException e) {
            return false;
        }
    }

    // ---------- signatures ----------
    private static boolean isPng(byte[] h) {
        // 89 50 4E 47 0D 0A 1A 0A
        return h[0] == (byte) 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47
                && h[4] == 0x0D && h[5] == 0x0A && h[6] == 0x1A && h[7] == 0x0A;
    }

    private static boolean isJpeg(byte[] h) {
        // FF D8 FF
        return (h[0] == (byte) 0xFF) && (h[1] == (byte) 0xD8) && (h[2] == (byte) 0xFF);
    }

    private static boolean isGif(byte[] h) {
        // "GIF87a" or "GIF89a"
        return h[0] == 'G' && h[1] == 'I' && h[2] == 'F'
                && h[3] == '8' && (h[4] == '7' || h[4] == '9') && h[5] == 'a';
    }

    private static boolean isWebp(byte[] h) {
        // "RIFF" .... "WEBP"
        return h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';
    }

    private static boolean isMp4(byte[] h) {
        // MP4 has "ftyp" at offset 4 typically (not always, but common)
        return h[4] == 'f' && h[5] == 't' && h[6] == 'y' && h[7] == 'p';
    }

    private static boolean isWebm(byte[] h) {
        // EBML header: 1A 45 DF A3
        return (h[0] == (byte) 0x1A) && (h[1] == (byte) 0x45) && (h[2] == (byte) 0xDF) && (h[3] == (byte) 0xA3);
    }
}
