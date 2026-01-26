package com.blog.service.admin;

public interface AdminUsersModerationService {
    void banUser(Long userId, String currentUsername);

    void unbanUser(Long userId, String currentUsername);

    void deleteUser(Long userId, String currentUsername);

    void deleteUserAndAllContent(Long userId);

}
