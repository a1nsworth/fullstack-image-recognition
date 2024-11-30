import {useState, useEffect, useRef} from 'react';
import styles from './NeuralNetwork.module.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import CanvasComponent from "./CanvasComponent.tsx";
import axios from 'axios';
import canvasComponent from "./CanvasComponent.tsx";

enum ActivationFunction {
    Sigmoid = 'sigmoid',
    ReLU = 'relu',
    Tanh = 'tanh',
}

const NeuralNetworkComponent = () => {
    const [learningRate, setLearningRate] = useState<number>(0.1);
    const [epochs, setEpochs] = useState<number>(100);
    const [layers, setLayers] = useState<{ neurons: number }[]>([{neurons: 100}]); // Массив слоев
    const [activationFunction, setActivationFunction] = useState<ActivationFunction>(ActivationFunction.Sigmoid);
    const [formulaRendered, setFormulaRendered] = useState<string>('');

    const [predictions, setPredictions] = useState<any>(null); // Результаты предсказания
    const [imageBlob, setImageBlob] = useState<Blob | null>(null); // Храним Blob изображения
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handlePrediction = async () => {
        if (!imageBlob) {
            alert("Draw smt")
            return;
        }

        const formData = new FormData();
        formData.append('image', imageBlob, 'image.png');

        try {
            console.log("Отправка изображения на сервер...");

            const response = await axios.post('http://localhost:8080/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Ответ от сервера:", response.data);  // Логируем весь ответ от сервера

            // Проверяем, есть ли в ответе ключ 'predictions'
            if (response.data && response.data.predictions) {
                setPredictions(response.data.predictions);
            } else {
                alert('Ошибка: Предсказания не получены');
            }
        } catch (error) {
            console.error('Ошибка при отправке изображения:', error);
            alert('Ошибка при отправке изображения');
        }
    };

    const handleGetImageAndPredict = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
        if (!imageBlob) {
            alert("No blob")
        }
        setImageBlob(imageBlob);
        await handlePrediction();
    };

    const renderPredictions = () => {
        if (!predictions) return null;

        return (
            <div className={styles.predictions}>
                <h3>Результаты предсказания:</h3>
                <ul>
                    {Object.entries(predictions).map(([emotion, score]) => (
                        <li key={emotion}>
                            <strong>{emotion}</strong>: {score.toFixed(4)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    const getActivationInfo = (activation: ActivationFunction) => {
        switch (activation) {
            case ActivationFunction.Sigmoid:
                return {
                    name: 'Сигмоидальная',
                    formula: 'f(x) = \\frac{1}{1 + e^{-x}}',
                };
            case ActivationFunction.ReLU:
                return {
                    name: 'ReLU',
                    formula: 'f(x) = \\max(0, x)',
                };
            case ActivationFunction.Tanh:
                return {
                    name: 'Тангенс гиперболический (tanh)',
                    formula: 'f(x) = \\frac{e^{x} - e^{-x}}{e^{x} + e^{-x}}',
                };
            default:
                return {name: '', formula: ''};
        }
    };

    const activationInfo = getActivationInfo(activationFunction);

    useEffect(() => {
        setFormulaRendered(
            katex.renderToString(activationInfo.formula, {
                throwOnError: false,
            })
        );
    }, [activationInfo.formula]);

    // Добавить слой
    const addLayer = () => {
        setLayers([...layers, {neurons: 100}]);
    };

    // Удалить слой
    const removeLayer = (index: number) => {
        setLayers(layers.filter((_, i) => i !== index));
    };

    // Обработчик изменения количества нейронов в слое
    const handleNeuronChange = (index: number, value: number) => {
        const newLayers = [...layers];
        newLayers[index].neurons = value;
        setLayers(newLayers);
    };

    const handleStartTraining = async () => {
        const requestBody = {
            hiddenNeurons: layers.map(layer => layer.neurons),
            outputNeurons: 10,
            learningRate: learningRate,
            activation: activationFunction,
        };

        try {
            const response = await fetch('http://localhost:8080/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            alert(`Обучение завершено: ${JSON.stringify(data)}`);
        } catch (error) {
            alert(`Ошибка при обучении: ${error}`);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Нейронная сеть для распознавания эмодзи</h1>

            <div className={styles.settings}>
                <div className={styles.inputGroup}>
                    <label>Норма обучения:</label>
                    <input
                        type="number"
                        value={learningRate}
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Количество эпох:</label>
                    <input
                        type="number"
                        value={epochs}
                        onChange={(e) => setEpochs(parseInt(e.target.value))}
                        min="1"
                        className={styles.input}
                    />
                </div>

                <div className={styles.layerSettings}>
                    <label>Количество слоев:</label>
                    {layers.map((layer, index) => (
                        <div key={index} className={styles.layerInputGroup}>
                            <label>Нейронов в слое {index + 1}:</label>
                            <input
                                type="number"
                                value={layer.neurons}
                                onChange={(e) => handleNeuronChange(index, parseInt(e.target.value))}
                                min="1"
                                className={styles.input}
                            />
                            <button onClick={() => removeLayer(index)} className={styles.removeLayerBtn}>
                                Удалить слой
                            </button>
                        </div>
                    ))}
                    <button onClick={addLayer} className={styles.addLayerBtn}>Добавить слой</button>
                </div>

                <div className={styles.inputGroup}>
                    <label>Функция активации:</label>
                    <select
                        value={activationFunction}
                        onChange={(e) => setActivationFunction(e.target.value as ActivationFunction)}
                        className={styles.input}
                    >
                        {Object.values(ActivationFunction).map((activation) => (
                            <option key={activation} value={activation}>
                                {activation.charAt(0).toUpperCase() + activation.slice(1)}
                            </option>
                        ))}
                    </select>
                    <div className={styles.activationInfo}>
                        <p><strong>Функция:</strong> {activationInfo.name}</p>
                        <div
                            className={styles.formula}
                            dangerouslySetInnerHTML={{__html: formulaRendered}}
                        />
                    </div>
                </div>
            </div>

            <CanvasComponent canvasRef={canvasRef}/>

            {renderPredictions()}
            <div className={styles.buttons}>
                <button onClick={handleStartTraining} className={styles.startBtn}>
                    Обучить
                </button>
                <button onClick={handleGetImageAndPredict} className={styles.startBtn}>
                    Предсказать
                </button>
            </div>
        </div>
    );
};

export default NeuralNetworkComponent;
