// Mail service removed for Railway deployment.
// Previously this module used a third-party email provider. Email
// functionality has been intentionally removed and all email flows
// (OTP verification, password reset via email) have been disabled.

export const sendOtpEmail = async () => {
  // noop
}

export const sendTempPasswordEmail = async () => {
  // noop
}

export const sendResetEmail = async () => {
  // noop
}
