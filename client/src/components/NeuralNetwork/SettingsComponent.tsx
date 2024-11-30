// SettingsComponent.tsx
import React from 'react';
import styles from './SettingsComponent.module.css';

interface SettingsProps {
    learningRate: number;
    epochs: number;
    hiddenLayers: number;
    activationFunction: string;
    onLearningRateChange: (value: number) => void;
    onEpochsChange: (value: number) => void;
    onHiddenLayersChange: (value: number) => void;
    onActivationChange: (value: string) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({
    learningRate,
    epochs,
    hiddenLayers,
    activationFunction,
    onLearningRateChange,
    onEpochsChange,
    onHiddenLayersChange,
    onActivationChange,
}) => {
    return (
        <div className={styles.settings}>
            <div className={styles.inputGroup}>
                <label>Норма обучения:</label>
                <input
                    type="number"
                    value={learningRate}
                    onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
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
                    onChange={(e) => onEpochsChange(parseInt(e.target.value))}
                    min="1"
                    className={styles.input}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Количество скрытых слоев:</label>
                <input
                    type="number"
                    value={hiddenLayers}
                    onChange={(e) => onHiddenLayersChange(parseInt(e.target.value))}
                    min="1"
                    className={styles.input}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Функция активации:</label>
                <select
                    value={activationFunction}
                    onChange={(e) => onActivationChange(e.target.value)}
                    className={styles.input}
                >
                    <option value="sigmoid">Sigmoid</option>
                    <option value="relu">ReLU</option>
                    <option value="tanh">Tanh</option>
                </select>
            </div>
        </div>
    );
};

export default SettingsComponent;
