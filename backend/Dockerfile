# =========================
# BUILD STAGE
# =========================

FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main cmd/main.go

RUN go build -o worker cmd/worker/main.go

# =========================
# FINAL STAGE
# =========================

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/worker .

COPY .env .

EXPOSE 8080

CMD ["./main"]