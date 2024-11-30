package neuralnetwork

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

type ActivationFunction struct {
	Activate   func(float64) float64
	Derivative func(float64) float64
}

var ActivationFunctions = map[string]ActivationFunction{
	"sigmoid": {
		Activate: func(x float64) float64 {
			return 1.0 / (1.0 + math.Exp(-x))
		},
		Derivative: func(x float64) float64 {
			return x * (1.0 - x)
		},
	},
	"relu": {
		Activate: func(x float64) float64 {
			if x > 0 {
				return x
			}
			return 0
		},
		Derivative: func(x float64) float64 {
			if x > 0 {
				return 1
			}
			return 0
		},
	},
	"linear": {
		Activate: func(x float64) float64 {
			return x
		},
		Derivative: func(x float64) float64 {
			return 0
		},
	},
}

type NeuralNetwork struct {
	InputNeurons  int
	HiddenNeurons []int
	OutputNeurons int
	Weights       [][][]float64
	Biases        [][]float64
	LearningRate  float64
	Activation    ActivationFunction
}

func (nn *NeuralNetwork) Initialize() {
	rand.Seed(time.Now().UnixNano())

	nn.Weights = make([][][]float64, len(nn.HiddenNeurons)+1)
	nn.Biases = make([][]float64, len(nn.HiddenNeurons)+1)

	nn.Weights[0] = make([][]float64, nn.InputNeurons)
	for i := range nn.Weights[0] {
		nn.Weights[0][i] = make([]float64, nn.HiddenNeurons[0])
		for j := range nn.Weights[0][i] {
			nn.Weights[0][i][j] = rand.Float64()*2 - 1
		}
	}

	for l := 1; l < len(nn.HiddenNeurons); l++ {
		nn.Weights[l] = make([][]float64, nn.HiddenNeurons[l-1])
		for i := range nn.Weights[l] {
			nn.Weights[l][i] = make([]float64, nn.HiddenNeurons[l])
			for j := range nn.Weights[l][i] {
				nn.Weights[l][i][j] = rand.Float64()*2 - 1
			}
		}
	}

	lastLayer := len(nn.HiddenNeurons)
	nn.Weights[lastLayer] = make([][]float64, nn.HiddenNeurons[lastLayer-1])
	for i := range nn.Weights[lastLayer] {
		nn.Weights[lastLayer][i] = make([]float64, nn.OutputNeurons)
		for j := range nn.Weights[lastLayer][i] {
			nn.Weights[lastLayer][i][j] = rand.Float64()*2 - 1
		}
	}

	for l := range nn.Biases {
		layerSize := 0
		if l < len(nn.HiddenNeurons) {
			layerSize = nn.HiddenNeurons[l]
		} else {
			layerSize = nn.OutputNeurons
		}
		nn.Biases[l] = make([]float64, layerSize)
		for j := range nn.Biases[l] {
			nn.Biases[l][j] = rand.Float64()*2 - 1
		}
	}
}

func (nn *NeuralNetwork) Feedforward(inputs []float64) ([][]float64, [][]float64) {
	activations := make([][]float64, len(nn.Weights)+1)
	zValues := make([][]float64, len(nn.Weights))

	activations[0] = inputs

	for l := 0; l < len(nn.Weights); l++ {
		layerSize := len(nn.Weights[l][0])
		zValues[l] = make([]float64, layerSize)
		activations[l+1] = make([]float64, layerSize)

		for j := 0; j < layerSize; j++ {
			sum := 0.0
			for i := 0; i < len(nn.Weights[l]); i++ {
				sum += activations[l][i] * nn.Weights[l][i][j]
			}
			sum += nn.Biases[l][j]
			zValues[l][j] = sum
			activations[l+1][j] = nn.Activation.Activate(sum)
		}
	}

	return activations, zValues
}

func (nn *NeuralNetwork) Predict(inputs []float64) []float64 {
	activations, _ := nn.Feedforward(inputs)
	return activations[len(activations)-1]
}

func (nn *NeuralNetwork) Backpropagate(inputs, targets []float64) {
	activations, _ := nn.Feedforward(inputs)

	outputErrors := make([]float64, nn.OutputNeurons)
	for k := 0; k < nn.OutputNeurons; k++ {
		outputErrors[k] = targets[k] - activations[len(nn.Weights)][k]
	}

	gradients := make([][]float64, len(nn.Weights))
	for l := len(nn.Weights) - 1; l >= 0; l-- {
		layerSize := len(nn.Weights[l][0])
		gradients[l] = make([]float64, layerSize)

		for j := 0; j < layerSize; j++ {
			error := 0.0
			if l == len(nn.Weights)-1 {
				error = outputErrors[j]
			} else {
				for k := 0; k < len(nn.Weights[l+1][j]); k++ {
					error += gradients[l+1][k] * nn.Weights[l+1][j][k]
				}
			}
			gradients[l][j] = error * nn.Activation.Derivative(activations[l+1][j])
		}

		for i := 0; i < len(nn.Weights[l]); i++ {
			for j := 0; j < len(nn.Weights[l][i]); j++ {
				nn.Weights[l][i][j] += nn.LearningRate * gradients[l][j] * activations[l][i]
			}
		}
		for j := 0; j < len(nn.Biases[l]); j++ {
			nn.Biases[l][j] += nn.LearningRate * gradients[l][j]
		}
	}
}

type TrainingData struct {
	Inputs  []float64
	Targets []float64
}

func (nn *NeuralNetwork) Train(
	data []TrainingData, epochs int,
) {
	for epoch := 0; epoch < epochs; epoch++ {
		for _, sample := range data {
			nn.Backpropagate(sample.Inputs, sample.Targets)
		}
		if epoch%10 == 0 {
			fmt.Println(epoch)
		}
	}
}
