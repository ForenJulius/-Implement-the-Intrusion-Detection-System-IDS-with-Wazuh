# -Implement-the-Intrusion-Detection-System-IDS-with-Wazuh
# 🛡️ Enterprise Host-based IDS & SIEM with Wazuh Architecture

> **Implementation of an Intrusion Detection System (IDS) using Wazuh, Custom Real-time SOC Dashboard, and Role-Based Access Control (RBAC).**

[![Wazuh](https://img.shields.io/badge/Wazuh-v4.x-blue?style=flat-square&logo=wazuh)](https://wazuh.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-emerald?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Wazuh Indexer](https://img.shields.io/badge/Wazuh%20Indexer-OpenSearch-orange?style=flat-square)](https://opensearch.org/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](LICENSE)

---

## 📑 Table of Contents
1. [Brief History](#1-brief-history)
2. [Technical Overview & Architecture](#2-technical-overview--architecture)
3. [Standards & Compliance](#3-standards--compliance)
4. [The Use of this Technology Today](#4-the-use-of-this-technology-today)
5. [Demo & Attack Simulation](#5-demo--attack-simulation)
6. [Full Step-by-Step Installation & Setup Guide](#6-full-step-by-step-installation--setup-guide)

---

## 1. Brief History
- **1980**: James Anderson published the landmark research paper *"Computer Security Threat Monitoring and Surveillance"*, introducing the concept of audit trails and intrusion surveillance.
- **1986**: Dr. Dorothy Denning developed the abstract Intrusion Detection Expert System (IDES) model, which became the baseline for modern anomaly detection engines.
- **1998**: **Snort** was released, establishing the industry standard for open-source Network Intrusion Detection Systems (NIDS).
- **2004**: Daniel Cid created **OSSEC** (Open Source HIDS Security), focusing on host-level log analysis, file integrity monitoring (FIM), and active response.
- **2015**: **Wazuh** was introduced as an enterprise-ready fork of OSSEC. Over the years, Wazuh evolved into a comprehensive SIEM/XDR ecosystem by incorporating OpenSearch/Elasticsearch indexing, cloud monitoring, container security, and global threat intelligence feeds.

---

## 2. Technical Overview & Architecture

### 2.1 Core Architectural Components
- **Wazuh Agent**: Lightweight service running on endpoints (Linux/Windows) performing file integrity monitoring (FIM), system audit logging, rootkit detection, and process analysis.
- **Wazuh Manager (Ports 1514 / 55000)**: Collects encrypted telemetry from agents, runs log decoders and rule engines (Levels 1–15), and triggers automated remediation.
- **Wazuh Indexer (Port 9200)**: Scalable OpenSearch cluster storing indexed security logs under `wazuh-alerts-4.x-*`.
- **Custom SOC Middleware & GUI**:
  - **Backend (Node.js/Express)**: Interacts with the Indexer REST API, manages JWT authentication, and applies strict **Role-Based Access Control (RBAC)** to isolate logs (`data.dstuser` mapping for normal users vs. global visibility for administrators).
  - **Frontend (Vue 3 / Vite)**: Real-time Cyberpunk HUD dashboard mapping Wazuh rule levels into dynamic severity tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), foreign workstation detection, and forensic trace inspection.
```text
+-------------------------------------------------------------+
|                    ATTACKER (Kali Linux)                    |
+-------------------------------------------------------------+
                               | (SSH Brute Force, Port Scan)
                               v
+-------------------------------------------------------------+
|               PROTECTED ENDPOINT (Agent 001)                |
|               [IP: 192.168.1.105 / Host: DESKTOP]           |
|  - Log Collector (/var/log/auth.log, Event Viewer)          |
|  - Wazuh Agent Daemon (Port 1514 Encrypted Queue)           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 WAZUH MANAGER & INDEXER                     |
|  - Manager: Decoders & Ruleset Engine (Levels 1 - 15)        |
|  - Indexer (Port 9200): Indexes wazuh-alerts-4.x-*          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            CUSTOM SOC MIDDLEWARE (Node.js/Express)          |
|  - JWT Authentication (Admin vs User Roles)                 |
|  - RBAC Strict Query Filter: data.dstuser == req.user       |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|             CUSTOM SOC DASHBOARD (Vue 3 Frontend)           |
|  - Dynamic Threat Badges (LOW, MEDIUM, HIGH, CRITICAL)      |
|  - Threat Scanner Modal & Digital Forensic Trace Inspection |
+-------------------------------------------------------------+
```
---

## 3. Standards & Compliance
The detection architecture and rule mappings align with leading cybersecurity frameworks:
- **MITRE ATT&CK**: Maps host event anomalies to recognized adversary techniques (e.g., T1110 - Brute Force).
- **PCI DSS v3.2.1 / v4.0**: Meets regulatory requirements for tracking log access (Requirement 10) and validating system file integrity (Requirement 11.5).
- **NIST SP 800-53 / 800-61**: Satisfies incident tracking, event correlation, and continuous monitoring controls.
- **CIS Benchmarks**: Audits operating system baselines against Center for Internet Security hardening standards.

---

## 4. The Use of this Technology Today
- **Enterprise Security Operations Centers (SOC)**: Functions as a central SIEM/XDR hub to manage thousands of distributed endpoints across hybrid networks.
- **Cloud Infrastructure Defense**: Provides real-time visibility into Kubernetes containers, Docker daemons, and cloud audit logs (AWS CloudTrail, Azure Monitor).
- **Automated Incident Response**: Triggers active response scripts to drop malicious connections via local firewalls (`iptables`/`ufw`) upon detecting suspicious thresholds.
- **Role-Based Isolation (Project Highlight)**: Enables internal users to monitor security events targeting their own accounts while preserving data confidentiality across the organization.

---

## 5. Demo & Verification Scenarios

### 5.1 Verification Scenario 1: RBAC Data Isolation
1. **User Scope**: Users logged into an account (e.g., `T123`) only see security notifications where `data.dstuser` matches their identity.
2. **Admin Scope**: System administrators access global telemetry across all agents, users, and system rules.

### 5.2 Verification Scenario 2: Severity Badge Normalization
Security events mapped from Wazuh rule levels (1–15) are dynamically categorized on the user interface:
- **Level 1 – 4**: `LOW` (System information and standard operational events)
- **Level 5 – 7**: `MEDIUM` (Authentication failures, initial anomalous events)
- **Level 8 – 11**: `HIGH` (Repeated security anomalies, suspicious activity)
- **Level 12 – 15**: `CRITICAL` (System compromise indicators, privilege escalation)

---

## 6. Full Step-by-Step Installation & Setup Guide

### Step 1: Deploy Wazuh Single-Node Architecture
On the dedicated Linux host server (Ubuntu 20.04/22.04 LTS):

```bash
# 1. Update package repositories
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl apt-transport-https lsb-release gnupg2
```

2. Download the official Wazuh installation assistant
```
curl -sO [https://packages.wazuh.com/4.8/wazuh-install.sh](https://packages.wazuh.com/4.8/wazuh-install.sh)
curl -sO [https://packages.wazuh.com/4.8/config.yml](https://packages.wazuh.com/4.8/config.yml)
```

3. Execute the automated single-node installation
```
sudo bash ./wazuh-install.sh -a
```
Save the generated administrative credentials printed in the terminal output.
Step 2: Install and Register the Wazuh Agent
On the monitored client workstation (e.g., 192.168.1.105):
1. Import repository key and add sources
```
curl -s [https://packages.wazuh.com/key/GPG-KEY-WAZUH](https://packages.wazuh.com/key/GPG-KEY-WAZUH) | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] [https://packages.wazuh.com/4.x/apt/](https://packages.wazuh.com/4.x/apt/) stable main" | sudo tee -a /etc/apt/sources.list.d/wazuh.list
sudo apt update
```

2. Install the agent and register to the Manager IP
```
sudo WAZUH_MANAGER="192.168.1.50" WAZUH_AGENT_NAME="DESKTOP-3IB1LUP" apt install wazuh-agent
```
3. Enable and start the agent service
```
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```
Step 3: Run the Custom Node.js Backend
Navigate to the backend directory
```
cd Project/wazuh-dashboard/backend
```
Install package dependencies
```
npm install
```
Configure environment variables
```
cat <<EOF> .env
PORT=5000
INDEXER_URL=https://localhost:9200
INDEXER_USER=admin
INDEXER_PASSWORD=SecretPassword
JWT_SECRET=CyberDefenseSecretKey2026_SecureKey
EOF
```
Start the server
```
npm run dev
# or
node server.js
```
Step 4: Run the Custom Vue 3 Frontend
Open a new terminal tab and navigate to the frontend directory
```
cd Project/wazuh-dashboard/frontend
```
Install dependencies
```
npm install
```
Start the frontend dev server
```
npm run dev
```
Open the dashboard in your browser at: ```http://localhost:5173```
Step 5: System Verification
Log in with Admin credentials: Verify global audit feeds and endpoint connectivity.

Log in with user account:

Access Session Logs: Validate hostname and IP identity verification.

Run Threat Scanner: Confirm that only alerts targeting are visible.

Verify that all severity tags display their corresponding labels (LOW, MEDIUM, HIGH, CRITICAL).
