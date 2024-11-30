import {useEffect} from 'react';

const MatrixBackground = () => {
    useEffect(() => {
        const canvas = document.getElementById('matrixCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Функция для обновления размеров канваса
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Изначальная установка размеров
        resizeCanvas();

        const columns = Math.floor(canvas.width / 20); // Количество колонок

        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charArray = chars.split('');

        const drops = Array(columns).fill(0);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00f7b1';
            ctx.font = '18px monospace';

            for (let i = 0; i < columns; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];
                const x = i * 20;
                const y = drops[i] * 20;
                ctx.fillText(text, x, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        // Обновление размеров канваса при изменении размера окна
        window.addEventListener('resize', resizeCanvas);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas id="matrixCanvas" className="matrixBackground"/>;
};

export default MatrixBackground;
