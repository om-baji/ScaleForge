package database

import (
	"fmt"
	"os"
	"sync"

	"github.com/go-redis/redis"
)

var (
	instance *redis.Client
	once     sync.Once
)

func RedisClient() *redis.Client {
	once.Do(func() {
		host := os.Getenv("REDIS_HOST")
		port := os.Getenv("REDIS_PORT")
		password := os.Getenv("REDIS_PASSWORD")

		addr := fmt.Sprintf("%s:%s", host, port)

		instance = redis.NewClient(&redis.Options{
			Addr:     addr,
			Password: password,
			DB:       0,
		})
	})
	return instance
}
