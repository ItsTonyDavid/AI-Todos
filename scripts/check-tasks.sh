#!/bin/bash
# Check Firestore for tasks assigned to Tron

# Get access token (requires gcloud or firebase-cli)
# For now, use anonymous approach or REST directly

# Firestore REST endpoint
PROJECT_ID="tron-ai-489914"
COLLECTION="tasks"

# Query: where assignee = "Tron" and status = "pending"
# Using Firestore REST API
curl -s "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?where=assignee%3D%22Tron%22&where=status%3D%22pending%22" \
  -H "Content-Type: application/json" | jq -r '.documents[] .fields.title.stringValue' 2>/dev/null
