import React, {useState} from 'react';
import styles from './CanvasComponent.module.css';

const CanvasComponent = ({canvasRef}: { canvasRef: React.RefObject<HTMLCanvasElement> }) => {
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className={styles.drawingArea}>
            <h3>Рисуйте смайлик:</h3>
            <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className={styles.canvas}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <button onClick={clearCanvas} className={styles.clearBtn}>
                Очистить
            </button>
        </div>
    );
};

export default CanvasComponent;
