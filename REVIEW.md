# REVIEW.md

## Review Code & Feedback

### 1. Function Executor Terlalu Besar

Function `ExecuteWorkflow()` saat ini menangani banyak tanggung jawab sekaligus:

- traversal DAG
- retry execution
- database persistence
- realtime event broadcasting
- orchestration concurrency

Sebaiknya dipisah menjadi beberapa service/helper agar lebih mudah di-maintain dan di-test.

---

### 2. Hardcoded Configuration

Beberapa nilai seperti:

- retry count
- timeout
- backoff duration

masih hardcoded di source code.

Akan lebih baik jika dipindahkan ke environment variable atau configuration file agar lebih fleksibel.

---

### 3. Logging Masih Sederhana

Saat ini logging masih menggunakan `fmt.Println`.

Untuk production environment, sebaiknya menggunakan structured logging agar:
- lebih mudah debugging
- searchable
- lebih mudah integrasi observability tools

Contoh:
- zap
- logrus
- zerolog

---

### 4. Error Handling Bisa Ditingkatkan

Beberapa operasi database dan realtime event masih mengabaikan error.

Idealnya:
- error dicatat secara konsisten
- critical error dipropagate
- failure memiliki retry policy jika diperlukan

---

### 5. Concurrency Safety

Project sudah menggunakan goroutine dan mutex dengan baik.

Namun shared mutable state tetap perlu diperhatikan secara hati-hati untuk menghindari:
- race condition
- deadlock
- inconsistent workflow state

---

### 6. Realtime Layer

Penggunaan SSE cukup tepat untuk MVP karena:
- implementasi lebih sederhana
- lightweight
- cukup untuk realtime monitoring satu arah

Namun jika ke depan membutuhkan:
- bidirectional communication
- collaborative editing
- realtime control

maka WebSocket bisa dipertimbangkan.

---

### 7. Architecture Trade-Off

Project sudah cukup baik dalam menjaga keseimbangan antara:
- simplicity
- scalability
- delivery speed

Keputusan untuk tidak overengineering pada MVP merupakan trade-off yang masuk akal untuk batas waktu assessment.
