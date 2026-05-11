package realtime

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

var Redis *redis.Client

// =====================================
// INIT REDIS
// =====================================

func InitRedis() {

	Redis = redis.NewClient(
		&redis.Options{
			Addr: "localhost:6379",
		},
	)

	log.Println("Redis Connected")
}

// =====================================
// PUBLISH EVENT
// =====================================

func PublishEvent(message string) {

	err := Redis.Publish(
		Ctx,
		"workflow_events",
		message,
	).Err()

	if err != nil {

		log.Println(
			"Redis Publish Error:",
			err,
		)
	}
}

// =====================================
// SUBSCRIBE EVENT
// =====================================

func SubscribeEvents() {

	pubsub := Redis.Subscribe(
		Ctx,
		"workflow_events",
	)

	ch := pubsub.Channel()

	log.Println(
		"Redis Subscriber Started",
	)

	for msg := range ch {

		log.Println(
			"Redis Event:",
			msg.Payload,
		)

		Broadcast <- msg.Payload
	}
}
