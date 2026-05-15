package com.bloodbridge.api.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtp(String toEmail, String otp) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Blood Bridge — Your OTP Code");
            helper.setText(buildEmailBody(otp), true);
            mailSender.send(msg);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailBody(String otp) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                        background:#fff;border-radius:12px;border:1px solid #f0d0d0;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="font-size:36px;">🩸</span>
                <h2 style="color:#dc2626;margin:8px 0 4px;font-size:22px;">Blood Bridge</h2>
                <p style="color:#6b7280;font-size:13px;margin:0;">Your one-time verification code</p>
              </div>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;
                          padding:24px;text-align:center;margin-bottom:24px;">
                <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Enter this code to verify your account</p>
                <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#dc2626;">
                  %s
                </div>
                <p style="color:#9ca3af;font-size:11px;margin:10px 0 0;">
                  Valid for 5 minutes &nbsp;·&nbsp; Do not share this code
                </p>
              </div>
              <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">
                If you did not request this, please ignore this email.
              </p>
            </div>
            """.formatted(otp);
    }
}
