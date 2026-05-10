TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg0OTU4MjgsInJvbGUiOiJBRE1JTiIsInRlbmFudF9pZCI6MiwidXNlcl9pZCI6Mn0.KOfMxvRuYJja46wKFsfjkw-W02mv9o9c_ZbLduNmUpU"

curl -v --no-buffer --http1.1 \
-H "Authorization: Bearer $TOKEN" \
-H "Accept: text/event-stream" \
http://localhost:8080/events