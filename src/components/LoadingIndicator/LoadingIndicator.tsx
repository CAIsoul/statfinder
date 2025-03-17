import { Spin } from 'antd';
import { useLoading } from './LoadingContext';

function LoadingIndicator() {
    const { loading } = useLoading();

    if (!loading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
        }}>
            <Spin size='large' />
        </div>
    );
}

export default LoadingIndicator;