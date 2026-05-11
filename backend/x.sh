TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg1NTI0MjYsInJvbGUiOiJhZG1pbiIsInRlbmFudF9pZCI6MiwidXNlcl9pZCI6Mn0.dGNoJH8UJ_HLDiUhi6xRfaKP71cLxD_KO7zrGaOR4mk"

curl -v --no-buffer --http1.1 \
-H "Authorization: Bearer $TOKEN" \
-H "Accept: text/event-stream" \
http://localhost:8080/events