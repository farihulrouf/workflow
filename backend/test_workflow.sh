
#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg0OTU4MjgsInJvbGUiOiJBRE1JTiIsInRlbmFudF9pZCI6MiwidXNlcl9pZCI6Mn0.KOfMxvRuYJja46wKFsfjkw-W02mv9o9c_ZbLduNmUpU"

BASE_URL="http://localhost:8080"

echo "===================================="
echo "1. CREATE WORKFLOW"
echo "===================================="

CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/workflows \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "name": "Test Workflow",
  "definition": {
    "nodes": [
      {
        "id": "A",
        "type": "task",
        "action": "first"
      },
      {
        "id": "B",
        "type": "task",
        "action": "second"
      }
    ],
    "edges": [
      {
        "from": "A",
        "to": "B"
      }
    ]
  }
}')

echo $CREATE_RESPONSE

echo ""
echo "===================================="
echo "2. GET WORKFLOW ID"
echo "===================================="

WORKFLOW_ID=$(echo $CREATE_RESPONSE | grep -o '"ID":[0-9]*' | head -1 | cut -d':' -f2)

echo "Workflow ID: $WORKFLOW_ID"

echo ""
echo "===================================="
echo "3. RUN WORKFLOW"
echo "===================================="

RUN_RESPONSE=$(curl -s -X POST \
$BASE_URL/workflows/$WORKFLOW_ID/run \
-H "Authorization: Bearer $TOKEN")

echo $RUN_RESPONSE

echo ""
echo "===================================="
echo "4. WAIT WORKFLOW PROCESS"
echo "===================================="

sleep 5

echo ""
echo "===================================="
echo "5. GET ALL WORKFLOW RUNS"
echo "===================================="

RUNS_RESPONSE=$(curl -s \
$BASE_URL/workflow-runs \
-H "Authorization: Bearer $TOKEN")

echo $RUNS_RESPONSE

echo ""
echo "===================================="
echo "6. GET RUN ID"
echo "===================================="

RUN_ID=$(echo $RUNS_RESPONSE | grep -o '"ID":[0-9]*' | head -1 | cut -d':' -f2)

echo "Run ID: $RUN_ID"

echo ""
echo "===================================="
echo "7. GET RUN DETAIL"
echo "===================================="

DETAIL_RESPONSE=$(curl -s \
$BASE_URL/workflow-runs/$RUN_ID \
-H "Authorization: Bearer $TOKEN")

echo $DETAIL_RESPONSE

echo ""
echo "===================================="
echo "DONE"
echo "===================================="

