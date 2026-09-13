# Product Requirements Document (PRD)

## Product: AI Email Phishing & Forensics System

**Working name:** `MailSleuth AI`
**Version:** 1.0
**Product type:** AI-powered cybersecurity / email-forensics platform
**Primary input:** `.eml` email file
**Primary output:** Threat verdict + evidence + forensic investigation report

---

# 1. Product Overview

MailSleuth AI is a cybersecurity platform that analyzes suspicious emails and determines whether they are legitimate, phishing, spoofed, or part of a Business Email Compromise (BEC) attack.

Instead of simply classifying an email as `spam/not spam`, the system performs a **multi-stage investigation**.

It examines:

* Email headers
* Sender identity
* SPF/DKIM/DMARC authentication
* Received-server chain
* IP addresses
* URLs
* Domains
* Email content
* Attachments
* Threat-intelligence data
* Machine-learning predictions

An LLM then acts as an **AI security investigator**, combining the collected evidence into an explainable investigation.

The final result is a forensic report containing:

* Risk score
* Attack classification
* Evidence
* Indicators of compromise (IOCs)
* Attack timeline
* Explanation
* Recommended response actions

---

# 2. Problem Statement

Organizations receive a huge number of emails every day.

Attackers use email to perform:

* Credential phishing
* Identity spoofing
* Executive impersonation
* Business Email Compromise
* Malware delivery
* Financial fraud

Traditional email filtering often focuses on whether an email is spam or malicious.

However, security analysts investigating a suspicious email need to answer much more complicated questions:

> Who actually sent this email?

> Did the sender pass email authentication?

> What server did the email originate from?

> Is the sender impersonating someone?

> Where do the URLs lead?

> Is the domain suspicious?

> Is the email attempting credential theft?

> Is this a BEC attack?

> What infrastructure is associated with the attack?

> What evidence supports the conclusion?

> What should the security team do next?

Currently, answering these questions can require multiple tools and significant manual investigation.

### Problem

**Build an AI-powered system that automatically performs the initial forensic investigation of a suspicious email and produces an evidence-backed security report.**

---

# 3. Goal

The primary goal is:

> **Turn a suspicious `.eml` file into an explainable cybersecurity investigation.**

Input:

```text
suspicious_email.eml
```

Output:

```text
Threat Verdict
+
Risk Score
+
Attack Type
+
Evidence
+
IOCs
+
Timeline
+
Recommended Actions
```

---

# 4. Non-Goals

The first version will **not** attempt to:

* Automatically delete emails
* Automatically block domains
* Automatically disable accounts
* Automatically reset passwords
* Automatically contact victims
* Perform offensive security operations
* Execute suspicious attachments on a host machine
* Replace a full enterprise SIEM/SOC

The system is primarily an **analysis and decision-support tool**.

---

# 5. Target Users

## Primary User — SOC Analyst

A security analyst receives a suspicious email from an employee.

They upload:

```text
email.eml
```

The system performs the initial investigation.

---

## Secondary User — Security Engineer

Uses the platform to investigate:

* Phishing campaigns
* Suspicious domains
* BEC attacks
* Email spoofing
* Repeated IOCs

---

## Hackathon Judge

The judge should be able to upload a sample `.eml` and immediately see:

```text
What happened?
Why is it suspicious?
What evidence was found?
What type of attack is it?
What should I do?
```

---

# 6. Core User Journey

```text
                Upload Email
                     │
                     ▼
              Parse .eml file
                     │
                     ▼
             Extract evidence
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Headers      URLs      Content
          │          │          │
          └──────────┼──────────┘
                     ▼
              Threat analysis
                     │
                     ▼
              ML classification
                     │
                     ▼
          Threat intelligence
                     │
                     ▼
              LLM investigation
                     │
                     ▼
             Forensic report
```

---

# 7. Functional Requirements

## FR-1: Email Upload

The system must allow the user to upload an `.eml` file.

### Supported initially

```text
.eml
```

### Future

```text
.msg
.emlx
```

The system should reject unsupported files.

---

# 8. FR-2: Email Parsing

The system must extract the basic email structure.

Example:

```json
{
  "from": "ceo@company.com",
  "to": "employee@company.com",
  "cc": [],
  "subject": "Urgent Payment",
  "date": "...",
  "body": "...",
  "attachments": []
}
```

The parser must preserve the original raw email for forensic reference.

---

# 9. FR-3: Header Extraction

Extract important headers:

```text
From
To
Cc
Bcc
Reply-To
Return-Path
Subject
Date
Message-ID
Received
Authentication-Results
DKIM-Signature
Received-SPF
X-Originating-IP
User-Agent
```

The system should show both:

```text
Raw value
```

and:

```text
Interpreted meaning
```

---

# 10. FR-4: Email Authentication Analysis

The system must analyze:

### SPF

Determine whether the sending server is authorized for the claimed domain.

Possible results:

```text
PASS
FAIL
SOFTFAIL
NEUTRAL
NONE
```

### DKIM

Determine whether the email's cryptographic signature validates.

Possible:

```text
PASS
FAIL
NONE
```

### DMARC

Determine whether sender authentication aligns with the domain policy.

Possible:

```text
PASS
FAIL
NONE
```

---

# 11. FR-5: Sender Analysis

The system should compare:

```text
From
Reply-To
Return-Path
DKIM domain
SPF domain
```

Example:

```text
From:
ceo@company.com

Reply-To:
attacker@gmail.com
```

System should flag:

```text
⚠ Reply-To mismatch
```

---

# 12. FR-6: Received Chain Analysis

Parse all `Received` headers.

Example:

```text
Mail Server A
      ↓
Mail Server B
      ↓
Mail Server C
      ↓
Recipient
```

Extract:

```text
IP
hostname
timestamp
server
country (when available)
ASN (when available)
```

The system should reconstruct the email's apparent delivery path.

---

# 13. FR-7: URL Extraction

Extract all URLs from:

* Plain text
* HTML
* HTML anchors
* Embedded content

Example:

```text
Found URLs: 4

1. https://example.com
2. https://login-example.com
3. https://bit.ly/xxxxx
4. https://192.0.2.10/login
```

---

# 14. FR-8: URL Analysis

For each URL calculate indicators such as:

```text
HTTPS
IP-based URL
URL shortener
Punycode
Unicode characters
Excessive subdomains
Suspicious path
Encoded characters
Redirects
Domain mismatch
```

Example:

```text
URL:
https://company-login.example.com/auth

Risk:
HIGH

Reasons:
• Suspicious domain
• Login-related path
• Recently registered domain
```

---

# 15. FR-9: Domain Analysis

For every extracted domain:

```text
Domain
 ↓
DNS
 ↓
WHOIS / registration information
 ↓
MX
 ↓
A/AAAA
 ↓
NS
 ↓
Certificate information
 ↓
Reputation
```

Extract useful features:

```text
domain age
registrar
nameservers
hosting provider
IP
ASN
TLD
certificate age
```

---

# 16. FR-10: Brand / Impersonation Detection

The system should identify possible impersonation.

Example:

```text
Legitimate:
microsoft.com

Observed:
micros0ft-security.com
```

Potential techniques:

```text
Character substitution
Typosquatting
Punycode
Homoglyphs
Extra words
Look-alike domains
```

Output:

```text
Possible impersonated brand:
Microsoft

Confidence:
87%
```

---

# 17. FR-11: Email Content Analysis

Analyze the body for suspicious behavior.

Indicators include:

### Urgency

```text
URGENT
IMMEDIATELY
ACT NOW
WITHIN 1 HOUR
```

### Credential requests

```text
password
OTP
login
verify account
credentials
```

### Financial requests

```text
transfer money
bank account
invoice
payment
wire transfer
gift card
```

### Social engineering

```text
don't tell anyone
keep this confidential
I'm unavailable
do this immediately
```

---

# 18. FR-12: BEC Detection

The system should specifically detect Business Email Compromise patterns.

Possible indicators:

```text
Executive impersonation
Financial request
Urgency
Secrecy
Payment modification
Supplier/bank-account change
Unusual recipient
Reply-To mismatch
```

Example:

```text
BEC Score: 91%

Indicators:
✓ Executive impersonation
✓ Financial request
✓ Urgency
✓ Secrecy
```

---

# 19. FR-13: Attachment Analysis

For attachments extract:

```text
filename
extension
MIME type
size
SHA-256
```

Example:

```text
invoice.pdf.exe
```

System should detect suspicious patterns such as:

```text
double extensions
executable attachments
macro-enabled documents
unexpected file types
```

For the MVP, **do not execute attachments**.

---

# 20. FR-14: Feature Engineering

All analysis should produce structured features.

Example:

```json
{
  "spf_pass": false,
  "dkim_pass": false,
  "dmarc_pass": false,
  "reply_to_mismatch": true,
  "suspicious_url": true,
  "domain_age_days": 5,
  "punycode": false,
  "urgent_language": true,
  "financial_request": true,
  "credential_request": false
}
```

These become inputs for the ML model.

---

# 21. FR-15: ML Classification

The ML model should classify the email.

Initial classes:

```text
BENIGN
PHISHING
SPOOFING
BEC
MALWARE
```

Example:

```json
{
  "benign": 0.01,
  "phishing": 0.92,
  "spoofing": 0.87,
  "bec": 0.78,
  "malware": 0.05
}
```

The system should support multi-label classification in later versions.

---

# 22. FR-16: Risk Scoring

Generate a final risk score:

```text
0 ───────────────────────── 100

LOW       MEDIUM       HIGH
```

Example:

```text
Risk Score: 94/100
```

Risk factors should be visible.

```text
Authentication     +25
URL                +20
Domain             +20
Sender mismatch    +15
Content            +10
ML prediction       +4
-----------------------
Total               94
```

The exact scoring mechanism can evolve during development.

---

# 23. FR-17: Threat Intelligence

The system should enrich:

```text
IP addresses
Domains
URLs
File hashes
```

with available threat-intelligence sources.

Possible output:

```text
IOC: suspicious-domain.com

Reputation:
Suspicious

First Seen:
...

Domain Age:
7 days

Threat Reports:
Found
```

The architecture should use adapters so threat-intelligence providers can be replaced easily.

---

# 24. FR-18: IOC Extraction

Extract Indicators of Compromise:

```text
IP addresses
Domains
URLs
Email addresses
File hashes
Message IDs
```

Example:

```text
IOCs

Domains:
attacker-example.com

IPs:
203.0.113.50

URLs:
https://attacker-example.com/login

Hashes:
SHA256: ...
```

---

# 25. FR-19: LLM Investigation

The LLM receives **structured evidence**, not just the raw email.

Example:

```json
{
  "header_analysis": {...},
  "authentication": {...},
  "url_analysis": [...],
  "domain_analysis": [...],
  "content_analysis": {...},
  "ml_results": {...},
  "threat_intelligence": [...]
}
```

The LLM should answer:

```text
1. What happened?
2. What type of attack is this?
3. Who is being impersonated?
4. What evidence supports the conclusion?
5. What are the important IOCs?
6. How confident is the conclusion?
7. What should the SOC analyst do next?
```

---

# 26. FR-20: Evidence-Based Reasoning

This is a **critical requirement**.

The LLM should not invent evidence.

Each finding should have an evidence ID.

Example:

```text
EV-001
SPF failed

EV-002
DKIM failed

EV-003
Reply-To mismatch

EV-004
Suspicious domain

EV-005
Urgent financial request
```

The final explanation references those findings.

---

# 27. FR-21: Forensic Report

Generate a report containing:

## Executive Summary

```text
This email is highly likely to be a
Business Email Compromise attack.
```

## Verdict

```text
MALICIOUS
```

## Risk

```text
94 / 100
```

## Attack Type

```text
BEC
Executive Impersonation
Spoofing
```

## Evidence

```text
SPF failure
DKIM failure
Reply-To mismatch
Suspicious domain
Urgent financial request
```

## IOCs

```text
Domains
IPs
URLs
Hashes
```

## Timeline

```text
Email received
        ↓
Authentication
        ↓
Delivery
        ↓
URL interaction
```

## Recommendations

```text
Block domain
Search for related emails
Investigate affected users
Review authentication logs
```

---

# 28. Dashboard Requirements

The frontend should contain:

### Upload screen

```text
┌─────────────────────────────┐
│                             │
│       Upload .EML           │
│                             │
│      [ Choose File ]        │
│                             │
└─────────────────────────────┘
```

---

### Investigation screen

```text
┌─────────────────────────────────────┐
│ THREAT LEVEL                         │
│                                     │
│ 🔴 HIGH RISK        94 / 100        │
│                                     │
├─────────────────────────────────────┤
│ Attack: BEC / Spoofing              │
├─────────────────────────────────────┤
│ Authentication                      │
│                                     │
│ SPF       ❌ FAIL                   │
│ DKIM      ❌ FAIL                   │
│ DMARC     ❌ FAIL                   │
├─────────────────────────────────────┤
│ URLs                                │
│                                     │
│ 4 detected                          │
│ 2 suspicious                        │
├─────────────────────────────────────┤
│ AI Investigation                    │
│                                     │
│ "This email is likely..."           │
└─────────────────────────────────────┘
```

---

# 29. Technical Architecture

```text
                    USER
                     │
                     ▼
              React / Next.js
                     │
                     ▼
                  FastAPI
                     │
             ┌───────┴───────┐
             ▼               ▼
       Email Parser       Database
             │
             ▼
      Analysis Pipeline
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
 Headers    URLs     Content
     │       │        │
     └───────┼────────┘
             ▼
       Feature Engine
             │
       ┌─────┴──────┐
       ▼            ▼
      Rules         ML
       │            │
       └─────┬──────┘
             ▼
      Threat Intelligence
             │
             ▼
       Evidence Store
             │
             ▼
       LLM Investigator
             │
             ▼
       Report Generator
             │
             ▼
          Dashboard
```

---

# 30. Recommended Technology

| Component        | Technology             |
| ---------------- | ---------------------- |
| Frontend         | React / Next.js        |
| Backend          | Python + FastAPI       |
| Email parsing    | Python `email` library |
| HTML parsing     | BeautifulSoup          |
| ML               | scikit-learn + XGBoost |
| Database         | PostgreSQL             |
| Cache/Queue      | Redis                  |
| LLM              | LLM API / local model  |
| HTTP analysis    | Python HTTP client     |
| DNS              | Python DNS tooling     |
| Reports          | HTML/PDF               |
| Containerization | Docker                 |

---

# 31. Database Design

Basic entities:

```text
Email
 ├── id
 ├── filename
 ├── received_at
 └── raw_email

Header
 ├── email_id
 ├── field
 └── value

URL
 ├── email_id
 ├── url
 ├── domain
 └── risk

Domain
 ├── domain
 ├── age
 ├── reputation
 └── ip

IOC
 ├── type
 ├── value
 └── reputation

Analysis
 ├── email_id
 ├── risk_score
 ├── verdict
 └── attack_type

Evidence
 ├── email_id
 ├── evidence_id
 ├── category
 ├── finding
 └── severity

Report
 ├── email_id
 └── report
```

---

# 32. ML Development Plan

Don't train an advanced neural network initially.

Start with:

```text
Dataset
   ↓
Feature extraction
   ↓
Train/Test split
   ↓
XGBoost
   ↓
Evaluation
```

Metrics:

```text
Accuracy
Precision
Recall
F1
ROC-AUC
Confusion Matrix
```

For cybersecurity, **precision and recall are more informative than accuracy alone**.

---

# 33. Dataset Strategy

Use three sources of data:

### 1. Public datasets

For legitimate and malicious emails.

### 2. Synthetic emails

Create controlled examples such as:

```text
Phishing
BEC
Spoofing
Benign
```

### 3. Manually constructed attack scenarios

For hackathon demonstrations.

For example:

```text
Case 1:
Fake Microsoft login

Case 2:
CEO payment request

Case 3:
Spoofed internal employee

Case 4:
Malicious attachment

Case 5:
Completely legitimate email
```

---

# 34. MVP

The first working version should contain only:

```text
1. Upload .eml
        ↓
2. Parse email
        ↓
3. Extract headers
        ↓
4. Authentication analysis
        ↓
5. Extract URLs
        ↓
6. Basic URL/domain analysis
        ↓
7. Rule-based risk score
        ↓
8. Basic phishing classification
        ↓
9. LLM explanation
        ↓
10. Report
```

This is enough for a functional demo.

---

# 35. Version 2

After MVP:

```text
BEC detection
       +
Threat intelligence
       +
IOC extraction
       +
Attachment analysis
       +
Timeline
       +
ML improvements
```

---

# 36. Version 3 — Hackathon Showcase

Add:

```text
Interactive attack graph

        Attacker
           │
           ▼
      IP Address
           │
           ▼
       Mail Server
           │
           ▼
        Victim
           │
           ▼
      Phishing URL
           │
           ▼
      Fake Login
```

Also add:

* Beautiful dashboard
* Evidence explorer
* IOC search
* Confidence scores
* Explainable AI
* Downloadable forensic report
* Investigation history

---

# 37. Example Final Demo

Judge uploads:

```text
ceo_payment_request.eml
```

Within seconds:

```text
🔴 HIGH RISK

Risk Score
94 / 100

Attack Classification
Business Email Compromise

Authentication
SPF     ❌
DKIM    ❌
DMARC   ❌

Sender Analysis
⚠ Reply-To mismatch

Domain
⚠ Newly registered

Content
⚠ Urgent financial request
⚠ Executive impersonation

ML
BEC probability: 91%

AI Investigation
"The email is highly likely to be an
executive impersonation attack..."

IOCs
• suspicious-domain.com
• 203.x.x.x

Recommended Actions
1. Block domain
2. Search mail logs
3. Investigate recipient
4. Review account activity
```

That gives the judge a **complete story**, rather than just:

```text
Prediction = phishing
```

---

# 38. Success Criteria

The project is successful if:

### Technical

* `.eml` files can be parsed reliably.
* Headers are extracted correctly.
* Authentication signals are analyzed.
* URLs are extracted.
* Domains are enriched.
* ML produces meaningful predictions.
* LLM explanations are grounded in evidence.
* Reports are generated automatically.

### Security

The system should prioritize:

* Explainability
* Evidence
* Low false negatives
* Safe handling of malicious content
* No execution of suspicious attachments
* Clear distinction between facts and inference

### Hackathon

A judge should understand the value within **2–3 minutes**.

---

# 39. The Most Important Design Principle

Your project should **not** be:

```text
             EMAIL
               ↓
          LLM / ML
               ↓
        "This is phishing"
```

Instead:

```text
                    EMAIL
                      │
                      ▼
              ┌──────────────┐
              │ Evidence     │
              │ Collection   │
              └──────┬───────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Headers        URLs          Content
       │             │             │
       └─────────────┼─────────────┘
                     ▼
             Security Analysis
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
        Rules                   ML
          │                     │
          └──────────┬──────────┘
                     ▼
             Threat Intelligence
                     │
                     ▼
              Evidence Graph
                     │
                     ▼
              LLM Investigator
                     │
                     ▼
             FORENSIC REPORT
```

**That's what makes this an Email Forensics + AI project rather than a spam classifier.**

---

## 40. Our development order

And I strongly recommend that **we don't start coding the whole PRD immediately**.

We'll build it together in this exact order:

```text
PHASE 1 — Understand Email
│
├── What is an email?
├── What is .eml?
├── Header vs body
└── Create our first .eml

PHASE 2 — Email Forensics
│
├── Parse .eml
├── Extract headers
├── Received chain
├── From / Reply-To / Return-Path
└── SPF / DKIM / DMARC

PHASE 3 — URL & Domain Intelligence
│
├── Extract URLs
├── Normalize URLs
├── Analyze domains
├── Detect typosquatting
└── Detect suspicious URLs

PHASE 4 — Detection
│
├── Rule engine
├── Risk scoring
├── Phishing detection
├── Spoofing detection
└── BEC detection

PHASE 5 — Machine Learning
│
├── Dataset
├── Features
├── Training
├── Evaluation
└── Classification

PHASE 6 — AI Investigator
│
├── Evidence format
├── LLM prompt
├── Investigation
└── Evidence-grounded explanation

PHASE 7 — Threat Intelligence
│
├── IP enrichment
├── Domain enrichment
├── IOC enrichment
└── Reputation

PHASE 8 — Forensic Report
│
├── Verdict
├── Evidence
├── Timeline
├── IOCs
└── Recommendations

PHASE 9 — Hackathon UI
│
├── Upload
├── Investigation dashboard
├── Attack graph
└── Report download
```
