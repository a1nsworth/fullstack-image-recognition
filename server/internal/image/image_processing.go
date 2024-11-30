package image

import (
	"image"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"awesomeProject/internal/neuralnetwork"

	"github.com/nfnt/resize"
)

func LoadImage(filePath string) (image.Image, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	img, err := png.Decode(file)
	if err != nil {
		return nil, err
	}

	return img, nil
}

func ImageToArray(img image.Image) ([]float64, int, int) {
	bounds := img.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y
	data := make([]float64, (bounds.Max.X-bounds.Min.X)*(bounds.Max.Y-bounds.Min.Y)*4)

	i := 0
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			r, g, b, a := img.At(x, y).RGBA()
			data[i] = float64(uint8(r))
			data[i+1] = float64(uint8(g))
			data[i+2] = float64(uint8(b))
			data[i+3] = float64(uint8(a))
			i += 4
		}
	}
	return data, width, height
}

func ResizeImage(img image.Image, width, height int) image.Image {
	return resize.Resize(uint(width), uint(height), img, resize.Lanczos3)
}

func GetClassFromFilename(filename string) int {
	switch {
	case strings.Contains(filename, "angry"):
		return 0
	case strings.Contains(filename, "clown"):
		return 1
	case strings.Contains(filename, "crying"):
		return 2
	case strings.Contains(filename, "cute"):
		return 3
	case strings.Contains(filename, "embarrassment"):
		return 4
	case strings.Contains(filename, "lovely"):
		return 5
	case strings.Contains(filename, "rich"):
		return 6
	case strings.Contains(filename, "sad"):
		return 7
	case strings.Contains(filename, "smile"):
		return 8
	case strings.Contains(filename, "vigilant"):
		return 9
	default:
		return -1
	}
}

func ClassToOneHot(class int) []float64 {
	oneHot := make([]float64, 10)
	if class >= 0 && class < 10 {
		oneHot[class] = 1.0
	}
	return oneHot
}

func LoadDataFromFolder(folderPath string) ([]neuralnetwork.TrainingData, error) {
	var data []neuralnetwork.TrainingData

	err := filepath.Walk(
		folderPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if !info.IsDir() {
				img, err := LoadImage(path)
				if err != nil {
					return err
				}
				img = ResizeImage(img, 100, 100)
				inputs, _, _ := ImageToArray(img)
				class := GetClassFromFilename(info.Name())
				targets := ClassToOneHot(class)

				data = append(
					data, neuralnetwork.TrainingData{inputs, targets},
				)
			}
			return nil
		},
	)

	if err != nil {
		return nil, err
	}
	return data, nil
}
