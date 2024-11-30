import React from 'react';
import styles from './InputBox.module.css';

interface InputBoxProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    step?: number;
    type?: 'number' | 'text';
}

const InputBox: React.FC<InputBoxProps> = ({
                                               label,
                                               value,
                                               onChange,
                                               min = 1,
                                               step = 1,
                                               type = 'number',
                                           }) => {
    return (
        <div className={styles.inputGroup}>
            <label>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                min={min}
                step={step}
                className={styles.input}
            />
        </div>
    );
};

export default InputBox;
