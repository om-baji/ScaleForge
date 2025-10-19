package handlers

import "log"

func HandleError(err error) {
	if err != nil {
		log.Fatal("An error occurred", err.Error())
	}
}
