import React from 'react';
import { StatusBar } from 'react-native';
import App from './App';

export default function AppEntry() {
  return (
    <>
      <StatusBar translucent />
      <App />
    </>
  );
}
