package main

import (
	"net/http"
	"sync"

	"github.com/joho/godotenv"
	"github.com/om-baji/cc/handlers"
	"github.com/om-baji/cc/middleware"
	"github.com/om-baji/cc/tcp"
	"github.com/om-baji/cc/utils"
)

func init() {
	err := godotenv.Load()
	handlers.HandleError(err)
}

func main() {

	mux := http.NewServeMux()
	mux.Handle("/health", middleware.LogMiddleware(http.HandlerFunc(handlers.HealthHandler)))

	var wg *sync.WaitGroup

	wg.Add(1)
	go func() {
		utils.Logger().Info("Starting HTTP Server!")
		http.ListenAndServe(":8080", mux)
		wg.Wait()
	}()

	wg.Add(1)
	go func() {
		tcp.StartServer()
		wg.Wait()
	}()

}
