package queue

type Job struct {
	WorkflowID uint
}

var JobQueue = make(chan Job, 100)

func Enqueue(job Job) {
	JobQueue <- job
}
