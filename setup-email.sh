#!/bin/bash

# SyncNexa Identity - Email Setup Script
# This script helps set up email configuration for development and production

set -e

RESET='\033[0m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

echo -e "${BLUE}======================================${RESET}"
echo -e "${BLUE}SyncNexa Identity - Email Setup${RESET}"
echo -e "${BLUE}======================================${RESET}"
echo ""

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo -e "${YELLOW}Creating .env.development file...${RESET}"
    cat > .env.development << 'EOF'
# Development Environment
NODE_ENV=development

# Email Configuration (choose one provider)
# 1. Mock mode (logs to console, no email server needed)
EMAIL_PROVIDER=mock
EMAIL_FROM=noreply@syncnexa.dev

# 2. MailHog (download from https://github.com/mailhog/MailHog)
# EMAIL_PROVIDER=smtp
# SMTP_HOST=localhost
# SMTP_PORT=1025
# SMTP_SECURE=false
# EMAIL_FROM=test@example.com

# 3. Gmail
# EMAIL_PROVIDER=gmail
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password

# Application URL
APP_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✓ .env.development created${RESET}"
else
    echo -e "${GREEN}✓ .env.development already exists${RESET}"
fi

echo ""
echo -e "${BLUE}Email Configuration Options:${RESET}"
echo ""
echo -e "${GREEN}1. Mock Mode (Development)${RESET}"
echo "   - No email server needed"
echo "   - Emails logged to console"
echo "   - Set: EMAIL_PROVIDER=mock"
echo ""

echo -e "${GREEN}2. MailHog (Local Email Server)${RESET}"
echo "   - Download: https://github.com/mailhog/MailHog"
echo "   - Run: ./mailhog"
echo "   - SMTP on localhost:1025"
echo "   - UI on localhost:8025"
echo "   - Set: EMAIL_PROVIDER=smtp, SMTP_HOST=localhost, SMTP_PORT=1025"
echo ""

echo -e "${GREEN}3. Gmail${RESET}"
echo "   - Setup: https://support.google.com/accounts/answer/185833"
echo "   - Set: EMAIL_PROVIDER=gmail"
echo "   - Provide: GMAIL_USER and GMAIL_APP_PASSWORD"
echo ""

echo -e "${GREEN}4. SendGrid${RESET}"
echo "   - Create account: https://sendgrid.com"
echo "   - Set: EMAIL_PROVIDER=sendgrid"
echo "   - Provide: SENDGRID_API_KEY"
echo ""

echo -e "${GREEN}5. Mailgun${RESET}"
echo "   - Create account: https://mailgun.com"
echo "   - Set: EMAIL_PROVIDER=mailgun"
echo "   - Provide: MAILGUN_SMTP_HOST, MAILGUN_SMTP_USER, MAILGUN_SMTP_PASSWORD"
echo ""

echo -e "${BLUE}======================================${RESET}"
echo -e "${GREEN}Setup complete!${RESET}"
echo ""
echo -e "${BLUE}Next steps:${RESET}"
echo "1. Edit .env.development with your chosen provider"
echo "2. Read EMAIL_CONFIG.md for detailed instructions"
echo "3. Run: npm run dev"
echo "4. Test email endpoints"
echo ""
echo -e "${BLUE}Documentation:${RESET}"
echo "- Quick Start: EMAIL_SETUP.md"
echo "- Full Config: EMAIL_CONFIG.md"
echo ""
