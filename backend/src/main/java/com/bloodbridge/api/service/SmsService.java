package com.bloodbridge.api.service;

// Twilio commented out — OTP delivery is now handled by Firebase Phone Auth on the frontend
// import com.twilio.Twilio;
// import com.twilio.rest.api.v2010.account.Message;
// import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${otp.mode:dev}")
    private String otpMode;

    // @Value("${twilio.account-sid:}")
    // private String accountSid;

    // @Value("${twilio.auth-token:}")
    // private String authToken;

    // @Value("${twilio.phone-number:}")
    // private String twilioPhone;

    @PostConstruct
    public void init() {
        log.info("SmsService: Firebase Phone Auth is active — OTP delivery handled client-side");
    }

    public void sendOtp(String phone, String otp) {
        log.info("==================================================");
        log.info("  [DEV] OTP for +91{}:  {}", phone, otp);
        log.info("==================================================");
    }

    public boolean isDevMode() {
        return true;
    }
}
