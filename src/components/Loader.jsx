import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { useLoader } from './LoaderContext';

export default function Loader() {
    const { loading } = useLoader();

    return (
        <Spinner
            visible={loading}
            // textContent={'Loading...'}
            textStyle={{ color: '#fff' }}
            animation="fade"
            overlayColor="rgba(0, 0, 0, 0.6)"
        />
    );
}
