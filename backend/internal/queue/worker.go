package queue

import (
	"log"
	"time"
)

func StartWorker() {

	go func() {

		for {
			job := <-JobQueue

			log.Println("processing workflow:", job.WorkflowID)

			time.Sleep(5 * time.Second)

			log.Println("workflow completed:", job.WorkflowID)
		}
	}()
}
