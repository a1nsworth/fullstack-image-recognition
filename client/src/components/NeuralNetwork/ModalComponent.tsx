import React from 'react';
import styles from './ModalComponent.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    content: string | React.ReactNode;
}

const ModalComponent: React.FC<ModalProps> = ({isOpen, onClose, title, content}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                {title && <h3 className={styles.modalTitle}>{title}</h3>}
                <div className={styles.modalContent}>{content}</div>
                <button className={styles.closeBtn} onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default ModalComponent;
