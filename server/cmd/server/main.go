package main

import (
	"awesomeProject/internal/api"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(
		cors.New(
			cors.Config{
				AllowOrigins:     []string{"*"},
				AllowMethods:     []string{"GET", "POST", "OPTIONS"},
				AllowHeaders:     []string{"Content-Type"},
				AllowCredentials: true,
			},
		),
	)

	r.POST("/predict", api.PredictHandler)
	r.POST("/train", api.TrainHandler)

	r.Run(":8080")
}
