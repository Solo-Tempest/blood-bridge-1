package com.bloodbridge.api.service;

import com.bloodbridge.api.entity.enums.UrgencyLevel;
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

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

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

    @Async
    public void sendBloodRequestNotification(String toEmail, String donorName,
                                              String bloodGroup, int units,
                                              UrgencyLevel urgency, String hospitalCity,
                                              double distanceKm, String responseToken) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            String subject = urgency == UrgencyLevel.CRITICAL
                    ? "CRITICAL: " + bloodGroup + " blood needed urgently near you!"
                    : "Blood Request: " + bloodGroup + " blood needed near you";
            helper.setSubject(subject);
            helper.setText(buildNotificationEmailBody(donorName, bloodGroup, units, urgency, hospitalCity, distanceKm, responseToken), true);
            mailSender.send(msg);
            log.info("Blood request notification sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send blood request notification to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildNotificationEmailBody(String donorName, String bloodGroup, int units,
                                               UrgencyLevel urgency, String hospitalCity,
                                               double distanceKm, String responseToken) {
        String urgencyColor = switch (urgency) {
            case CRITICAL -> "#dc2626";
            case URGENT   -> "#ea580c";
            case NORMAL   -> "#16a34a";
        };
        String urgencyLabel = urgency.name().charAt(0) + urgency.name().substring(1).toLowerCase();

        return """
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;
                        background:#fff;border-radius:12px;border:1px solid #f0d0d0;">
              <div style="text-align:center;margin-bottom:20px;">
                <span style="font-size:36px;">🩸</span>
                <h2 style="color:#dc2626;margin:8px 0 4px;font-size:22px;">Blood Bridge</h2>
                <p style="color:#6b7280;font-size:13px;margin:0;">Emergency Blood Request Alert</p>
              </div>
              <div style="text-align:center;margin-bottom:20px;">
                <span style="background:%s;color:#fff;padding:6px 20px;border-radius:20px;
                             font-size:12px;font-weight:700;letter-spacing:1px;">%s</span>
              </div>
              <p style="color:#374151;font-size:15px;margin:0 0 12px;">Hi %s,</p>
              <p style="color:#374151;font-size:14px;margin:0 0 20px;line-height:1.5;">
                A hospital near you urgently needs blood. You are a compatible donor — your response could save a life.
              </p>
              <div style="background:#fef2f2;border-radius:10px;padding:20px;margin-bottom:20px;">
                <table style="width:100%%;border-collapse:collapse;">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #fecaca;">Blood Group</td>
                    <td style="color:#dc2626;font-size:20px;font-weight:900;text-align:right;border-bottom:1px solid #fecaca;">%s</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #fecaca;">Units Required</td>
                    <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #fecaca;">%d unit(s)</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280;font-size:13px;padding:8px 0;border-bottom:1px solid #fecaca;">Location</td>
                    <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #fecaca;">%s</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280;font-size:13px;padding:8px 0;">Distance from you</td>
                    <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;">~%.1f km</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin-bottom:24px;">
                <p style="color:#374151;font-size:14px;margin:0 0 16px;font-weight:600;">
                  Respond directly from this email — no login required.
                </p>
                <div style="text-align:center;">
                  <a href="%s/api/donor/respond?token=%s&action=ACCEPT"
                     style="background:#16a34a;color:#fff;padding:12px 0;border-radius:9px;
                            font-size:14px;font-weight:700;text-decoration:none;display:inline-block;
                            width:140px;text-align:center;margin-right:32px;">
                    Accept
                  </a>
                  <a href="%s/api/donor/respond?token=%s&action=DECLINE"
                     style="background:#dc2626;color:#fff;padding:12px 0;border-radius:9px;
                            font-size:14px;font-weight:700;text-decoration:none;display:inline-block;
                            width:140px;text-align:center;">
                    Decline
                  </a>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">
                  Hospital name and contact details are revealed only after you accept.
                </p>
              </div>
              <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;line-height:1.6;">
                You received this because you are registered as an available donor on Blood Bridge.<br>
                To stop receiving these alerts, set yourself as unavailable in your donor profile.
              </p>
            </div>
            """.formatted(urgencyColor, urgencyLabel, donorName, bloodGroup, units, hospitalCity, distanceKm,
                    baseUrl, responseToken, baseUrl, responseToken);
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
