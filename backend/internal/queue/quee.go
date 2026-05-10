package queue

var JobQueue = make(chan WorkflowJob, 100)

func Enqueue(job WorkflowJob) {
	JobQueue <- job
}
