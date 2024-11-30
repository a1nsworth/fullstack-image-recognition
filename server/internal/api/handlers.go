package api

import (
	"fmt"

	"awesomeProject/internal/image"
	"awesomeProject/internal/neuralnetwork"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

var nn neuralnetwork.NeuralNetwork

func PredictHandler(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to upload image"})
		return
	}

	uniqueFileName := uuid.New().String() + ".png"

	filePath := "assets/images/" + uniqueFileName

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(400, gin.H{"error": "Failed to save image"})
		return
	}

	img, err := image.LoadImage(filePath)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to load image"})
		return
	}

	img = image.ResizeImage(img, 200, 200)

	inputs, _, _ := image.ImageToArray(img)

	output := nn.Predict(inputs)

	c.JSON(
		200, gin.H{
			"predictions": gin.H{
				"angry":       output[0],
				"clown":       output[1],
				"crying":      output[2],
				"cute":        output[3],
				"embrassment": output[4],
				"lovely":      output[5],
				"rich":        output[6],
				"sad":         output[7],
				"smiley":      output[8],
				"vigilant":    output[9],
			},
		},
	)
}

func TrainHandler(c *gin.Context) {
	var request struct {
		HiddenNeurons []int   `json:"hiddenNeurons"`
		OutputNeurons int     `json:"outputNeurons"`
		LearningRate  float64 `json:"learningRate"`
		Activation    string  `json:"activation"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	nn = neuralnetwork.NeuralNetwork{
		InputNeurons:  200 * 200,
		HiddenNeurons: request.HiddenNeurons,
		OutputNeurons: request.OutputNeurons,
		LearningRate:  request.LearningRate,
		Activation:    neuralnetwork.ActivationFunctions[request.Activation],
	}
	nn.Initialize()

	data, err := image.LoadDataFromFolder("study/")
	if err != nil {
		fmt.Println("Ошибка при загрузке данных:", err)
		c.JSON(400, gin.H{"status": "Ошибка при загрузке данных:" + err.Error()})
		return
	}
	nn.Train(data, 100)

	c.JSON(200, gin.H{"status": "Model trained"})
}
